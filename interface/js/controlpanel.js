function sort_from_labels() {
    var xLabelInput = document.getElementById('xLabelInput');
    var yLabelInput = document.getElementById('yLabelInput');
    if(xLabelInput.value != "" && yLabelInput.value != "")
        customSort(xLabelInput.value, yLabelInput.value)
}


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
    var gridButton = document.getElementById('gridButton');
    gridButton.onclick = function() {
        hideAxis();
        show_empties();
        reposition_on_grid();
    }
    
    var customButton = document.getElementById('customButton');
    customButton.onclick = function() {
        hide_empties();
        sort_from_labels();
    }

    var okButton = document.getElementById('okButton');
    okButton.onclick = function() {
        sort_from_labels();
    }
});
