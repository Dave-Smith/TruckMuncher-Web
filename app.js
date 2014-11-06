/*jshint node:true*/

if (process.env.VCAP_APP_HOST) {
    require('loganalysis');
}
var express = require('express'),
    session = require('express-session'),
    path = require('path'),
    api = require('./api'),
    routes = require('./routes'),
    config = require('./oauth'),
    passport = require('passport'),
    favicon = require('serve-favicon'),
    q = require('q'),
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile, {accessToken: accessToken});
        });
    }
));

passport.use(new TwitterStrategy({
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        callbackURL: config.twitter.callbackURL
    },
    function (token, tokenSecret, profile, done) {
        process.nextTick(function () {
            return done(null, profile, {token: token, tokenSecret: tokenSecret});
        });
    }
));

// setup middleware
var app = express();

app.use(favicon(__dirname + '/public/img/favicon.ico'));

var sess = {
// 	genid: function(req) {
//     return genuuid(); // use UUIDs for session IDs
// },
    secret: 'MunchyTruckMunch3r',
    resave: true,
    saveUninitialized: true,
    cookie: {}
};

//use secure cookies on bluemix
if (process.env.VCAP_APP_HOST) {
   app.set('trust proxy', 1); // trust first proxy
   sess.cookie.secure = true; // serve secure cookies
}

app.use(express.cookieParser());
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.errorHandler());

app.all('*', function (req, res) {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
});

app.use(function (req, res, next) {
    res.locals.sessionToken = req.session.sessionToken;
    //force https on everything but localhost
    var schema = req.headers['x-forwarded-proto'];
    if (schema === 'https' || host === 'localhost') {
        next();
    }
    else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});

app.use(app.router);
app.use(express.static(__dirname + '/public')); //setup static public directory

app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views


app.use(express.static(path.join(__dirname, '/lib')));

app.get('/', routes.index);

app.get('/partials/*', routes.partials);

app.get('/logout', routes.logout);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', function (req, res, next) {
    passport.authenticate('twitter', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            api.login(info.token, info.tokenSecret, null).then(function (response) {
                req.session.sessionToken = response.sessionToken;
                return res.redirect('/#/vendors/menu');
            }, function () {
                //TODO: handle error
                return next();
            });
        });
    })(req, res, next);
});

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', function (req, res, next) {
    passport.authenticate('facebook', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            api.login(null, null, info.accessToken).then(function (response) {
                req.session.sessionToken = response.sessionToken;
                return res.redirect('/#/vendors/menu');
            }, function () {
                //TODO: handle error
                return next;
            });
        });
    })(req, res, next);
});

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");

// Start server
app.listen(port, host);
console.log('App started on port ' + port);
