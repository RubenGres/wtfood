document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect(FD_API_URL);
    
    socket.on('connect', function() {
    });

    socket.on('new_card', function(msg) {
        add_cards();
        add_empties();
    });

    socket.on('generating_card', function(msg) {
        console.log(msg);
        play_loading_animation(msg.coord);
    });

});