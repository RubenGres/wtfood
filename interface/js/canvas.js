async function add_empties() {
    // Use a Set to keep track of existing coordinates in a "x,y" string format.
    const existingCoords = new Set(cells.map(cell => `${cell.x},${cell.y}`));
    
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
        if (!existingCoords.has(coordKey)) {
            let element = create_cell([empty['x'], empty['y']]);

            cells.push({
                "elem": element,
                "x": empty['x'],
                "y": empty['y'],
                "id": -1
            });

            container.appendChild(element);

            // Add the new coordinate to the set to prevent future duplicates
            existingCoords.add(coordKey);
        }
    }

    updateDivPositions();
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
        let element = create_card(media_url, card['text'])

        cells.push({
            "elem": element,
            "x": card['x'],
            "y": card['y'],
            "id": card['id']
        });

        container.appendChild(element);
    }

    updateDivPositions();
}


async function remove_all() {
    cells = [];
    const gridCells = document.querySelectorAll('.gridcell');
    gridCells.forEach(cell => cell.remove());
}


async function remove_empties() {
    cells = cells.filter(cell => cell.id !== -1);
    const emptyGridCells = document.querySelectorAll('.gridcell[state="empty"]');
    emptyGridCells.forEach(cell => cell.remove());
}
