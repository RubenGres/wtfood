let imgs = [];
let videoStream;

async function setupCamera() {
    try {
        const constraints = {
            video: { facingMode: "environment" }
        };

        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}


function openCamera(div) {
    div.innerHTML = ""

    let videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.id = "video";
    videoElement.srcObject = videoStream;

    div.appendChild(videoElement)
}


async function takePicture() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
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
