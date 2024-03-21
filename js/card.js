function card_content(image_src, cardtext) {
    // Create image element
    const generated_card = document.createElement('div');
    generated_card.setAttribute('class', 'generated_card')

    const img = document.createElement('img');
    img.src = image_src;
    img.setAttribute('class', 'generated-image');
    generated_card.appendChild(img);

    // Create text element
    const infotext = document.createElement('div');
    infotext.textContent = cardtext;
    infotext.setAttribute('class', 'infotext');
    infotext.style.display = 'none';
    generated_card.appendChild(infotext);

    // Add click event listener to the image
    generated_card.addEventListener('click', function() {
        infotext.style.display = infotext.style.display === 'none' ? 'block' : 'none';
    });

    return generated_card;
}