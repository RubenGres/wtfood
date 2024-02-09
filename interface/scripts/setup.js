function setup() {
    for (let i = 0; i < 25; i++) {
        let div = document.createElement('div');
        imgs.push(div);

        div.className = 'img-div';
        div.setAttribute("state", "empty");
        
        div.onclick = () => {
            switch(div.getAttribute("state")){
                case "empty":
                    openCamera(div);                    
                    div.setAttribute("state", "camera_open");
                    break;

                case "camera_open":
                    takePictureToCell(div);
                    div.setAttribute("state", "picture_ready");
                    break;

                case "picture_ready":
                    generateImage(i);
                    div.setAttribute("state", "done");
                    break;
            }
        }

        container.appendChild(div);
    }

    setupCamera();
    updateDivPositions();
}

window.onload = setup;
