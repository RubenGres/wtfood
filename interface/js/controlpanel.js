document.addEventListener('DOMContentLoaded', function() {
    var zoomSlider = document.getElementById('zoomSlider');
    zoomSlider.oninput = function() {
        zoom = this.value;
        updateDivPositions();
    };

    var customButton = document.getElementById('customButton');
    var xLabelInput = document.getElementById('xLabelInput');
    var yLabelInput = document.getElementById('yLabelInput');

    customButton.onclick = function() {
        const apiUrl = `${SD_API_URL}sort?x=${encodeURIComponent(xLabelInput.value)}&y=${encodeURIComponent(yLabelInput.value)}`;

        fetch(apiUrl)
            .then(response => response.json()) // Assuming the response is in JSON format
            .then(data => {
                remove_empties();
                
                cells.forEach(cell => {
                    if(data[cell.id]) {
                        cell.x = data[cell.id].x;
                        cell.y = data[cell.id].y;
                    }
                });

                updateDivPositions();
            })
            .catch(error => {
                console.error('Error:', error); // Handle any errors
            });
    }

    var gridButton = document.getElementById('gridButton');
    gridButton.onclick = function() {
        remove_all();
        add_empties();
        add_cards();
    }
});
