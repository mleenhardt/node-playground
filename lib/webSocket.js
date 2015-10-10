var logger = require("log4js").getDefaultLogger();

function startServer(httpServer) {
    var server = require("socket.io")(httpServer);

    server.on("connect", function(socket) {
        logger.info("A websocket client (id " + socket.id + ") connected from " + socket.request.connection.remoteAddress);

        const chatMessageEvent = "chat.message";

        socket.on(chatMessageEvent, function(message) {
            logger.debug("Received chat.message from " + socket.id + " - \"" + message + "\"");
            // Broadcast to all
            server.emit(chatMessageEvent, message);
            // Broadcasts to all but socket
            //socket.broadcast.emit("chat.message", message);
        });

        socket.on("disconnect", function() {
            logger.info("A websocket client (id " + socket.id + ") disconnected from " + socket.request.connection.remoteAddress);
        });
    });

}

module.exports.startServer = startServer;