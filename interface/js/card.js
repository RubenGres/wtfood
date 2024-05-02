let focused_card_id = undefined;

function focus_on_card(cell_id) {
    focused_card_id = cell_id;
    card_elem = cells[cell_id]['elem'];
    card_elem.style.zIndex = 9;
    
    saveCameraPosition();
    zoom_to_card(cell_id, card_focus_zoom_level);
    
    let video_element = card_elem.querySelector('video');
    if (video_element) video_element.play();
    
    show_movelock();
}

function unfocus_card() {
    if(focused_card_id) {
        card_elem = cells[focused_card_id]['elem']
        card_elem.style.zIndex = 4;
        let video_element = card_elem.querySelector('video');
        if (video_element) video_element.pause();
        restoreCameraPosition();
    }

    hide_movelock();
    focused_card_id = undefined;
}

function create_card_content(media_src, cardtitle, cardtext, cell_id) {
    // Create image element
    const generated_card = document.createElement('div');
    generated_card.setAttribute('class', 'generated-card')

    // Check if media_src is an image (ends with .jpg, .png, etc.)
    if (/\.(jpg|jpeg|png|gif)$/i.test(media_src)) {
        const img = document.createElement('img');
        img.src = media_src;
        img.setAttribute('class', 'generated-media');
        generated_card.appendChild(img);
    }
    // Otherwise, if media_src is a video (ends with .mp4)
    else if (/\.mp4$/i.test(media_src)) {
        const video = document.createElement('video');
        video.setAttribute('class', 'generated-media');
        video.setAttribute('loop', '');
        //video.setAttribute('autoplay', '');
        video.setAttribute('muted', ''); // Muted attribute to allow autoplay in most browsers
        const source = document.createElement('source');
        source.src = media_src;
        source.type = 'video/mp4';
        video.appendChild(source);
        generated_card.appendChild(video);
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
            if(focused_card_id == undefined) {
                focus_on_card(cell_id);
            } else {
                infotext.style.display = infotext.style.display === 'none' ? 'block' : 'none';
                
            }
        }
    });

    generated_card.setAttribute("id", cell_id);

    return  generated_card;
}