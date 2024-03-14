function basic_cell() {
    // Create a new div element that will represent a cell
    let div = document.createElement('div');

    // Set the class for the div to apply grid cell styling
    div.className = 'gridcell';
    
    // Set the cell's height and width based on predefined variables
    div.style.height = `${cell_h}px`;
    div.style.width = `${cell_w}px`;

    // If on a mobile device, add animation class for cell
    if(isMobile) {
        div.classList.add('cell-animation');
    }

    return div    
}


function create_cell(coords) {
    let div = basic_cell();

    // Calculate the cell color based on its index
    let cell_color = (200*(coords[0]*10+coords[1])) % 360;
    let base_hue = `hsl(${cell_color}, 76%, 90%)`;
    let highlight_hue = `hsl(${cell_color}, 56%, 85%)`;
    div.style.backgroundColor = base_hue;
    div.addEventListener('mouseenter', function() {
        div.style.backgroundColor = highlight_hue;
    });
    div.addEventListener('mouseleave', function() {
        div.style.backgroundColor = base_hue;
    });

    // Create and add a camera icon to the cell
    let camera_icon = document.createElement('img');
    camera_icon.setAttribute('src', 'image/camera.png');
    camera_icon.setAttribute('class', 'camera_icon');
    div.appendChild(camera_icon);

    // Create and add a loading gizmo (visual feedback for loading) to the cell
    let loading_gizmo = document.createElement('div');
    loading_gizmo.setAttribute('class', 'loading_gizmo');
    div.appendChild(loading_gizmo);

    // Placeholder for a camera picture
    let camera_picture;
    
    // Initialize cell state to 'empty' and handle cell state transitions on click
    div.setAttribute("state", "empty");
    div.onclick = async () => {
        if(!state.isMoving) {
            switch(div.getAttribute("state")){
                case "empty":
                    // On first click, try taking a picture and update state
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
                    // While loading, show loading gizmo, then generate and display image
                    loading_gizmo.className = 'loading_gizmo display';
                    
                    generated_image = await generateImage(camera_picture, coords);
                    div.removeChild(loading_gizmo);
                    div.removeChild(camera_picture);
                    div.appendChild(generated_image);
                    add_empties();

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


function create_card(image, text) {
    let div = basic_cell();
    div.appendChild(card_content(image, text))
    return div
}
