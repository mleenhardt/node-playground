var logger = require("log4js").getDefaultLogger();
var expressApp = require("./expressApp");

var port = 3000;
expressApp.set("port", port);

var httpServer = require("http").createServer(expressApp);
//require("./socketIoApp")(httpServer);

httpServer.listen(port, function() {
    logger.info( "Http server listening on port" + port);
});