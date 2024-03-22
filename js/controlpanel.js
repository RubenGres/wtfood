document.addEventListener('DOMContentLoaded', function() {
    var zoomSlider = document.getElementById('zoomSlider');
    zoomSlider.oninput = function() {
        zoom = this.value;
        updateDivPositions();
    };
});
