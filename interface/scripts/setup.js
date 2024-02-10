function setup() {
    for (let i = 0; i < grid_height*grid_width; i++) {
        let div = create_cell(i);
        imgs.push(div);
        container.appendChild(div);
    }

    setupCamera();
    updateDivPositions();
}

window.onload = setup;
