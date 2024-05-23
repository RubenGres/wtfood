async function connect_to_socket() {
    try {
        const result = await new Promise((resolve, reject) => {
            var socket = io.connect(FD_API_URL);
            let connectionEstablished = false;
            
            socket.on('connect', function() {
                console.log('Connected to socket.');
                connectionEstablished = true;
                resolve(true);
            });

            socket.on('connect_error', function(error) {
                resolve(false); // Resolve with false on error
            });

            socket.on('connect_timeout', function() {
                resolve(false); // Resolve with false on timeout
            });

            socket.on('new_card', async function(msg) {
                try {
                    await add_cards();
                    add_empties();
                    updateDivPositions();
                } catch (error) {
                    console.error('Error handling new card:', error);
                    resolve(false); // Resolve with false on failure
                }
            });
            
            socket.on('generating_card', function(msg) {
                try {
                    add_image(msg.coord, msg.b64);
                    play_loading_animation(msg.coord);
                } catch (error) {
                    console.error('Error generating card:', error);
                    resolve(false); // Resolve with false on failure
                }
            });

            socket.on('response', function() {
                // If we receive a response from the server and no errors have occurred
                if (connectionEstablished) {
                    resolve(true);
                }
            });

            // Set a timeout to ensure the promise resolves/rejects in case of no response
            setTimeout(() => {
                if (!connectionEstablished) {
                    resolve(false);
                }
            }, 10000); // Adjust timeout duration as needed
        });

        return result;
    } catch (error) {
        console.error('Unexpected error:', error);
        return false; // Return false on unexpected errors
    }
}
