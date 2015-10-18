var logger = require("log4js").getDefaultLogger();

const socketEvents = {
    clientJoin : "client.join",
    welcome: "welcome",
    chatMessage: "chat.message",
    clientLeft: "client.left"
};

function ClientManager() {
    // Ideally, we'd want to use ES6's Map.
    this.clients = {};
}

ClientManager.prototype.addClient = function(socket, clientName) {
    this.clients[socket.id] = {
        socket: socket,
        name: clientName
    };
};

ClientManager.prototype.removeClient = function(socket) {
    delete this.clients[socket.id];
};

ClientManager.prototype.getClient = function(socket) {
    return this.clients[socket.id];
};

ClientManager.prototype.getClientByName = function(clientName) {
    for (var clientId in this.clients){
        if (this.clients[clientId].name === clientName) {
            return this.clients[clientId];
        }
    }
};

ClientManager.prototype.isClientNameAvailable = function(clientName) {
    for (var clientId in this.clients){
        if (this.clients[clientId].name === clientName) {
            return false;
        }
    }
    return true;
};


function startServer(httpServer) {
    var server = require("socket.io")(httpServer);
    var clientManager = new ClientManager();

    function validateMessage(socket, data) {
        if (socket.id !== data.sessionId) {
            logger.info("Socket id (" + socket.id + ") doesn't match message session id (" + data.sessionId + ")");
            socket.disconnect("Invalid session Id");
        }
    }

    server.use(function(socket, next) {
        var name = socket.handshake.query.name;

        logger.info("A websocket client (id " + socket.id + ", name " + name + ") connected from " + socket.request.connection.remoteAddress);

        if (clientManager.isClientNameAvailable(name)) {
            // Requested name is available, notify the client by sending him his session id and add him to the list.
            clientManager.addClient(socket, name);
            socket.emit(socketEvents.welcome, socket.id);
            socket.broadcast.emit(socketEvents.clientJoin, name);
            return next();
        } else {
            // Requested name is already used
            next(new Error("Name not available"));
        }
    });

    server.on("connect", function(socket) {

        socket.on(socketEvents.chatMessage, function(data) {
            logger.debug("Received " + socketEvents.chatMessage + " from " + socket.id + " - \"" + data + "\"");
            validateMessage(socket, data);
            // Broadcast to all
            server.emit(socketEvents.chatMessage, {
                name: clientManager.getClient(socket).name,
                message: data.message
            });
        });

        socket.on("disconnect", function() {
            logger.info("A websocket client (id " + socket.id + ") disconnected from " + socket.request.connection.remoteAddress);
            var client = clientManager.getClient(socket);
            if (client !== undefined) {
                // The client was added in the manager, i.e. it's a legit client with a valid name
                socket.broadcast.emit(socketEvents.clientLeft, client.name)
                clientManager.removeClient(socket);
            }
        });
    });
}

module.exports.startServer = startServer;