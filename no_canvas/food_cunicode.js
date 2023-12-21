var container = document.getElementById('container');
var moving = false;
var delta_cam_x = 0;
var delta_cam_y = 0;
var cam_x = 0;
var cam_y = 0;
var imgs = [];

function setup() {
    for (let i = 0; i < 25; i++) {
        let div = document.createElement('div');
        div.className = 'img-div';
        
        div.innerHTML = `
            <h3>Image ${i+1}</h3>
            <button onclick="openCamera(${i})">Add image</button>
        `;

        div.style.backgroundColor = 'grey';
        container.appendChild(div);
        imgs.push(div);
    }
}

function openCamera(id_image) {
    div = imgs[id_image]
    div.style.backgroundImage = 'url(image/food_class_'+(id_image+1)+'_sq.jpg)';

    div.innerHTML = `
        <button onclick="generateImage(${id_image})">Generate image</button>
    `
}

async function generateImage(id_image) {
    div = imgs[id_image]

    const data = {
        image_url: '/home/ruben/food-dysmorphia/no_canvas/image/food_class_'+(id_image+1)+'_sq.jpg',
        prompt: "candies, sugar, sweets"
    };

    const response = await fetch('http://localhost:5000/transform', {
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
    div.innerHTML = ""
}

function mousePressed(e) {
    moving = true;
    delta_cam_x = e.clientX + cam_x;
    delta_cam_y = e.clientY + cam_y;
    container.style.cursor = 'grabbing';
}

function mouseDragged(e) {
    if (moving) {
        cam_x = delta_cam_x - e.clientX;
        cam_y = delta_cam_y - e.clientY;
        updateDivPositions();
    }
}

function mouseReleased(e) {
    moving = false;
    container.style.cursor = 'grab';
}

function updateDivPositions() {
    let img_w = 256;
    let img_h = 256;
    let margin = 10;

    for (let x = 0; x < 5; x++) { 
        for (let y = 0; y < 5; y++) { 
            let div = imgs[x + y*5];
            div.style.left = (x * (img_w + margin) - cam_x) + 'px';
            div.style.top = (y * (img_h + margin) - cam_y) + 'px';
        }
    }
}

// Event listeners
container.addEventListener('mousedown', mousePressed);
container.addEventListener('mousemove', mouseDragged);
container.addEventListener('mouseup', mouseReleased);
container.addEventListener('mouseleave', mouseReleased);

setup();
updateDivPositions(); // Initial position update
