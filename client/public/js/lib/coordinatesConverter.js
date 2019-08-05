export function cartesian2Polar(x, y) {
    return {
        distance: Math.sqrt(x*x + y*y),
        angle: - Math.atan2(y, x) * 180 / Math.PI
    };
};

export function polar2Cartesian(distance, angle) {
    let radians = - angle * Math.PI / 180;
    return {
        x: distance * Math.cos(radians),
        y: distance * Math.sin(radians)
    };
};
