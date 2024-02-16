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
    
    //cell state
    div.onclick = () => {
        if(!state.isMoving) {
            switch(div.getAttribute("state")){
                case "empty":
                    if(!state.isTakingPicture) {
                        openCamera(div);                    
                        div.setAttribute("state", "camera_open");
                        state.isTakingPicture = true;
                    }
                    break;

                case "camera_open":
                    takePictureToCell(div);
                    div.setAttribute("state", "picture_ready");
                    state.isTakingPicture = false;
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