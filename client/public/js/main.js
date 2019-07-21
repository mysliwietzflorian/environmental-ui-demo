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

    const maxShadowDistance = 8;
    // TODO: redefine value of maxExtension
    let maxExtension = 300;

    let timer = null;
    let inDarkMode = false;

    (async function init() {
        let ctx = $canvas[0].getContext('2d');
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, $canvas.width(), $canvas.height());

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(webcamConstants)
                .then((stream) => {
                    $webcam[0].srcObject = stream;
                    $webcam.removeAttr('hidden');
                }).catch(e => {
                    console.error(`navigator.getUserMedia error: ${e.toString()}`);
                });
        }
    })();

    timer = window.setInterval(() => {
        let offsets = calculateShadowOffset();

        // TODO: calculate real offset based on skewed camera format

        if (!inDarkMode) {
            updateShadows(offsets);
        }
    }, 100);

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
        updateImageData(imageData.data);
        context.putImageData(imageData, 0, 0);
    });

    $selection.mousemove(event => {
        if (!enableHandler) {
            return;
        }

        handleMouseMove(event);
        enableHandler = false;
    });

    timer = window.setInterval(() => {
        enableHandler = true;
    }, 250);

    function updateImageData(data) {
        filterGrayscale(data);
    };

    function filterGrayscale(data) {
        // Gray = 0.21R + 0.72G + 0.07B // Luminosity
        // Gray = (R + G + B) ÷ 3 // Average Brightness
        // Gray = 0.299R + 0.587G + 0.114B // rec601 standard
        // Gray = 0.2126R + 0.7152G + 0.0722B // ITU-R BT.709 standard
        // Gray = 0.2627R + 0.6780G + 0.0593B // ITU-R BT.2100 standard

        for (let i = 0; i < data.length; i+= 4) {
            let gray = 0.21*data[i] + 0.72*data[i+1] + 0.07*data[i+2];
            data[i] = gray;
            data[i+1] = gray;
            data[i+2] = gray;
        }
    };

    function handleMouseMove(event) {
        let shadowOffset = calculateShadowOffset(event);
        let shadowX = Math.round(shadowOffset.x);
        let shadowY = Math.round(shadowOffset.y);

        $items.each((index, element) => {
            $(element).css('box-shadow',
                `${shadowX}px ${shadowY}px 5px rgba(0, 0, 0, 0.2)`);
        });
    };

    function calculateShadowOffset(event) {
        // offsets from center of element
        let dx = event.pageX - $selection.offset().left - width / 2;
        let dy = event.pageY - $selection.offset().top - height / 2;

        // convert to polar coordinates
        let polar = cartesian2Polar(dx, dy);
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
