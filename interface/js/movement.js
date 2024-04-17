var pointer_down = false;

const viewportWidth = window.visualViewport.width;
const viewportHeight = window.visualViewport.height;
var zoomAnchorX = viewportWidth / 2;
var zoomAnchorY = viewportHeight / 2;

var delta_cam_x = 0;
var delta_cam_y = 0;
var cam_x = 0;
var cam_y = 0;

let zoomAnimation = {
    startTime: null,
    duration: 70, // milliseconds
    startZoom: 1,
    endZoom: 1,
    animating: false,
};

function startZoomAnimation(newZoom) {
    if (zoomAnimation.animating) return; // Prevent concurrent animations

    zoomAnimation.startTime = null; // Will be set on the first animation frame
    zoomAnimation.startZoom = zoom;
    zoomAnimation.endZoom = newZoom;
    zoomAnimation.animating = true;

    requestAnimationFrame(animateZoom);
}

function animateZoom(timestamp) {
    if (!zoomAnimation.startTime) zoomAnimation.startTime = timestamp;
    const elapsedTime = timestamp - zoomAnimation.startTime;
    const progress = Math.min(elapsedTime / zoomAnimation.duration, 1); // Ensure progress doesn't exceed 1

    // Calculate the current zoom level based on the animation progress
    zoom = zoomAnimation.startZoom + (zoomAnimation.endZoom - zoomAnimation.startZoom) * progress;

    updateDivPositions(); // Update positions based on the new zoom

    if (progress < 1) {
        requestAnimationFrame(animateZoom); // Continue animation
    } else {
        updateState({ isMoving: false });
        zoomAnimation.animating = false; // Animation complete
    }
}

function padScroll(e) {            
    var activeCard = getActiveCard(e);
    
    var noInfoTextElements = true;
    var infoTextHidden = true;
    var scrollUnlocked = true;
    var inside_infotext = false;

    if(activeCard) {
        var infotext = activeCard.getElementsByClassName("infotext")[0]

        const x = e.clientX;
        const y = e.clientY;

        
        if(infotext) {
            const rect = infotext.getElementsByTagName("p")[0].getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                inside_infotext = true;
            }

            noInfoTextElements = activeCard && infotext.length == 0;
            infoTextHidden = !noInfoTextElements && infotext.style.display === "none";
            
            scrollable = infotext.getElementsByTagName("p")[0]
    
            if(scrollable) {
                if (scrollable.scrollHeight) {
                    var a = scrollable.scrollTop;
                    var b = scrollable.scrollHeight - scrollable.clientHeight;
                    var c = a / b;
                    
                    if(e.deltaY < 0) {
                        scrollUnlocked = c <= 0.1
                    } else {
                        scrollUnlocked = c >= 0.9
                    }

                }
            }
        }
    }

    if (!inside_infotext || noInfoTextElements || infoTextHidden || scrollUnlocked) {
        if(!state.isMoving) {
            updateState({ isMoving: true });
    
            var zoom_speed = 0.005;
            var minZoom = 0.25;
            var maxZoom = 8;
            var clamped_delta = Math.min(Math.max(e.deltaY, -100), 100)
            var zoomChange = -clamped_delta * zoom_speed * zoom;
        
            let newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + zoomChange));    
    
            startZoomAnimation(newZoom);
        }
    }
    
}

function getPointerPosition(e) {
    if (e.touches) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        return { x: e.clientX, y: e.clientY };
    }
}

function getActiveCard(e) {
    if (!isMobile) {
        // Get the cursor position
        const x = e.clientX;
        const y = e.clientY;

        for (let i = 0; i < cells.length; i++) {
            const cell_elem = cells[i]["elem"];
            const rect = cell_elem.getBoundingClientRect(); // Get the position and size of the cell

            // Check if the cursor is within the cell's bounds
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return cell_elem; // Return the cell element if the cursor is inside
            }
        }
    }

    return null; // Return null if no cell contains the cursor or if it's a mobile device
}


function pointerPressed(e) {
    if (e && (e.which == 1 || e.button == 0)) { //if left click        
        pointer_down = true;
        let pos = getPointerPosition(e);
        delta_cam_x = (cam_x * zoom) + pos.x;
        delta_cam_y = (cam_y * zoom) + pos.y;
        container.style.cursor = 'grabbing';
    }
}


function pointerReleased(e) {
    
    if (e && (e.which == 1 || e.button == 0)) { //if left click
        pointer_down = false;
        if(state.isMoving) {
            e.preventDefault();
            
            setTimeout(() => {
                updateState({ isMoving: false });
            }, 20);

            container.style.cursor = 'auto';
        }
    }
}


function pointerMoved(e) {
    if (pointer_down) {
        updateState({ isMoving: true });
        let pos = getPointerPosition(e);
        cam_x = (delta_cam_x - pos.x) / zoom;
        cam_y = (delta_cam_y - pos.y) / zoom;
        updateDivPositions();
    }
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
    const response = await fetch(FD_API_URL + "position/pick", {method: 'GET'});
    
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

    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        let cell_elem = cell["elem"];

        cell_elem.style.width = width + 'px';
        cell_elem.style.height = height + 'px';

        // Calculate positions considering the zoom and centered on the viewport
        let centeredX = (width + margin)/2 + (cell["x"] * (width + margin)) + zoomAnchorX - cam_x * zoom;
        let centeredY = (height + margin)/2 + (cell["y"] * (height + margin)) + zoomAnchorY - cam_y * zoom;

        cell_elem.style.left = centeredX + 'px';
        cell_elem.style.top = centeredY + 'px';

        //Update div text
        const fontSize = width / 20; // Example calculation, adjust as needed
        cell_elem.style.fontSize = `${fontSize}px`;
    }
}



if(isMobile) {
    focus_random_empty();

    const swipeDetect = (el) => {
        let surface = el;      
        let startX = 0;      
        let startY = 0;      
        let distX = 0;      
        let distY = 0;

        const min_swipe_dist = 30;
            
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

