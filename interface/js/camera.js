var cam_x = 0;
var cam_y = 0;

let cameraAnimation = {
    startTime: null,
    duration: 150, // milliseconds
    startZoom: 1,
    endZoom: 1,
    startCamX: undefined,
    endCamX: undefined,
    startCamY: undefined,
    endCamY: undefined,
    animating: false,
    phase: 'move',
};


function startCameraAnimation(newZoom, newCamX, newCamY) {
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
    
    cameraAnimation.animating = true;
    
    cameraAnimation.phase = 'move';
    cameraAnimation.startTime = null; // Will be set on the first animation frame
    requestAnimationFrame(animateZoom);
}

function animateZoom(timestamp) {
    if (!cameraAnimation.startTime) {
        cameraAnimation.startTime = timestamp;
        cameraAnimation.totalDistanceX = cameraAnimation.endCamX - cameraAnimation.startCamX;
        cameraAnimation.totalDistanceY = cameraAnimation.endCamY - cameraAnimation.startCamY;
    }

    if(cameraAnimation.startCamX == undefined && cameraAnimation.startCamY == undefined) {
        cameraAnimation.phase = 'zoom';
    }

    const elapsedTime = timestamp - cameraAnimation.startTime;
    var progress = Math.min(elapsedTime / cameraAnimation.duration, 1); // Ensure progress doesn't exceed 1

    if(cameraAnimation.phase == 'move') {
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
            cameraAnimation.phase = 'zoom';
            cameraAnimation.startTime = null;
            progress = 0;
        }
    } if(cameraAnimation.phase == 'zoom') {
        // Calculate the current zoom level based on the animation progress
        zoom = cameraAnimation.startZoom + (cameraAnimation.endZoom - cameraAnimation.startZoom) * progress;
        if(progress >= 1)
            zoom = cameraAnimation.endZoom
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
    if (!targetCard) return;
    
    // Calculate the new camera position to center the card
    target_cam_x = (targetCard.x + 1) * (cell_w + cell_margin);
    target_cam_y = (targetCard.y + 1) * (cell_h + cell_margin);

    startCameraAnimation(targetZoom, target_cam_x, target_cam_y);
}
