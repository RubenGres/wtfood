function clear_labels() {
    var xLabelInput = document.getElementById('xLabelInput');
    var yLabelInput = document.getElementById('yLabelInput');
    xLabelInput.value = ""
    yLabelInput.value = ""
}



function createInputField() {
    // Create the input element
    var xLabelInput = document.createElement('input');
    xLabelInput.type = 'text';
    xLabelInput.id = 'xLabelInput';
    xLabelInput.placeholder = 'Enter X label';
    document.getElementById('xlabel').appendChild(xLabelInput);

    var yLabelInput = document.createElement('input');
    yLabelInput.type = 'text';
    yLabelInput.id = 'yLabelInput';
    yLabelInput.placeholder = 'Enter X label';
    document.getElementById('ylabel').appendChild(yLabelInput);

    // Event listeners for the input fields to select all text on focus
    const inputs = [xLabelInput, yLabelInput]
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
}


function createDropdown() {
    var dropdown_x = document.createElement("select");
    dropdown_x.id = 'xLabelInput';
    
    var dropdown_y = document.createElement("select");
    dropdown_y.id = 'yLabelInput';
    
    document.getElementById('xlabel').appendChild(dropdown_x);
    document.getElementById('ylabel').appendChild(dropdown_y);

    [dropdown_x, dropdown_y].forEach((input) => {
        input.addEventListener('change', function(e) {
            sort_from_labels();
        });

        // Iterate through the list and create option elements
        predifined_labels.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            input.appendChild(option);
        });
    });
}


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


function setup_control_panel() {
    var gridButton = document.getElementById('gridButton');
    gridButton.onclick = function() {
        reposition_on_grid();
        hideAxis();
        
        // if API is running update the labels as needed
        if(WTFOOD_STATUS == "RUNNING") {
            clear_labels();
            show_empties();
        }
    }
    
    var customButton = document.getElementById('customButton');
    customButton.onclick = function() {
        if(WTFOOD_STATUS == "RUNNING") {
            hide_empties();
        } else {
            // select random element;
            const inputs = document.querySelectorAll('#xLabelInput, #yLabelInput');
            inputs.forEach((input) => {
                const randomIndex_x = Math.floor(Math.random() * input.options.length);
                input.selectedIndex = randomIndex_x;
            });
        }

        sort_from_labels();
    }

    if(WTFOOD_STATUS == "RUNNING") {
        createInputField();
    } else {
        createDropdown();
    }
}
