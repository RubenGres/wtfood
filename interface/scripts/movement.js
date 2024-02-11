var container = document.getElementById('container');

var moving = false;
var delta_cam_x = 0;
var delta_cam_y = 0;
var cam_x = 0;
var cam_y = 0;


function getPointerPosition(e) {
    if (e.touches) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        return { x: e.clientX, y: e.clientY };
    }
}


function pointerPressed(e) {
    updateState({ isMoving: true });
    let pos = getPointerPosition(e);
    delta_cam_x = pos.x + cam_x;
    delta_cam_y = pos.y + cam_y;
    container.style.cursor = 'grabbing';
}


function pointerMoved(e) {
    if (state.isMoving) {
        let pos = getPointerPosition(e);
        cam_x = delta_cam_x - pos.x;
        cam_y = delta_cam_y - pos.y;
        updateDivPositions();
    }
}


function pointerReleased(e) {
    updateState({ isMoving: false });
    container.style.cursor = 'grab';
}

function padScroll(e) {
    updateState({ isMoving: true });
    cam_x = cam_x + e.deltaX;
    cam_y = cam_y + e.deltaY;
    updateDivPositions();
    updateState({ isMoving: false });
}


function updateDivPositions() {
    for (let x = 0; x < grid_width; x++) { 
        for (let y = 0; y < grid_height; y++) { 
            let div = imgs[x + y*grid_height];
            div.style.left = (x * (cell_w + cell_margin) - cam_x) + 'px';
            div.style.top = (y * (cell_h + cell_margin) - cam_y) + 'px';
        }
    }
}


function swipe_left() {

}

function swipe_right() {

}

if(isMobile) {
    const swipeDetect = (el) => {
        let surface = el;      
        let startX = 0;      
        let startY = 0;      
        let distX = 0;      
        let distY = 0;
            
        surface.addEventListener("touchstart", function (e) {
          startX = e.changedTouches[0].pageX;
          startY = e.changedTouches[0].pageY;
        });
      
        surface.addEventListener("touchmove", function (e) {
          e.preventDefault();
        });
      
        surface.addEventListener("touchend", function (e) {
          distX = e.changedTouches[0].pageX - startX;
          distY = e.changedTouches[0].pageY - startY;
      
          if (Math.abs(distX) > Math.abs(distY)) {
            if (distX > 0) {
              console.log("swipe right");
            } else {
              console.log("swipe left");
            }
          }
        });
    };

    swipeDetect(container);
} else {
    // Mouse event listeners
    container.addEventListener('mousedown', pointerPressed);
    container.addEventListener('mousemove', pointerMoved);
    container.addEventListener('mouseup', pointerReleased);
    container.addEventListener('mouseleave', pointerReleased);

    // Pad / Scroll wheel
    container.addEventListener('wheel', padScroll);

    // Touch event listeners
    container.addEventListener('touchstart', pointerPressed);
    container.addEventListener('touchmove', pointerMoved);
    container.addEventListener('touchend', pointerReleased);
}