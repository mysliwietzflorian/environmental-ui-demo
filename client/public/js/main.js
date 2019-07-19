const $selection = $('#selection');
const $items = $('#selection .item');

let width = $selection.css('width').replace(/[^-\d\.]/g, '');
let height = $selection.css('height').replace(/[^-\d\.]/g, '');
let maxExtension = Math.min(width, height);

$selection.click(event => {
    let shadowX = (Math.random() - 0.5) * 10;
    let shadowY = (Math.random() - 0.5) * 10;
    // interpolate random between [0.1, 0.5]
    let alpha = Math.random() * (0.5 - 0.1) + 0.1;

    $items.each((index, element) => {
        $(element).css('box-shadow',
            `${shadowX}px ${shadowY}px 5px rgba(0, 0, 0, 0.2)`);
    });
});
