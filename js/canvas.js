async function add_empties() {
    const response = await fetch(FD_API_URL + "position/free", {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const empties = await response.json();

    for (let i = 0; i < empties.length; i++) {
        let empty = empties[i];
        let coordKey = `${empty['x']},${empty['y']}`;

        // Check if the coordinate already exists
        let element = create_empty([empty['x'], empty['y']]);

        console.log(empty.id)
        console.log(" in cells ? " + empty['id'] in cells);

        if(!(empty.id in cells)) {
            cells[empty.id] = {
                "elem": element,
                "x": empty['x'],
                "y": empty['y'],
                "id": empty.id
            };

            container.appendChild(element);
        }

    }

    updateDivPositions();
}

function show_empties() {
    const emptyGridCells = document.querySelectorAll('.gridcell[state="empty"]');
    emptyGridCells.forEach(cell => cell.style.display = "flex");
}


async function add_cards() {
    const response = await fetch(FD_API_URL + "cards", {
        method: 'GET'
    });


    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cards = await response.json();

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i]
        let media_url = FD_API_URL + "media/"+card['media_path']
        let element = create_card(media_url, card['title'], card['text'], card['id'])

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

    //TODO move ?
    const cardId = new URLSearchParams(window.location.search).get('card');
    if(cardId) {
        zoom_to_card(cardId, card_focus_zoom_level);
    } else {
        updateDivPositions();
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
