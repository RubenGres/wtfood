function populateDropdown() {
    const dropdown_x = document.getElementById('xLabelInput');
    const dropdown_y = document.getElementById('yLabelInput');
    
    // Iterate through the list and create option elements
    predifined_labels.forEach(item => {
        const option_x = document.createElement('option');
        option_x.value = item;
        option_x.textContent = item;
        dropdown_x.appendChild(option_x);
        
        const option_y = document.createElement('option');
        option_y.value = item;
        option_y.textContent = item;
        dropdown_y.appendChild(option_y);
    });
}

// Call the function to populate the dropdown when the page loads
document.addEventListener('DOMContentLoaded', populateDropdown);

function sort_from_labels() {
    var xLabelInput = document.getElementById('xLabelInput').value;
    var yLabelInput = document.getElementById('yLabelInput').value;

    if(!xLabelInput) {
        xLabelInput = predifined_labels[Math.floor(Math.random() * predifined_labels.length)];
    }
    
    if (!yLabelInput) {
        yLabelInput = predifined_labels[Math.floor(Math.random() * predifined_labels.length)];
    }

    console.log(xLabelInput);

    customSort(xLabelInput, yLabelInput)
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


document.addEventListener('DOMContentLoaded', function() {
    var gridButton = document.getElementById('gridButton');
    gridButton.onclick = function() {
        hideAxis();
        reposition_on_grid();
    }
    
    var customButton = document.getElementById('customButton');
    customButton.onclick = function() {
        const dropdown_x = document.getElementById('xLabelInput');
        const randomIndex_x = Math.floor(Math.random() * dropdown_x.options.length);
        dropdown_x.selectedIndex = randomIndex_x;
        
        const dropdown_y = document.getElementById('yLabelInput');
        const randomIndex_y = Math.floor(Math.random() * dropdown_y.options.length);
        dropdown_y.selectedIndex = randomIndex_y;
        
        sort_from_labels();
    }

    const dropwdowns = document.querySelectorAll('#xLabelInput, #yLabelInput');
    dropwdowns.forEach((input) => {
    input.addEventListener('change', function(event) {
        sort_from_labels();
    });
});
});
