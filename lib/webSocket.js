var logger = require("log4js").getDefaultLogger();

var socketEvents = {
    clientJoin : "client.join",
    clientNameNotAvailable: "client.name.not.available",
    clientWelcome: "client.welcome",
    chatMessage: "chat.message"
};

function ClientManager() {
    // Ideally, we'd want to use ES6's Map.
    this.clients = {};
}

ClientManager.prototype.isClientNameAvailable = function(clientName) {
    for (var clientId in this.clients){
        if (this.clients[clientId].name === clientName) {
            return false;
        }
    }
    return true;
};

ClientManager.prototype.addClient = function(socket, clientName) {
    this.clients[socket.id] = {
        socket: socket,
        name: clientName
    };
};

ClientManager.prototype.getClientByName = function(clientName) {
    for (var clientId in this.clients){
        if (this.clients[clientId].name === clientName) {
            return this.clients[clientId];
        }
    }
};

function startServer(httpServer) {
    var server = require("socket.io")(httpServer);
    var clientManager = new ClientManager();

    function validateMessage(socket, message) {
        return socket.id === message.sessionId;
    }

    server.on("connect", function(socket) {
        logger.info("A websocket client (id " + socket.id + ") connected from " + socket.request.connection.remoteAddress);

        socket.on(socketEvents.clientJoin, function (message) {
            logger.debug("Received " + socketEvents.clientJoin + " from " + socket.id + " - \"" + message + "\"");

            if (clientManager.isClientNameAvailable(message.name)) {
                // Requested name is available, notify the client by sending him his session id and add him to the list.
                clientManager.addClient(socket, message.name);
                socket.emit(socketEvents.clientWelcome, {
                    sessionId: socket.id
                });
            } else {
                // Requested name is already used, notify the client and disconnect him.
                socket.emit(socketEvents.clientNameNotAvailable);
                socket.disconnect();
            }
        });

        socket.on(socketEvents.chatMessage, function(message) {
            logger.debug("Received " + socketEvents.chatMessage + " from " + socket.id + " - \"" + message + "\"");

            // Broadcast to all
            server.emit(socketEvents.chatMessage, message);
            // Broadcasts to all but socket
            //socket.broadcast.emit("chatMessage", message);
        });

        socket.on("disconnect", function() {
            logger.info("A websocket client (id " + socket.id + ") disconnected from " + socket.request.connection.remoteAddress);
        });


    });
}

module.exports.startServer = startServer;
