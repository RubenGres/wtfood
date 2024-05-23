function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


function crop_image(image) {
    side_length = Math.min(image.width, image.height);

    const canvas = document.createElement('canvas');

    canvas.width = camera_output_size;
    canvas.height = camera_output_size;

    // Calculate source x and y to center the crop area
    let sx = (image.width - side_length) / 2;
    let sy = (image.height - side_length) / 2;

    const context = canvas.getContext('2d');
    context.drawImage(image, sx, sy, side_length, side_length, 0, 0, camera_output_size, camera_output_size);

    return canvas.toDataURL('image/png');
}


async function takePicture() {
    camerainput.focus();
    camerainput.click();

    // wait for camera input to change
    await new Promise((resolve, reject) => {
        camerainput.onchange = () => {
            if (camerainput.files && camerainput.files.length > 0) {
                resolve();
            } else {
                reject(new Error('No file selected.'));
            }
        };
    });

    const file = camerainput.files[0];
    const image = await loadImage(file);

    data_url = await crop_image(image);

    return data_url;
}
