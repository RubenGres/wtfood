// check if we are on a mobile phone
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if(isMobile) {
    const shorterSide = Math.min(window.visualViewport.width, window.visualViewport.height);
    const mobileSize = Math.round(shorterSide * 0.85);
    cell_w = mobileSize;
    cell_h = mobileSize;
}

// global cell list that will contain all the cards
let cells = [];

var container = document.getElementById('foodmap');
var camerainput = document.getElementById('camerainput');

async function setup() {
    add_empties();
    add_cards();
}

window.onload = setup;
