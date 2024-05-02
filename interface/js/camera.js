var cam_x = 0;
var cam_y = 0;

var old_camera_position = {
    zoom: 1,
    cam_x: 0,
    cam_y: 0
}

let cameraAnimation = {
    firstCall: true,
    startTime: null,
    duration: ZOOM_DURATION_MS, // milliseconds
    startZoom: 1,
    endZoom: 1,
    startCamX: undefined,
    endCamX: undefined,
    startCamY: undefined,
    endCamY: undefined,
    animating: false,
    phase: 'move',
    needs_zoom: false,
    needs_pan: false,
};

function saveCameraPosition() {
    old_camera_position.cam_x = cam_x;
    old_camera_position.cam_y = cam_y;
    old_camera_position.zoom = zoom;
} 

function restoreCameraPosition() {
    startCameraAnimation(old_camera_position.zoom, old_camera_position.cam_x, old_camera_position.cam_y);
}

function startCameraAnimation(newZoom, newCamX, newCamY, duration) {
    if (cameraAnimation.animating) return; // Prevent concurrent animations
    
    cameraAnimation.startZoom = zoom;
    cameraAnimation.endZoom = newZoom;
    
    if(newCamX != undefined) {
        cameraAnimation.startCamX = cam_x;
        cameraAnimation.endCamX = newCamX;
    } else {
        cameraAnimation.startCamX = undefined;
    }
    
    if(newCamY != undefined) {
        cameraAnimation.startCamY = cam_y;
        cameraAnimation.endCamY = newCamY;
    } else {
        cameraAnimation.startCamY = undefined;
    }

    if(duration != undefined) {
        cameraAnimation.duration = duration;
    } else {
        cameraAnimation.duration = ZOOM_DURATION_MS;
    }
    
    cameraAnimation.animating = true;
    cameraAnimation.firstCall = true;
    cameraAnimation.phase = 'move';
    cameraAnimation.startTime = null; // Will be set on the first animation frame
    requestAnimationFrame(animateZoom);
}

function animateZoom(timestamp) {
    if (cameraAnimation.firstCall) {
        cameraAnimation.startTime = timestamp;
        cameraAnimation.totalDistanceX = cameraAnimation.endCamX - cameraAnimation.startCamX;
        cameraAnimation.totalDistanceY = cameraAnimation.endCamY - cameraAnimation.startCamY;

        // if zooming out, start zooming before moving
        if(cameraAnimation.endZoom < cameraAnimation.startZoom) {
            cameraAnimation.phase = 'zoom';
        } else {
            cameraAnimation.phase = 'move';
        }

        // if no panning needed, say so
        cameraAnimation.needs_pan = cameraAnimation.startCamX != undefined || cameraAnimation.startCamY != undefined;
        cameraAnimation.needs_zoom = cameraAnimation.endZoom != zoom;

        cameraAnimation.firstCall = false;
    }

    const elapsedTime = timestamp - cameraAnimation.startTime;
    var progress = Math.min(elapsedTime / cameraAnimation.duration, 1); // Ensure progress doesn't exceed 1

    if(cameraAnimation.phase == 'move') {
        if(!cameraAnimation.needs_pan) {
            progress = 1;
        }

        if (cameraAnimation.startCamX != undefined) {
            cam_x = cameraAnimation.startCamX + cameraAnimation.totalDistanceX * progress;
            if(progress >= 1)
                cam_x = cameraAnimation.endCamX
        }
    
        if (cameraAnimation.startCamY != undefined) {
            cam_y = cameraAnimation.startCamY + cameraAnimation.totalDistanceY * progress;
            if(progress >= 1)
                cam_y = cameraAnimation.endCamY
        }

        if(progress >= 1) {
            cameraAnimation.needs_pan = false;

            if(cameraAnimation.needs_zoom) {
                cameraAnimation.phase = 'zoom';
                cameraAnimation.startTime = timestamp;
                progress = 0;
                console.log("now we're zooming")
            }
        }
    }else if(cameraAnimation.phase == 'zoom') {
        console.log("zooooming, progress=" + progress)
        // Calculate the current zoom level based on the animation progress
        zoom = cameraAnimation.startZoom + (cameraAnimation.endZoom - cameraAnimation.startZoom) * progress;
        if(progress >= 1)
            zoom = cameraAnimation.endZoom
        
        // if there is no movement, skip the wait
        if(progress >= 1) {
            cameraAnimation.needs_zoom = false;

            if(cameraAnimation.needs_pan) {
                cameraAnimation.phase = 'move';
                cameraAnimation.startTime = timestamp;
                progress = 0;
            }
        }
    }
    
    updateDivPositions(); // Update positions based on the new zoom and camera position

    if (progress < 1) {
        requestAnimationFrame(animateZoom); // Continue animation
    } else {
        updateState({ isMoving: false });
        cameraAnimation.animating = false; // Mark animation as complete
    }
}

function zoom_to_card(id, targetZoom) {
    const targetCard = cells[id];
    
    if (!targetCard) {
        return;
    }
    
    // Calculate the new camera position to center the card
    target_cam_x = (targetCard.x + 1) * (cell_w + cell_margin);
    target_cam_y = (targetCard.y + 1) * (cell_h + cell_margin);

    startCameraAnimation(targetZoom, target_cam_x, target_cam_y);
}
