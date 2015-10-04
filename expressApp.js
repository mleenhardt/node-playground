var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var log4js = require("log4js");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var expressApp = express();

// view engine setup
expressApp.set('views', path.join(__dirname, 'views'));
expressApp.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//expressApp.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
expressApp.use(log4js.connectLogger(log4js.getLogger("[express]"), { level: "auto" }));
expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({extended: false}));
expressApp.use(cookieParser());
expressApp.use(require('less-middleware')(path.join(__dirname, 'public')));
expressApp.use(express.static(path.join(__dirname, 'public')));

expressApp.use('/', routes);
expressApp.use('/users', users);

// catch 404 and forward to error handler
expressApp.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (expressApp.get('env') === 'development') {
    expressApp.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
expressApp.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = expressApp;



