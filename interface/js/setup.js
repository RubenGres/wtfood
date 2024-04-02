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
    const response = await fetch(SD_API_URL + "cards", {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response; // For example, you might want to return the response for further processing
}

// global cell list that will contain all the cards
let cells = [];

var container = document.getElementById('foodmap');
var camerainput = document.getElementById('camerainput');

async function setup() {
    add_empties();
    add_cards();
}

window.onload = checkApiAvailability().then(response => {
    setup();
})
.catch(error => {
    container.innerText = `Error: API at \"${SD_API_URL}\" is not responding, make sur it is running`;
});
;
