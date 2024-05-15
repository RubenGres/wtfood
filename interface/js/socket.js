document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect(FD_API_URL);
    
    socket.on('connect', function() {
    });

    socket.on('new_card', async function(msg) {
        await add_cards();
        add_empties();
        updateDivPositions();
    });

    socket.on('generating_card', function(msg) {
        add_image(msg.coord, msg.b64);
        play_loading_animation(msg.coord);
    });

});