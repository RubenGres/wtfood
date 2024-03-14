let cells = [];

var container = document.getElementById('foodmap');
var camerainput = document.getElementById('camerainput');

async function setup() {
    add_empties();
    add_cards();
}

window.onload = setup;
