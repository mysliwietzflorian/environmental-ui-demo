const $selection = $('#selection');
const $items = $('#selection .item');

const maxShadowDistance = 8;

let width = $selection.css('width').replace(/[^-\d\.]/g, '');
let height = $selection.css('height').replace(/[^-\d\.]/g, '');
let maxExtension = Math.min(width, height) / 2;

$selection.click(event => {
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
    let cartesian = polar2Cartesian(polar.distance, polar.angle);
    let shadowX = Math.round(cartesian.x);
    let shadowY = Math.round(cartesian.y);

    $items.each((index, element) => {
        $(element).css('box-shadow',
            `${shadowX}px ${shadowY}px 5px rgba(0, 0, 0, 0.2)`);
    });
});

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
