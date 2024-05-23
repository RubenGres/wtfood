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

// global cell dict that will contain all the cards
let cells = {};

const container = document.getElementById('foodmap');
const camerainput = document.getElementById('camerainput');

async function setup() {
    const socket_is_connected = await connect_to_socket();
    
    if(socket_is_connected) {
        await add_empties();
        document.getElementById("archive_label").innerHTML = `SYSTEM STATUS: <span class="green">LIVE</span>`
    } else {
        WTFOOD_STATUS = "ARCHIVE";
        FD_API_URL = "";
        document.getElementById("archive_label").innerHTML = `SYSTEM STATUS: <span class="red">ARCHIVE</span>`
    }

    await add_cards();
    
    setup_control_panel();
    
    const cardId = new URLSearchParams(window.location.search).get('card');
    if(cardId) {
        focus_on_card(cardId);
    } else if(isMobile) {
        focus_on_random_empty();
    }

    updateDivPositions();
    loopFireflyAnimation();
}

window.onload = function() {
    setup();
};
