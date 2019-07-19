$(document).ready(function() {

    const webcamConstants = {
        audio: false,
        video: {
            width: 120,
            height: 90,
        }
    };

    const $selection = $('#selection');
    const $items = $('#selection .item');
    const $webcam = $('#webcam');
    const $canvas = $('#canvas');

    const maxShadowDistance = 8;

    let width = $selection.css('width').replace(/[^-\d\.]/g, '');
    let height = $selection.css('height').replace(/[^-\d\.]/g, '');
    let maxExtension = Math.min(width, height) / 2;

    let timer = null;
    let enableHandler = true;

    (async function init() {
        let ctx = $canvas[0].getContext('2d');
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, 0, $canvas.width(), $canvas.height());

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(webcamConstants)
                .then((stream) => {
                    $webcam[0].srcObject = stream;
                    $webcam.removeAttr('hidden');
                    $('#image-placeholder').attr('hidden', true);
                }).catch(e => {
                    console.error(`navigator.getUserMedia error: ${e.toString()}`);
                });
        }
    })();

    $selection.click(event => {
        let width = webcamConstants.video.width;
        let height = webcamConstants.video.height;

        let context = $canvas[0].getContext('2d');
        context.drawImage($webcam[0], 0, 0, width, height);

        var imageData = context.getImageData(0, 0, width, height);
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

    function updateImageData(data) {
    };

    timer = window.setInterval(() => {
        enableHandler = true;
    }, 250);

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
