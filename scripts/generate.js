async function generateImage(camera_picture) {
    const base64ImageData = camera_picture.src.split(',')[1];


    const data = {
        image: base64ImageData,
        workflow: "default"
    };

    const response = await fetch(SD_API_URL + "transform", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });


    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    
    const responseData = await response.json();
    const image_b64 = responseData.image_b64;
    const info_text = responseData.info_text;


    // Create image element
    const generated_card = document.createElement('div');

    const img = document.createElement('img');
    img.src = responseData.image_b64;
    img.setAttribute('class', 'generated-image');
    card.appendChild(img);

    // Create text element
    const infotext = document.createElement('div');
    infotext.textContent = responseData.info_text;
    info_text.setAttribute('class', 'infotext');
    card.appendChild(info_text);

    // Add click event listener to the image
    img.addEventListener('click', function() {
        text.style.display = text.style.display === 'none' ? 'block' : 'none';
    });

    return img;
}
