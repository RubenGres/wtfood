function sort_from_labels() {
    var xLabelInput = document.getElementById('xLabelInput');
    var yLabelInput = document.getElementById('yLabelInput');

    if(!xLabelInput.value) {
        xLabelInput.value = predifined_labels[Math.floor(Math.random() * predifined_labels.length)];
    }
    
    if (!yLabelInput.value) {
        yLabelInput.value = predifined_labels[Math.floor(Math.random() * predifined_labels.length)];
    }

    customSort(xLabelInput.value, yLabelInput.value)
}


document.querySelectorAll('input[name="sortOption"]').forEach((elem) => {
    elem.addEventListener('click', function() {
        const customOptions = document.getElementById("customOptions");
        if (this.value === "SORT") {
            customOptions.style.display = "flex";
        } else {
            customOptions.style.display = "none";
        }
    });
});

// Event listeners for the input fields to select all text on focus
const inputs = document.querySelectorAll('#xLabelInput, #yLabelInput');
inputs.forEach((input) => {
    input.addEventListener('focus', function() {
        this.select();
    });

    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('customButton').click();
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
});
