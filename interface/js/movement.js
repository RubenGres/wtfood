var moving = false;
var delta_cam_x = 0;
var delta_cam_y = 0;

//cam_x = (grid_width * (cell_w + cell_margin))/2
//cam_y = (grid_height * (cell_h + cell_margin))/2

//cam_x = -(window.visualViewport.width - (width + margin)*zoom)/2;
//cam_y = -(window.visualViewport.height - (height + margin)*zoom)/2;

cam_x = 0;
cam_y = 0;

function getPointerPosition(e) {
    if (e.touches) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        return { x: e.clientX, y: e.clientY };
    }
}


function pointerPressed(e) {
    if (e && (e.which == 2 || e.button == 4 )) { //if middle click
        e.preventDefault();
        
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
    cam_x = cam_x + e.deltaX / zoom;
    cam_y = cam_y + e.deltaY / zoom;
    updateDivPositions();
    updateState({ isMoving: false });
}


function swipe_left() {
    cam_x += width + margin;
    updateDivPositions();
}


function swipe_right() {
    cam_x -= width + margin;
    updateDivPositions();
}


function swipe_down() {
    cam_y += height + margin;
    updateDivPositions();
}


function swipe_up() {
    cam_y -= height + margin;
    updateDivPositions();
}


async function focus_random_empty() {
    const response = await fetch(SD_API_URL + "position/pick", {method: 'GET'});
    
    if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

    const random_position = await response.json();

    cam_x += random_position['x'] * (width + margin)
    cam_y += random_position['y'] * (height + margin)
} 


function updateDivPositions() {
    width = cell_w * zoom;
    height = cell_h * zoom;
    margin = cell_margin * zoom;

    const viewportWidth = window.visualViewport.width;
    const viewportHeight = window.visualViewport.height;

    // Center of the viewport
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        let cell_elem = cell["elem"];

        cell_elem.style.width = width + 'px';
        cell_elem.style.height = height + 'px';

        // Calculate positions considering the zoom and centered on the viewport
        let centeredX = (cell["x"] * (width + margin)) + viewportCenterX - cam_x * zoom;
        let centeredY = (cell["y"] * (height + margin)) + viewportCenterY - cam_y * zoom;

        cell_elem.style.left = centeredX + 'px';
        cell_elem.style.top = centeredY + 'px';
    }

    console.log(cam_x, cam_y, zoom);
}



if(isMobile) {
    focus_random_empty();

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

