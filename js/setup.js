// check if we are on a mobile phone
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if(isMobile) {
    const shorterSide = Math.min(window.visualViewport.width, window.visualViewport.height);
    const mobileSize = Math.round(shorterSide * 0.85);
    cell_w = mobileSize;
    cell_h = mobileSize;

    let cp = document.getElementById("controlpanel");
    cp.remove();  
}


async function checkApiAvailability() {
    const response = await fetch(FD_API_URL, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}

// global cell list that will contain all the cards
let cells = [];

const container = document.getElementById('foodmap');
const camerainput = document.getElementById('camerainput');

async function setup() {
    add_empties();
    add_cards();
}

window.onload = function() {
    function attemptApiCheck(apiUrl) {
        checkApiAvailability(apiUrl).then(response => {
            setup();
        })
        .catch(error => {
            container.innerHTML = `Error: API at <b>"${apiUrl}"</b> is not responding, make sure it is running. <br> <br>`;
            
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = 'apiUrlInput';
            inputField.placeholder = 'Enter new API URL';
            container.appendChild(inputField);

            const submitButton = document.createElement('button');
            submitButton.innerText = 'Retry';
            container.appendChild(submitButton);

            submitButton.onclick = function() {
                FD_API_URL = document.getElementById('apiUrlInput').value;
                container.innerHTML = '';
                attemptApiCheck(FD_API_URL);
            }
        });
    }

    attemptApiCheck(FD_API_URL);
};
