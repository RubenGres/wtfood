let img; // Declare variable 'img'.

var w = window.innerWidth;
var h = window.innerHeight;  

var cam_x = 0
var cam_y = 0
var cam_speed = 1

function setup() {
    canvas=createCanvas(w, h);
    img = loadImage('test.png'); // Load the image
    background(51);
}


function mousePressed() {
    moving = true;

    delta_cam_x = mouseX + cam_x
    delta_cam_y = mouseY + cam_y
}

function mouseDragged() {
    if(moving) {
        cam_x = (delta_cam_x - mouseX)
        cam_y = (delta_cam_y - mouseY)
    }
}

function mouseReleased() {
    moving = false;
}

function draw() {
    clear()

    console.log(cam_x, cam_y)

    img_w = 128
    img_h = 128

    margin = 10

    for (let x = 0; x < 6; x++) { 
        for (let y = 0; y < 6; y++) { 
            image(img, x*(img_w+margin) - cam_x , y*(img_h+margin) - cam_y, img_w, img_h);
        }
    }
}
