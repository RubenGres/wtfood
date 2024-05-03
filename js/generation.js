const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function generateCard(camera_picture, coords) {
    let user_ip = "127.0.0.1" // start with a loopback ip

    await fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        user_ip = data.ip;
    })

    const base64ImageData = camera_picture.src.split(',')[1];
    
    // resize to desired size
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + base64ImageData;
    await new Promise((resolve) => {
        img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = camera_output_size;
    canvas.height = camera_output_size;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const resizedImageData = canvas.toDataURL('image/jpeg').split(',')[1];

    const payload = {
        input_images: {
            "input_img.jpg": resizedImageData
        },
        image: resizedImageData,
        workflow: "img2morph",
        client_id: uuidv4(), // Generate a new UUID for each request
        params: {
            input_image: "input_img.jpg",
            seed: Date.now()
        },
        coords: coords,
        user_ip: user_ip
    }

    const response = await fetch(FD_API_URL + "transform", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });


    if (!response.ok) {
        response.json().then(response_json => {
            alert(response_json.error);
        })

        return null;
    }

    const responseData = await response.json();

    return create_card_content(responseData.media_src, responseData.title, responseData.text, responseData.id)
}
