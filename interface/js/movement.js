var pointer_down = false;

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
var zoomAnchorX = viewportWidth / 2;
var zoomAnchorY = viewportHeight / 2;

var delta_cam_x = 0;
var delta_cam_y = 0;

function padScroll(e) {         
    if (state.movelocked)
        return;

    var activeCard = getActiveCard(e);
    
    var noInfoTextElements = true;
    var infoTextHidden = true;
    var scrollUnlocked = true;
    var inside_infotext = false;

    if(activeCard) {
        var infotext = activeCard["elem"].getElementsByClassName("infotext")[0]

        const x = e.clientX;
        const y = e.clientY;

        
        if(infotext) {
            const rect = infotext.getElementsByTagName("p")[0].getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                inside_infotext = true;
            }

            noInfoTextElements = activeCard["elem"] && infotext.length == 0;
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
            var clamped_delta = Math.min(Math.max(e.deltaY, -100), 100)
            var zoomChange = -clamped_delta * zoom_speed * zoom;
            
            var minZoom = 0.25;
            var maxZoom = 8;
            let newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + zoomChange));    
    
            startCameraAnimation(newZoom, undefined, undefined, 100);
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

function getCardOnScreenCoord(x, y) {
    for (const [key, cell] of Object.entries(cells)) {
        const cell_elem = cell["elem"];
        const rect = cell_elem.getBoundingClientRect(); // Get the position and size of the cell

        // Check if the cursor is within the cell's bounds
        if (x >= rect.left - margin && x <= rect.right + margin && y >= rect.top - margin && y <= rect.bottom + margin) {
            return cell; // Return the cell element if the cursor is inside
        }
    }

    return null; // Return null if no cell contains the cursor or if it's a mobile device
}

function getActiveCard(e) {
    let x, y;

    if (!isMobile) {
        // Get the cursor position from mouse event
        x = e.clientX;
        y = e.clientY;
    } else {
        // Calculate the middle of the screen for mobile
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
    }

    return getCardOnScreenCoord(x, y);
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
    if(state.movelocked) {
        return;
    }

    if (pointer_down) {
        updateState({ isMoving: true });
        let pos = getPointerPosition(e);
        cam_x = (delta_cam_x - pos.x) / zoom;
        cam_y = (delta_cam_y - pos.y) / zoom;
        updateDivPositions();
    }
}

function swipe_camera(distX, distY) {
    var target_cam_x = undefined;
    var target_cam_y = undefined;

    var x = window.innerWidth/2;
    var y = window.innerHeight/2;

    unfocus_card();

    if (Math.abs(distX) > Math.abs(distY)) {
        if (Math.abs(distX) > MIN_SWIPE_DIST) {
            target_cam_x =  cam_x + -Math.sign(distX) * (width + margin);
        }
        x += -window.innerWidth * Math.sign(distX)
    } else {
        if (Math.abs(distY) > MIN_SWIPE_DIST) {
            target_cam_y =  cam_y + -Math.sign(distY) * (height + margin);
        }
        y += window.innerWidth * Math.sign(distX)
    }
    
    let card = getCardOnScreenCoord(x, y);
    focus_on_card(card.id);
}

function snap_to_nearest_cell() {
    let cell = getActiveCard();
    cam_x = (cell.x + 1) * (margin + width);
    cam_y = (cell.y + 1) * (margin + height);
    zoom = 1;
    updateDivPositions();
}

function mobile_zoom(distance_delta) {
    if (state.movelocked) {
        return;
    }
    
    var zoom_speed = 0.0005;
    var zoomChange = distance_delta * zoom_speed * zoom;
    
    var minZoom = MOBILE_MIN_ZOOM;
    var maxZoom = 1;
    zoom = Math.max(minZoom, Math.min(maxZoom, zoom + zoomChange)); 

    if(zoom == maxZoom) {
        snap_to_nearest_cell();
    }

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

    for (const [key, cell] of Object.entries(cells)) {
        const cell_elem = cell["elem"];

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
        let startDistance = 0; // Initial distance between two touches for pinch zoom
        let distX = 0;
        let distY = 0;
        let startX = 0;
        let startY = 0;

        let startXrelative = 0;
        let startYrelative = 0;

        el.addEventListener("touchstart", function (e) {
            const x1 = e.touches[0].pageX;
            const y1 = e.touches[0].pageY;

            swipe_start_time = Date.now();

            startX = x1;
            startY = y1;

            startXrelative = (cam_x * zoom) + x1;
            startYrelative = (cam_y * zoom) + y1;
            
            if (e.touches.length === 2) {
                const x2 = e.touches[1].pageX;
                const y2 = e.touches[1].pageY;
                startDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            }
        });
    
        el.addEventListener("touchmove", function (e) {
            if(zoom != 1) {
                // do no always prevent default to allow scrolling
                e.preventDefault();
            }

            const x1 = e.changedTouches[0].pageX;
            const y1 = e.changedTouches[0].pageY;

            if (e.changedTouches.length > 1) {
                // When two fingers are lifted off, compare the ending distance to the initial distance
                const x2 = e.changedTouches[1].pageX;
                const y2 = e.changedTouches[1].pageY;
                const endDistance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

                mobile_zoom(endDistance - startDistance);
            } else if(zoom != card_focus_zoom_level) {
                cam_x = (startXrelative - x1) / zoom;
                cam_y = (startYrelative - y1) / zoom;

                updateDivPositions();
            }
        });
    
        el.addEventListener("touchend", function (e) {
            active_card = null;

            if (e.changedTouches.length === 1){
                if(zoom == card_focus_zoom_level) {
                    distX = e.changedTouches[0].pageX - startX;
                    distY = e.changedTouches[0].pageY - startY;

                    if(Date.now() - swipe_start_time < SWIPE_MAX_DURATION_MS && Math.abs(distX) > MIN_SWIPE_DIST || Math.abs(distY) > MIN_SWIPE_DIST) {
                        swipe_camera(distX, distY);
                    }
                }
            } 
        });
    };
    
    // Attach the swipeDetect function to a container
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


