let videoStream;

async function setupCamera() {
    try {
        const constraints = {
            video: {
                facingMode: "environment",
                aspectRatio: { exact: 1 }
            }
        };

        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}


function openCamera(div) {
    div.innerHTML = "";

    let videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.id = "video";
    videoElement.srcObject = videoStream;

    // Wait for the video to be loaded to get its dimensions
    videoElement.onloadedmetadata = () => {
        let shorterSize = window.getComputedStyle(div).width; // if cell is a square width = height

        // Set the video element size to ensure a square aspect ratio
        videoElement.style.width = shorterSize;
        videoElement.style.height = shorterSize;
        videoElement.style.objectFit = 'cover'; // Ensure the video covers the square area and crops excess
    };

    div.appendChild(videoElement);
}


async function takePicture() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');

    // Determine the side length based on the smaller dimension of the video
    let side_length = Math.min(video.videoWidth, video.videoHeight);

    // Set canvas size to the determined square side length
    canvas.width = side_length;
    canvas.height = side_length;

    // Calculate source x and y to center the crop area
    let sx = (video.videoWidth - side_length) / 2;
    let sy = (video.videoHeight - side_length) / 2;

    const context = canvas.getContext('2d');
    // Crop the video and draw the cropped area onto the canvas
    // Note: We're using the nine-argument version of drawImage here
    context.drawImage(video, sx, sy, side_length, side_length, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
}



async function takePictureToCell(div) {
    const imageUrl = await takePicture();

    if (imageUrl) {
        div.innerHTML = ""

        let snapshot = document.createElement('img');
        snapshot.src = imageUrl;
        snapshot.className = "snapshot"
        div.appendChild(snapshot);
    }
}
