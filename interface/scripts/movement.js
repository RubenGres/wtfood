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
    if (e && (e.which == 2 || e.button == 4 )) { //if middle click
        updateState({ isMoving: true });
        let pos = getPointerPosition(e);
        delta_cam_x = pos.x + cam_x;
        delta_cam_y = pos.y + cam_y;
        container.style.cursor = 'grabbing';
    }
}


function pointerReleased(e) {
    if (e && (e.which == 2 || e.button == 4 )) { //if middle click
        updateState({ isMoving: false });
        container.style.cursor = 'grab';
    }
}


function pointerMoved(e) {
    if (state.isMoving) {
        let pos = getPointerPosition(e);
        cam_x = delta_cam_x - pos.x;
        cam_y = delta_cam_y - pos.y;
        updateDivPositions();
    }
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
    cam_x += cell_w + cell_margin;
    updateDivPositions();
}

function swipe_right() {
    cam_x -= cell_w + cell_margin;
    updateDivPositions();
}

function swipe_down() {
    cam_y += cell_h + cell_margin;
    updateDivPositions();
}

function swipe_up() {
    cam_y -= cell_h + cell_margin;
    updateDivPositions();
}

if(isMobile) {
    const swipeDetect = (el) => {
        let surface = el;      
        let startX = 0;      
        let startY = 0;      
        let distX = 0;      
        let distY = 0;

        const min_swipe_dist = 70;
            
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

            //alert(distX + ";" + distY);

            if (Math.abs(distX) > Math.abs(distY)) {
                if (Math.abs(distX) > min_swipe_dist) {
                    if (distX > 0) {
                        swipe_right();
                    } else {
                        swipe_left();
                    }
                }
            } else {
                if (Math.abs(distY) > min_swipe_dist) {
                    if (distY > 0) {
                        swipe_up();
                    } else {
                        swipe_down();
                    }
                }
            }
        });
    };

    // small correction to center the cell
    cam_x -= (window.visualViewport.width - (cell_w + cell_margin))/2;
    cam_y -= (window.visualViewport.height - (cell_h + cell_margin))/2;

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