function create_cell(i) {
    let div = document.createElement('div');

    div.className = 'gridcell';

    if(isMobile) {
        div.classList.add('cell-animation');
    }
    
    // cell colors
    let cell_color = (200*i) % 360;
    let base_hue = `hsl(${cell_color}, 76%, 90%)`;
    let highlight_hue = `hsl(${cell_color}, 56%, 85%)`;

    div.style.backgroundColor = base_hue;

    div.addEventListener('mouseenter', function() {
        div.style.backgroundColor = highlight_hue;
    });

    div.addEventListener('mouseleave', function() {
        div.style.backgroundColor = base_hue;
    });

    div.style.height = `${cell_h}px`;
    div.style.width = `${cell_w}px`;

    // add camera icon
    let camera_icon = document.createElement('img');
    camera_icon.setAttribute('src', 'image/camera.png');
    camera_icon.setAttribute('class', 'camera_icon');
    div.appendChild(camera_icon);

    // add loading gizmo
    let loading_gizmo = document.createElement('div');
    loading_gizmo.setAttribute('class', 'loading_gizmo');
    div.appendChild(loading_gizmo);

    let camera_picture;
    
    //cell state manager
    div.setAttribute("state", "empty");
    div.onclick = async () => {
        if(!state.isMoving) {
            switch(div.getAttribute("state")){
                case "empty":
                    try {
                        camera_picture = await takePicture(div);
                        div.appendChild(camera_picture);
                        div.removeChild(camera_icon);

                        div.setAttribute("state", "loading");
                        state.isTakingPicture = false;
                    } catch (error) {
                        console.error("Error taking picture:", error);
                    }
                    break;
                

                case "loading":
                    loading_gizmo.className = 'loading_gizmo display';
                    
                    generated_image = await generateImage(camera_picture);
                    div.removeChild(loading_gizmo);
                    div.removeChild(camera_picture);
                    div.appendChild(generated_image);

                    div.setAttribute("state", "picture_ready");
                    break;


                case "picture_ready":
                    div.setAttribute("state", "done");
                    break;
            }
        }
    }

    return div;
}