'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var defaultLogger = require('./logger');
var expireHandler = require('./expireHandler');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var EventsModel = require("./models/events")
var User = require('./schema').Users;
var googleClientInfo = require('./googleClient.json');
var api = require('./api/index');
const os = require('os');

//require('./init');
let appPath = "dist"

process.env.constPath = os.homedir();

var app = express();
// view engine setup
app.set('views', path.join(__dirname, appPath + '/views/'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, appPath)));
app.use(session({
    store: new RedisStore(),
    secret: 'anything',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 32503656600000, httpOnly: false}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', api);
app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/s/sign-in'
}), function (req, res, next) {
    // Successful authentication, redirect home.
    var sess = req.session;
    console.log("session cookie " + sess.cookie);
    console.log("the response%%%%%%%%%%%%%%%%%%%%%%%%%% ", req.user.j)
    res.cookie('user', JSON.parse(JSON.stringify(req.user)), {maxAge: 32503656600000, httpOnly: false});

    if (req.cookies.cta == "joinEvent") {
        if (req.cookies.eventHandle) {
            EventsModel.fetchEventByHandle(req.cookies.eventHandle, function (err, result) {
                if (result && !result.isPremium) {
                    res.redirect("/s/create-profile");
                } else {
                    res.redirect("/s/select-event");
                }
            })
        } else {
            res.redirect("/s/select-event");
        }

    } else if (req.cookies.cta == "createEvent") {
        res.redirect("/s/create-event");
    } else {
        if (req.cookies.eventHandle) {
            res.redirect("/g/" + req.cookies.eventHandle);
        } else {
            res.redirect("/");
        }
    }
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/g/:handle', function (req, res, next) {
    var eHandle = req.params.handle;
    res.cookie('eventHandle', eHandle, {maxAge: 32503656600000, httpOnly: false});
    if (req.user) {
        // logged in
        EventsModel.fetchEventByHandle(eHandle, function (err, result) {
            if (result && !result.isPremium) {

                result = JSON.parse(JSON.stringify(result))
                result.liveEvents = [];
                result.futureEvents = [];
                result.doneEvents = [];
                // result.eventId = result._id;
                // delete result._id;
                // logger.debug('result type', typeof result, result);
                result.subEvent.forEach(function (subEvent) {
                    let now = new Date();
                    let todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    let tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
                    if ((result.eventTimestamp >= todayStart && tomorrowStart < tomorrowStart) || subEvent.isDefault === true) {
                        result.liveEvents.push(subEvent);
                    } else if (result.eventTimestamp >= tomorrowStart) {
                        result.futureEvents.push(subEvent);
                    } else if (result.eventTimestamp < todayStart) {
                        result.doneEvents.push(subEvent);
                    } else {
                        result.doneEvents.push(subEvent);
                    }
                    // logger.debug(result.liveEvents, result.doneEvents, result.futureEvents);
                });
                delete result.subEvent;

                res.cookie('eventDetails', JSON.parse(JSON.stringify(result)), {
                    maxAge: 999999999,
                    httpOnly: false
                });
                res.redirect("/s/create-profile");
            } else {
                res.redirect("/s/select-event");
            }
        })
    } else {
        // not logged in
        res.redirect("/s/sign-in");
    }

})

app.use('/s', function (req, res, next) {
    res.render('index', {
        title: 'Skippr'
    });
});


app.use('/', function (req, res, next) {
    res.render('index.amp.ejs', {
        title: 'Skippr'
    });
});
passport.serializeUser(function (user, done) {
    done(null, user.googleId);
});
passport.deserializeUser(function (user, done) {
    User.findOne({
        googleId: user
    }, {
        __v: 0,
        createDate: 0
    }, done);
});
passport.use(new GoogleStrategy({
        clientID: googleClientInfo.web.client_id,
        clientSecret: googleClientInfo.web.client_secret,
        callbackURL: "http://skippr.co/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
        //defaultLogger.info(profile);
        User.findOne({
            googleId: profile.id
        }, {
            __v: 0,
            createDate: 0
        }, function (err, user) {
            if (user) {
                return cb(err, user);
            } else {
                var profilePic = profile.photos[0].value;
                profilePic = profilePic.substring(0, profilePic.length - 2) + "400"

                var users = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    isPremium: false,
                    createDate: new Date(),
                    googleProfileImg: profilePic
                });
                users.save(cb);
            }
        });
    }
));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    defaultLogger.error('application error', err);
    // render the error page
    res.status(err.status || 500);
    res.send({
        status: false,
        message: 'invalid request'
    });
});
app.listen(8082);
console.log("8082 is the magic port");

function checkExpires() {
    setTimeout(function () {
        process.nextTick(function () {
            expireHandler(function () {
                checkExpires();
            });
        });
    }, 60000);
}
checkExpires();
module.exports = app;
