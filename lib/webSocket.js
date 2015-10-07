var logger = require("log4js").getDefaultLogger();

function startServer(httpServer) {
    var io = require("socket.io")(httpServer);
    io.on("connection", function(socket) {
        logger.info("A websocket client connected from " + socket.request.connection.remoteAddress);
    });
}

module.exports.startServer = startServer;