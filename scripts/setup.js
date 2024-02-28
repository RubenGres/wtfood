let imgs = [];

var container = document.getElementById('foodmap');
var camerainput = document.getElementById('camerainput');

function setup() {
    for (let i = 0; i < grid_height*grid_width; i++) {
        let div = create_cell(i);
        imgs.push(div);
        container.appendChild(div);
    }

    updateDivPositions();
}

window.onload = setup;
