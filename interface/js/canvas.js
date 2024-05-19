function show_empties() {
    const emptyGridCells = document.querySelectorAll('.gridcell[state="empty"]');
    emptyGridCells.forEach(cell => cell.style.display = "flex");
}


async function add_cards() {
    const response = await fetch("json/cards.json", {
        method: 'GET'
    });


    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cards = await response.json();

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i]
        
        // ignore if card already exist for this id
        if(cells[card['id']] != undefined)
            continue

        let element = create_card(card['media_path'], card['title'], card['text'], card['id'])

        cells[card['id']] = {
            "elem": element,
            "x": card['x'],
            "y": card['y'],
            "init_x": card['x'],
            "init_y": card['y'],
            "id": card['id']
        };

        container.appendChild(element);
    }
}


async function remove_all() {
    cells = {};
    const gridCells = document.querySelectorAll('.gridcell');
    gridCells.forEach(cell => cell.remove());
}


async function hide_empties() {
    const emptyGridCells = document.querySelectorAll('.gridcell[state="empty"]');
    emptyGridCells.forEach(cell => cell.style.display = "none");
}
