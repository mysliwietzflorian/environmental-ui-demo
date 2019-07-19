const $selection = $('#selection');
const $items = $('#selection .item');

let width = $selection.css('width').replace(/[^-\d\.]/g, '');
let height = $selection.css('height').replace(/[^-\d\.]/g, '');
let maxExtension = Math.min(width, height);

$selection.click(event => {
    let dx = (Math.random() - 0.5) * 10;
    let dy = (Math.random() - 0.5) * 10;
    // interpolate random between [0.1, 0.5]
    let alpha = Math.random() * (0.5 - 0.1) + 0.1;

    $items.each((index, element) => {
        $(element).css('box-shadow',
            `${dx}px ${dy}px 5px rgba(0, 0, 0, ${alpha})`);
    });
});
