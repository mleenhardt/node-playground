var logger = require("log4js").getDefaultLogger();

function startServer(httpServer) {
    var server = require("socket.io")(httpServer);

    server.on("connection", function(socket) {
        logger.info("A websocket client connected from " + socket.request.connection.remoteAddress);

        socket.on("chat.message", function(message) {
            logger.info("Received chat.message from " + socket.request.connection.remoteAddress + " -- \"" + message + "\"");
            // Broadcast to all
            server.emit("chat.message", message);
            // Broadcasts to all but socket
            //socket.emit("chat.message", message);
        });

        socket.on("disconnect", function() {
            logger.info("A websocket client (" + socket.request.connection.remoteAddress + ") disconnected");
        });
    });

}

module.exports.startServer = startServer;