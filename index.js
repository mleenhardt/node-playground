var logger = require("log4js").getDefaultLogger();
var express = require("./lib/express");

// TODO This should ideally come from a conf file
var port = 3000;
express.set("port", port);

var httpServer = require("http").createServer(express);
var webSocket = require("./lib/webSocket").startServer(httpServer);

httpServer.listen(port, function() {
    logger.info( "Http server listening on port" + port);
});