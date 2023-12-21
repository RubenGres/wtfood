let img; // Declare variable 'img'.

var w = window.innerWidth;
var h = window.innerHeight;  

var cam_x = 0
var cam_y = 0
var cam_speed = 1
var imgs = [];

function setup() {
    canvas=createCanvas(w, h);
    for (let i = 0; i < 25; i++) {
        imgs.push( loadImage('image/food_class_'+(i+1)+'_sq.jpg'));
    }
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

    img_w = 256
    img_h = 256

    margin = 10

    for (let x = 0; x < 5; x++) { 
        for (let y = 0; y < 5; y++) { 
            image(imgs[x*5+y], x*(img_w+margin) - cam_x , y*(img_h+margin) - cam_y, img_w, img_h);
        }
    }

    rect(0, 0, 10, w*10);
    rect(0, 0, h*10, 10);
}
