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
        context.putImageData(imageData, 0, 0);

        }



    };

        }
    };


            $(element).css('box-shadow',
                `${shadowX}px ${shadowY}px 5px rgba(0, 0, 0, 0.2)`);
        });
    };

        // convert to polar coordinates
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
