var createError = require('http-errors');
var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

const dashboardRouter = require("./routes/dashboard");         
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");

var app = express();
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-379498.okta.com/',
  token: '00a1HModIsWW02VWzz-RejjoPRKoGw_0QNaCv5p70h'
});
const oidc = new ExpressOIDC({
  issuer: "https://dev-379498.okta.com/oauth2/default",
  client_id: "0oazt7ynrU98cwGu2356",
  client_secret: "y5WIWfX-G6u8piB-DyFxRHK-RVGHIbhnyy1g_DhM",
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//express-session
app.use(session({
  secret: "KSKGJkskdi35u7593823jdnn3279f87vdshnqkhKHLKHLKHNkinaIO",
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

app.get('/test', (req, res) => {
  res.json({ profile: req.user ? req.user.profile : null });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
}

module.exports = app;
