import * as coordinatesConverter from './lib/coordinatesConverter.js';
import * as imageProcessor from './lib/imageProcessor.js';

$(document).ready(function() {

    const webcamConstants = {
        audio: false,
        video: {
            width: 120,
            height: 90,
        }
    };

    const $webcam = $('#webcam');
    const $canvas = $('#canvas');
    const $regionsDisplay = $('#regions-display');
    const $toggleUpdateButton = $('#toggle-update-btn');

    // shadow variables
    let maxShadowDistance = 8;
    let maxExtension = 400;
    let isAlphaAdjusting = true;
    let lightSourceFactor = 0.6;
    let updatedAlphaValue = false;
    let lastShadowOffset = { x: 0, y: 0 };

    // dark mode variables
    let inDarkMode = false;
    let lightModeTriggerValue = 160;
    let darkModeTriggerValue = 72;

    // timer interval variables
    let timer = null;
    let updateRate = 250;

    (function init() {
        initCanvasElements();
        initCameraDevice();
        addEventListeners();

        startShadowUpdates();
    })();

    function initCanvasElements() {
        let canvasCtx = $canvas[0].getContext('2d');
        // mirror canvas
        canvasCtx.translate($canvas.width(), 0);
        canvasCtx.scale(-1, 1);
        canvasCtx.fillStyle = 'rgb(204, 204, 204)';
        canvasCtx.fillRect(0, 0, $canvas.width(), $canvas.height());

        let displayCtx = $regionsDisplay[0].getContext('2d');
        displayCtx.fillStyle = 'rgb(204, 204, 204)';
        displayCtx.fillRect(0, 0, $regionsDisplay.width(),
            $regionsDisplay.height());
    };

    function initCameraDevice() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(webcamConstants)
                .then(stream => {
                    $webcam[0].srcObject = stream;
                }).catch(e => {
                    console.error(`navigator.getUserMedia: ${e.toString()}`);
                });
        }
    };

    function addEventListeners() {
        $toggleUpdateButton.click(event => {
            let attrName = 'stopped-updates';
            if ($toggleUpdateButton.attr(attrName)) {
                $toggleUpdateButton.removeAttr(attrName);
                $toggleUpdateButton.text('Stop updates');
                startShadowUpdates();
            } else {
                $toggleUpdateButton.attr(attrName, true);
                $toggleUpdateButton.text('Start updates');
                stopShadowUpdates();
            }
        });

        $('input').attr('autocomplete', 'off');

        $('.slider').each((index, item) => {
            let input = $(item).find('input');
            input.on('input', event => {
                $(item).find('.slider__input-value').html(
                    $(event.target).val());
            });
            input.trigger('input');
        });

        $('#timer-update-rate').on('input', event => {
            updateRate = $(event.target).val();
            stopShadowUpdates();
            startShadowUpdates();
        });

        $('#max-shadow-distance').on('input', event => {
            maxShadowDistance = $(event.target).val();
        });

        $('#light-mode-trigger').on('input', event => {
            lightModeTriggerValue = $(event.target).val();
        });

        $('#dark-mode-trigger').on('input', event => {
            darkModeTriggerValue = $(event.target).val();
        });

        $('#is-alpha-adjusting').change(event => {
            isAlphaAdjusting = $(event.target).prop('checked');
            $('#light-source-factor').prop('disabled', !isAlphaAdjusting);
        });

        $('#light-source-factor').on('input', event => {
            lightSourceFactor = $(event.target).val();
            updatedAlphaValue = true;
        });
    };

    function startShadowUpdates() {
        timer = window.setInterval(() => {
            let offsets = calculateShadowOffset();

            // adjust for effective offset based on camera format proportions
            offsets.x *= $webcam.width() / $webcam.height();

            let shadowAlpha = 0.2;
            let lastRegionAverage = imageProcessor.getLastRegionAverage();
            if (lastRegionAverage != null) {
                displayRegionAverages(lastRegionAverage);
                let maxBrightness = updateDarkMode(lastRegionAverage);

                if (isAlphaAdjusting) {
                    shadowAlpha = calculateShadowAlpha(lastRegionAverage,
                        maxBrightness);
                }
            }

            if (!inDarkMode) {
                updateShadows(offsets, shadowAlpha);
            }
        }, updateRate);
    };

    function stopShadowUpdates() {
        clearInterval(timer);
    };

    function setDarkMode() {
        $('body').addClass('dark-mode');
        inDarkMode = true;
        $('.item').css('box-shadow', 'none');
    };

    function setLightMode() {
        $('body').removeClass('dark-mode');
        inDarkMode = false;
    };

    function calculateShadowOffset() {
        let width = webcamConstants.video.width;
        let height = webcamConstants.video.height;

        let context = $canvas[0].getContext('2d');
        context.drawImage($webcam[0], 0, 0, width, height);

        let imageData = context.getImageData(0, 0, width, height);
        imageProcessor.filterGrayscale(imageData.data);
        context.putImageData(imageData, 0, 0);

        return imageProcessor.getBrightnessGradient(
            imageData.data, width, height);
    };

    function displayRegionAverages(data) {
        let width = $('#regions-display').width();
        let height = $('#regions-display').height();

        let regionWidth = width / 3;
        let regionHeight = height / 3;
        let ctx = $('#regions-display')[0].getContext('2d');

        for (let i = 0; i < data.length; i++) {
            ctx.fillStyle = `rgb(${data[i]}, ${data[i]}, ${data[i]})`;
            ctx.fillRect(
                (i % 3) * regionWidth,
                Math.floor(i / 3) * regionHeight,
                regionWidth,
                regionHeight
            );
        }
    };

    function updateDarkMode(regionAverageArray) {
        let maxBrightness = 0;
        regionAverageArray.forEach(value => {
            maxBrightness = Math.max(maxBrightness, value);
        });

        if (maxBrightness > lightModeTriggerValue) {
            setLightMode();
        } else if (maxBrightness < darkModeTriggerValue) {
            setDarkMode();
        }

        return maxBrightness;
    };

    function calculateShadowAlpha(lastRegionAverage, maxBrightness) {

        let lightSources = lastRegionAverage.filter(value =>
            value > maxBrightness * lightSourceFactor).length;

        // interpolate from lightsources=[1; 3; 9] to alpha=[0.5; 0.2; 0.1]
        let A, B, C, D;
        if (lightSources > 3) {
            A = 3;
            B = 9;
            C = 0.2;
            D = 0.1;
        } else {
            A = 1;
            B = 3;
            C = 0.5;
            D = 0.2;
        }

        let alpha = (lightSources - A) / (B - A) * (D - C) + C;
        return alpha;
    };

    function updateShadows(offsets, alpha) {
        let shadowOffsets = normalizeShadowOffset(offsets);
        let shadowX = Math.round(shadowOffsets.x);
        let shadowY = Math.round(shadowOffsets.y);

        let hasChanged = false;
        if (lastShadowOffset.x != shadowX) {
            lastShadowOffset.x = shadowX;
            hasChanged = true;
        }
        if (lastShadowOffset.y != shadowY) {
            lastShadowOffset.y = shadowY;
            hasChanged = true;
        }

        // update only if values change
        if (hasChanged || updatedAlphaValue) {
            $('#preview-offsets').html(`x=${shadowX}, y=${shadowY}`);
            $('.item').css('box-shadow',
                `${shadowX}px ${shadowY}px 5px rgba(0, 0, 0, ${alpha})`);
            updatedAlphaValue = false;
        }
    };

    function normalizeShadowOffset(offsets) {
        // convert to polar coordinates
        let polar = coordinatesConverter.cartesian2Polar(offsets.x, offsets.y);

        // cap distance to max extension
        let shadowDistance = Math.min(polar.distance, maxExtension);
        // map extension [0, maxExtension] to [0, maxShadowDistance]
        shadowDistance = shadowDistance / maxExtension * maxShadowDistance;

        polar.distance = shadowDistance;
        return coordinatesConverter.polar2Cartesian(polar.distance,
            polar.angle);
    };

});
