async function add_empties() {
    const response = await fetch(SD_API_URL + "position/free", {
        method: 'GET'
    });


    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const empties = await response.json();

    for (let i = 0; i < empties.length; i++) {
        let empty = empties[i]
        let element = create_cell([empty['x'], empty['y']]);
        
        cells.push({
            "elem": element,
            "x": empty['x'],
            "y": empty['y']
        });

        container.appendChild(element);
    }

    updateDivPositions();
}


async function add_cards() {
    const response = await fetch(SD_API_URL + "cards", {
        method: 'GET'
    });


    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cards = await response.json();

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i]
        let media_url = SD_API_URL + "media/"+card['media_path']
        let element = create_card(media_url, card['text'])

        cells.push({
            "elem": element,
            "x": card['x'],
            "y": card['y']
        });

        container.appendChild(element);
    }

    updateDivPositions();
}