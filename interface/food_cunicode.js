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
            <button onclick="openCamera(${i})">Add image</button>
        `;

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
    
    div.innerHTML = `
        <div class="imgWrap">
            <img class="grayscale" draggable="false" src="image/food_class_${id_image+1}_sq.jpg">
            <img class="red" draggable="false" src="image/food_class_${id_image+1}_sq.jpg">
            <img class="blue" draggable="false" src="image/food_class_${id_image+1}_sq.jpg">
        </div>
    `;
    div.style.backgroundImage = "";

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
    div.innerHTML = ``
}

function getPointerPosition(e) {
    if (e.touches) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        return { x: e.clientX, y: e.clientY };
    }
}

function pointerPressed(e) {
    moving = true;
    let pos = getPointerPosition(e);
    delta_cam_x = pos.x + cam_x;
    delta_cam_y = pos.y + cam_y;
    container.style.cursor = 'grabbing';
}

function pointerMoved(e) {
    if (moving) {
        let pos = getPointerPosition(e);
        cam_x = delta_cam_x - pos.x;
        cam_y = delta_cam_y - pos.y;
        updateDivPositions();
    }
}

function pointerReleased(e) {
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

// Mouse event listeners
container.addEventListener('mousedown', pointerPressed);
container.addEventListener('mousemove', pointerMoved);
container.addEventListener('mouseup', pointerReleased);
container.addEventListener('mouseleave', pointerReleased);

// Touch event listeners
container.addEventListener('touchstart', pointerPressed);
container.addEventListener('touchmove', pointerMoved);
container.addEventListener('touchend', pointerReleased);

setup();
updateDivPositions(); // Initial position update
