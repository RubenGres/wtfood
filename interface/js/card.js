let focused_card_id = undefined;

function play_video(card_elem) {
    let video_element = card_elem.querySelector('video');
    if(!video_element)
        return;

    video_element.style.display = "block";
    if (video_element)
        video_element.play();
}


function pause_other_videos(card_elem) {
    let video_element = card_elem.querySelector('video');
    if(!video_element) return;
    
    if(card_elem.children[0].getAttribute("id") == focused_card_id.toString()) return;
    
    video_element.style.display = "block";
    if (video_element) video_element.pause();
}

function pause_video(card_elem) {
    let video_element = card_elem.querySelector('video');
    if(!video_element) return;
    
    video_element.style.display = "block";
    if (video_element) video_element.pause();
}

async function focus_on_random_empty(){
    const response = await fetch("position/free", {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const empties = await response.json();

    empty = empties[Math.floor(Math.random() * empties.length)];

    cam_x = (empty['x'] + 1) * (cell_w + cell_margin);
    cam_y = (empty['y'] + 1) * (cell_w + cell_margin);

    updateDivPositions();
    
}

function focus_on_card(cell_id) {
    const cell = cells[cell_id];
    if (!cell) {
        console.error("No cell found for id: " + cell_id);
        return;
    }

    card_elem = cell['elem'];
    if(!card_elem) {
        console.error("No element found for cell at index: " + cell_id);
        return;
    }

    focused_card_id = cell_id;
    saveCameraPosition();

    zoom_to_card(cell_id, card_focus_zoom_level);
    play_video(card_elem);
    card_elem.style.zIndex = 20;

    if (!isMobile) {
        show_movelock();
    }
}

function unfocus_card(restore_position) {
    if(focused_card_id) {
        card_elem = cells[focused_card_id]['elem']
        card_elem.style.zIndex = 4;
        let video_element = card_elem.querySelector('video');
        if (video_element) video_element.pause();
        if(restore_position) restoreCameraPosition();
    }

    hide_movelock();
    focused_card_id = undefined;
}

function pause_current_card() {
    if(focused_card_id == undefined) return;
    
    const cell = cells[focused_card_id];
    if (!cell) {
        console.error("No cell found at index: " + cell_id);
        return;
    }

    card_elem = cell['elem'];
    if(!card_elem) {
        console.error("No element found for cell at index: " + cell_id);
        return;
    }
    
    let video_element = card_elem.querySelector('video');
    if (video_element) video_element.pause();
}


function create_card_content(media_filename, cardtitle, cardtext, cell_id) {
    let media_src = "media/" + media_filename

    // Create image element
    const generated_card = document.createElement('div');
    generated_card.setAttribute('class', 'generated-card')

    // Check if media_src is an image (ends with .jpg, .png, etc.)
    if (/\.(jpg|jpeg|png|gif)$/i.test(media_filename)) {
        const img = document.createElement('img');
        img.src = media_src;
        img.setAttribute('class', 'generated-media');
        generated_card.appendChild(img);
    }
    // Otherwise, if media_src is a video (ends with .mp4)
    else if (/\.mp4$/i.test(media_filename)) {
        const video = document.createElement('video');
        video.setAttribute('preload', 'none');
        video.setAttribute('class', 'generated-media video');
        video.setAttribute('loop', 'true');
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', true); // Muted attribute to allow autoplay in most browsers

        const source = document.createElement('source');
        source.src = media_src;
        source.type = 'video/mp4';
        video.appendChild(source);
        generated_card.appendChild(video);

        const thumbnail = document.createElement('img');
        thumbnail.setAttribute('class', 'thumbnail');
        const media_id = media_filename.split('.').slice(0, -1).join('.') || media_filename
        let thumb_src = "media/thumbnail/" + media_id + ".jpg"
        thumbnail.src = thumb_src;
        generated_card.appendChild(thumbnail);

        const glass_pane = document.createElement('div');
        glass_pane.setAttribute('class', 'glasspane');
        generated_card.appendChild(glass_pane);
        
    }

    // Create text element
    const infotext = document.createElement('div');
    
    const title = document.createElement('h3');
    title.textContent = cardtitle;
    infotext.appendChild(title);

    infotext.appendChild(document.createElement('br'));
    
    const textContent = document.createElement('p');
    textContent.innerHTML = cardtext.replace(/\n/g, "<br />");
    infotext.appendChild(textContent);

    infotext.setAttribute('class', 'infotext');
    infotext.style.display = 'none';
    generated_card.appendChild(infotext);

    // Create share button
    const share_button = document.createElement('div');
    share_button.setAttribute('class', 'share-button');

    share_icon = document.createElement('i');
    share_icon.setAttribute("class", "fas fa-share");
    share_button.appendChild(share_icon)

    generated_card.appendChild(share_button);

    // Add click event on share button
    share_button.addEventListener('click', async function(e) {
        e.stopPropagation();

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('card', cell_id);

        navigator.clipboard.writeText(currentUrl)
        .then(() => {
            showToast('Card link copied to clipboard!');
        })
        .catch(err => {
            showToast('Failed to copy URL.');
        });

    });

    // Add click event listener to the image
    generated_card.addEventListener('click', async function() {
        if(!state.isMoving) {
            play_video(this);

            if(!isMobile) {
                if(focused_card_id == undefined) {
                    focus_on_card(cell_id);
                } else {
                    infotext.style.display = infotext.style.display === 'none' ? 'block' : 'none';
                }
            } else {
                focus_on_card(cell_id);
                if(zoom == card_focus_zoom_level) {
                    infotext.style.display = infotext.style.display === 'none' ? 'block' : 'none';
                }
            }
            
        }
    });

    generated_card.setAttribute("id", cell_id);

    return  generated_card;
}