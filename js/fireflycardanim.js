// Function to pick 5 random unique elements from the list
function pickRandomCards(count) {
    let cards_pool = Object.values(cells);
    cards_pool = cards_pool.filter(cell => typeof cell.id === 'number');

    const shuffled = cards_pool.slice(); // Copy to avoid mutating the original array
    for (let i = cards_pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }

    return shuffled.slice(0, count);
}

async function loopFireflyAnimation() {
    while (true) {
        const selectedElements = pickRandomCards(FIREFLY_AMOUNT);
        selectedElements.forEach((card) => play_video(card["elem"]));
        await new Promise(resolve => setTimeout(resolve, FIREFLY_ANIMATION_TIME_MS));
        selectedElements.forEach((card) => pause_other_videos(card["elem"]));
    }
}
