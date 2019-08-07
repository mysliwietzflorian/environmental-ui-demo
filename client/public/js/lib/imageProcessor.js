let lastRegionAverage = [];

export function getLastRegionAverage() {
    return lastRegionAverage;
}

export function filterGrayscale(data) {
    for (let i = 0; i < data.length; i+= 4) {
        let gray = 0.21 * data[i] + 0.72 * data[i+1] + 0.07 * data[i+2];
        data[i] = gray;
        data[i+1] = gray;
        data[i+2] = gray;
        data[i+3] = 255;
    }
    return data;
};

export function getBrightnessGradient(data, width, height) {
    let regionAverageArray = calculateAverageForRegions(data, width,
        height);
    lastRegionAverage = regionAverageArray;

    let xGradient = convolveWithKernel(regionAverageArray, [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1
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

            let regionIndex = (regionX + regionY * 3);
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
