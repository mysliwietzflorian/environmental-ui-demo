let timer = null;
let delegate = null;
let updateRate = 250;

export function start(func) {
    delegate = func;
    timer = window.setInterval(func, updateRate);
};

export function stop() {
    clearInterval(timer);
};

export function setUpdateRate(rate) {
    updateRate = rate;
    stop();
    start(delegate);
}
