function create_cell(i) {
    let div = document.createElement('div');

    div.className = 'gridcell';

    if(isMobile) {
        div.classList.add('cell-animation');
    }

    div.setAttribute("state", "empty");
    
    let cell_color = (200*i) % 360;
    div.style.backgroundColor = `hsl(${cell_color}, 76%, 70%)`; // random color
    div.addEventListener('mouseenter', function() {
        div.style.backgroundColor = `hsl(${cell_color}, 56%, 60%)`; // darken when mouseover
    });
    div.addEventListener('mouseleave', function() {
        div.style.backgroundColor = `hsl(${cell_color}, 76%, 70%)`; // darken when mouseover
    });

    div.style.height = `${cell_h}px`;
    div.style.width = `${cell_w}px`;

    div.innerHTML = "<img src='image/camera.png' class='camera_icon'/>"
    
    //cell state
    div.onclick = () => {
        if(!state.isMoving) {
            switch(div.getAttribute("state")){
                case "empty":
                    try {
                        takePictureToCell(div);
                        div.setAttribute("state", "picture_ready");
                        state.isTakingPicture = false;
                    } catch (error) {
                        console.error("Error taking picture:", error);
                    }
                    break;

                case "picture_ready":
                    generateImage(i);
                    div.setAttribute("state", "done");
                    break;
            }
        }
    }

    return div;
}