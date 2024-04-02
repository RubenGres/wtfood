function create_card_content(media_src, cardtext) {
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
    infotext.textContent = cardtext;
    infotext.setAttribute('class', 'infotext');
    infotext.style.display = 'none';
    generated_card.appendChild(infotext);

    // Add click event listener to the image
    generated_card.addEventListener('click', async function() {
        infotext.style.display = infotext.style.display === 'none' ? 'block' : 'none';
    });

    // Check if generated_card has a video child, then play/pause the video on hover
    if (generated_card.querySelector('video')) {
        generated_card.addEventListener('mouseenter', function() {
            // Play video
            this.querySelector('video').play();
        });

        generated_card.addEventListener('mouseleave', function() {
            // Pause video
            this.querySelector('video').pause();
        });
    }

    return generated_card;
}