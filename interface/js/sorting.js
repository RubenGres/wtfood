function displayAxis(xLabel, yLabel) {
    document.getElementById("axis-cont").style.display = "block";
    document.getElementById("x-axis").children[0].innerText = xLabel;
    document.getElementById("y-axis").children[0].innerText = yLabel;
}

function hideAxis() {
    document.getElementById("axis-cont").style.display = "none";
}

function customSort(xLabel, yLabel) {
    const apiUrl = `${FD_API_URL}sort?x=${encodeURIComponent(xLabel)}&y=${encodeURIComponent(yLabel)}`;
    
    displayAxis(xLabel, yLabel);

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            remove_empties();

            const scale = Math.ceil(Math.sqrt(cells.length));
            
            cells.forEach(cell => {
                cell.elem.classList.add('cell-sorting');

                if(data[cell.id]) {
                    cell.x = data[cell.id].x * scale;
                    cell.y = data[cell.id].y * scale;
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