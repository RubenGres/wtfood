function displayAxis(xLabel, yLabel) {
    document.getElementById("axis-cont").style.display = "block";
    document.getElementById("x-axis").children[0].innerText = xLabel;
    document.getElementById("y-axis").children[0].innerText = yLabel;
}

function hideAxis() {
    document.getElementById("axis-cont").style.display = "none";
}

function customSort(xLabel, yLabel) {
    // TODO sorting offline
    const sorting_path = "sorting/sortings.json";
    
    displayAxis(xLabel, yLabel);

    fetch(sorting_path)
        .then(response => response.json())
        .then(data => {
            const scale = Math.ceil(Math.sqrt(Object.values(cells).length));
            
            Object.values(cells).forEach(cell => {
                cell["elem"].classList.add('cell-sorting');


                if(data[xLabel][cell.id]) {
                    cell.x = data[xLabel][cell.id] * scale;
                }

                if(data[yLabel][cell.id]) {
                    cell.y = data[yLabel][cell.id] * scale;
                }
                
                setTimeout(() => {
                    cell.elem.classList.remove('cell-sorting');
                }, 1000);
            });

            updateDivPositions();
        })
        .catch(error => {
            console.error('Error:', error); // Handle any errors
        });

}

function reposition_on_grid() {
    
    Object.values(cells).forEach(cell => {
        
        // if not empty cell, move it to initial position
        if(cell.elem.getAttribute("state") != "empty") {
            cell.elem.classList.add('cell-sorting');
            cell.x = cell.init_x;
            cell.y = cell.init_y;
            setTimeout(() => {
                cell.elem.classList.remove('cell-sorting');
                }, 1000);
            }
        }

    );

    updateDivPositions();
}
