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
        play_loading_animation(msg.coord);
    });

});