async function generateImage(camera_picture) {
    const base64ImageData = camera_picture.src.split(',')[1];

    const uuidv4 = () => {
        // Generate a random UUID. This function needs to be implemented or a library that supports UUID generation should be used.
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const data = {
        image: base64ImageData,
        workflow: "default",
        client_id: uuidv4(), // Generate a new UUID for each request
        params: {
            prompt: "Person crossing their arms photograph, 2024 4k picture",
            seed: 0
        }
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
    generated_card.setAttribute('class', 'generated_card')

    const img = document.createElement('img');
    img.src = responseData.image_b64;
    img.setAttribute('class', 'generated-image');
    generated_card.appendChild(img);

    // Create text element
    const infotext = document.createElement('div');
    infotext.textContent = responseData.info_text;
    infotext.setAttribute('class', 'infotext');
    infotext.style.display = 'none';
    generated_card.appendChild(infotext);

    // Add click event listener to the image
    generated_card.addEventListener('click', function() {
        infotext.style.display = infotext.style.display === 'none' ? 'block' : 'none';
    });

    return generated_card;
}
