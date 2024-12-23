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
        let coordKey = `e${empty['x']},${empty['y']}`;

        // Check if the coordinate already exists
        if(!(coordKey in cells)) {
            let element = create_empty([empty['x'], empty['y']]);
            
            cells[coordKey] = {
                "elem": element,
                "x": empty['x'],
                "y": empty['y'],
                "id": coordKey
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
    var json_path = WTFOOD_STATUS == "RUNNING" ? FD_API_URL + "cards" : "json/cards.json";
    
    const response = await fetch(json_path, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cards = await response.json();

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i]
        
        // ignore if card already exist for this id
        if(cells[card['id']] != undefined) {
            console.log("card" + card['id'] + "already exist")
            continue
        }

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
