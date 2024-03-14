async function generateImage(camera_picture, coords) {
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
        },
        coords: coords
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

    return create_card(responseData.image_b64, responseData.info_text)
}
