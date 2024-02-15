async function generateImage(id_image) {
    div = imgs[id_image]

    let cell_src = div.firstElementChild.src;

    const data = {
        image_url: '/home/ruben/food-dysmorphia/no_canvas/image/food_class_'+(id_image+1)+'_sq.jpg',
        prompt: "candies, sugar, sweets"
    };

    const response = await fetch(SD_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const outputPath = await response.text();

    div.style.backgroundImage = `url(${outputPath})`;
    div.innerHTML = ``
}
