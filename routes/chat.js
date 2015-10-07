var express = require('express');
var router = express.Router();
var app = express();

router.get('/', function(req, res, next) {
    res.sendFile(app.get('views') + "/chat.html")
});

module.exports = router;
