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
    const maxShadowDistance = 8;
    const maxExtension = 400;
    let lastRegionAverage = [];
    let lastShadowOffset = { x: 0, y: 0 };

    // dark mode variables
    let inDarkMode = false;
    const lightModeTriggerValue = 160;
    const darkModeTriggerValue = 72;

    // timer interval variables
    let timer = null;
    const updateRate = 250;

    (function init() {
        initCanvasElements();
        initCameraDevice();

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
        displayCtx.fillRect(0, 0, $regionsDisplay.width(), $regionsDisplay.height());
    };

    function initCameraDevice() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(webcamConstants)
                .then((stream) => {
                    $webcam[0].srcObject = stream;
                }).catch(e => {
                    console.error(`navigator.getUserMedia error: ${e.toString()}`);
                });
        }
    };


    $toggleUpdateButton.click(event => {
        let attrName = 'stopped-updates';

        if ($toggleUpdateButton.attr(attrName)) {
            $toggleUpdateButton.removeAttr(attrName);
            $toggleUpdateButton.text('Stop Updates');
            startShadowUpdates();
        } else {
            $toggleUpdateButton.attr(attrName, true);
            $toggleUpdateButton.text('Start Updates');
            stopShadowUpdates();
        }
    });

    function startShadowUpdates() {
        timer = window.setInterval(() => {
            let offsets = calculateShadowOffset();

            // adjust for effective offset based on skewed camera format
            offsets.x *= $webcam.width() / $webcam.height();

            let shadowAlpha = 0.2;
            if (lastRegionAverage) {
                displayRegionAverages(lastRegionAverage);
                let maxBrightness = updateDarkMode(lastRegionAverage);
                shadowAlpha = calculateShadowAlpha(lastRegionAverage, maxBrightness);
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
        filterGrayscale(imageData.data);
        context.putImageData(imageData, 0, 0);

        return getBrightnessGradient(imageData.data, width, height);
    };

    function filterGrayscale(data) {
        for (let i = 0; i < data.length; i+= 4) {
            let gray = 0.21 * data[i] + 0.72 * data[i+1] + 0.07 * data[i+2];
            data[i] = gray; // red
            data[i+1] = gray; // green
            data[i+2] = gray; // blue
            data[i+3] = 255; // alpha
        }
    };

    function getBrightnessGradient(data, width, height) {
        let regionAverageArray = calculateAverageForRegions(data, width, height);
        lastRegionAverage = regionAverageArray;

        let xGradient = convolveWithKernel(regionAverageArray, [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ]);
        let yGradient = convolveWithKernel(regionAverageArray, [
            1, 2, 1,
            0, 0, 0,
            -1, -2, -1
        ]);

        return {x: xGradient, y: yGradient};
    };

    function calculateAverageForRegions(data, width, height) {
        let widthPerRegion = width / 3;
        let heightPerRegion = height / 3;
        let regionAverageArray = [
            0, 0, 0,
            0, 0, 0,
            0, 0, 0
        ];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                let dataIndex = (x + y * width) * 4;
                let currentValue = data[dataIndex];

                let regionX = Math.floor(x / widthPerRegion);
                let regionY = Math.floor(y / heightPerRegion);

                regionIndex = (regionX + regionY * 3);
                regionAverageArray[regionIndex] += currentValue;
            }
        }

        regionAverageArray.forEach((value, index, array) => {
            array[index] = value / (widthPerRegion * heightPerRegion);
        });
        return regionAverageArray;
    };

    function convolveWithKernel(data, kernel) {
        let result = 0;
        for (let i = 0; i < kernel.length; i++) {
            result += data[i] * kernel[i];
        }
        return result;
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
        maxBrightness = 0;
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

        let lightSources = lastRegionAverage.filter(value => value > maxBrightness * 0.8).length;

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
        let shadowX = - Math.round(shadowOffsets.x);
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
        if (hasChanged) {
            $('.item').each((index, element) => {
                $(element).css('box-shadow',
                    `${shadowX}px ${shadowY}px 5px rgba(0, 0, 0, ${alpha})`);
            });
        }
    };

    function normalizeShadowOffset(offsets) {
        // convert to polar coordinates
        let polar = cartesian2Polar(offsets.x, offsets.y);

        // cap distance to max extension
        let shadowDistance = Math.min(polar.distance, maxExtension);
        // map extension [0, maxExtension] to [0, maxShadowDistance]
        shadowDistance = shadowDistance / maxExtension * maxShadowDistance;

        polar.distance = shadowDistance;
        return polar2Cartesian(polar.distance, polar.angle);
    };

    function cartesian2Polar(x, y) {
        return {
            distance: Math.sqrt(x*x + y*y),
            angle: - Math.atan2(y, x) * 180 / Math.PI
        };
    };

    function polar2Cartesian(distance, angle) {
        let radians = - angle * Math.PI / 180;
        return {
            x: distance * Math.cos(radians),
            y: distance * Math.sin(radians)
        };
    };

});
