document.querySelectorAll('input[name="sortOption"]').forEach((elem) => {
    elem.addEventListener("change", function(event) {
        const value = event.target.value;
        const customOptions = document.getElementById("customOptions");
        if (value === "Custom") {
            customOptions.style.display = "block";
        } else {
            customOptions.style.display = "none";
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var okButton = document.getElementById('okButton');
    var xLabelInput = document.getElementById('xLabelInput');
    var yLabelInput = document.getElementById('yLabelInput');

    okButton.onclick = function() {
        customSort(xLabelInput.value, yLabelInput.value)
    }

    var gridButton = document.getElementById('gridButton');
    gridButton.onclick = function() {
        hideAxis();
        remove_all();
        add_empties();
        add_cards();
    }
});
