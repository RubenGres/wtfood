// check if we are on a mobile phone
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if(isMobile) {
    const shorterSide = Math.min(window.visualViewport.width, window.visualViewport.height);
    const mobileSize = Math.round(shorterSide * 0.85);
    cell_w = mobileSize;
    cell_h = mobileSize;

    card_focus_zoom_level = 1;
} else {
    card_focus_zoom_level = CARD_ZOOM_LEVEL * Math.min(window.innerWidth, window.innerHeight) / (cell_w + cell_margin);
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

// global cell dict that will contain all the cards
let cells = {};

const container = document.getElementById('foodmap');
const camerainput = document.getElementById('camerainput');

async function setup() {
    add_empties();
    add_cards();
    
    const cardId = new URLSearchParams(window.location.search).get('card');
    if(cardId) {
        focus_on_card(cardId);
    } else {
        if(isMobile)
            focus_on_random_empty();
        updateDivPositions();
    }
    
    loopFireflyAnimation();
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
