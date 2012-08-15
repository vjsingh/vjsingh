/**
 * Module dependencies.
 */

var express = require('express'),
  //jade = require('jade'),
  expressValidator = require('express-validator'),
  check = require('validator').check,
  sanitize = require('validator').sanitize,
  app = module.exports = express.createServer(),
  mongoose = require('mongoose'),
  mongoStore = require('connect-mongo')(express),
  models = require('./models'),
  stylus = require('stylus'),
  siteConf = require('./lib/getConfig'),
  fs = require('fs'),
  path = require('path'),
  crypto = require('crypto'),
  db,
  Artwork, User, LoginToken, Bounty;
  //routes = require('./routes')


var sys = require('util');
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }

// Configuration
var IS_LOCAL_MACHINE = siteConf.isLocal;

app.configure(function(){
  app.set('db-uri', 'TODO:db-uri' + siteConf.dbName);
  app.set('views', '../src/views/');
  app.set('view engine', 'jade');
  // set pretty to false for editable fields in transcriptionDisplay
  // Extra whitespace added when editing AARGHHH
  //app.set('view options', {pretty: false});
  app.set('view options', {layout: false});
  app.use(express.static(__dirname + '/../public'));

  app.use(express.bodyParser());
  app.use(expressValidator);

  app.use(express.cookieParser());
  /*
  app.use(express.session({
    secret: siteConf.sessionSecret
  }));
  */
  app.use(express.session({
	secret: siteConf.sessionSecret
  }));

  app.use(express.methodOverride());
  app.use(loadUser);
  app.use(checkUser);
  app.use(app.router);
  // Default route is html/, explicitly specify all others
  app.use(function(req, res, next) {
    res.render('404', { status: 404, error: 'error description' });
  });

  app.dynamicHelpers({
    user: function(req, res) {
      return req.currentUser || new User();
    },
    scripts: function(req, res) {
      var scripts = [];
      if (IS_LOCAL_MACHINE) {
        scripts.push('http://localhost:8001/vogue-client.js');
      }
      return scripts;
    },
    cssScripts: function(req, res) {
      var scripts = [];
      return scripts;
    }
  });
  process.on('uncaughtException', function(err) {
    console.log("ZQX Caught Exception: ", err);
  });

});

app.configure('development', function(){
  //app.use(express.logger({format: ':method :uri' }));
  app.use(express.logger());
  app.use(express.errorHandler({
    dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.logger());
  // TODO take out
  app.use(express.errorHandler({
    dumpExceptions: true, showStack: true }));
  //app.use(express.errorHandler());
});

app.configure('test', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Error
app.error(function(err, req, res, next) {
  console.log("ZQX GOT ERROR, in app.error");
  console.log(err);
  console.log(err.stack);
  res.render('500', {
    error: err
  });
});

models.defineModels(mongoose, function() {
    app.User = User = mongoose.model('User');
    app.LoginToken = LoginToken = mongoose.model('LoginToken');
    db = mongoose.connect(app.set('db-uri'));
});



//**********************************
// Helper functions
//**********************************

function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken);

  LoginToken.findOne({ username: cookie.username,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {
    if (!token) {
      next();
      return;
    }

    User.findOne({ username: token.username }, function(err, user) {
      if (user) {
        req.session.user_id = user.id;
        req.currentUser = user;

        token.token = token.randomToken();
        token.save(function() {
          res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          next();
        });
      } else {
        next();
      }
    });
  }));
}

function getReadableTime(mill) {
}


//**********************************
//Middleware
//**********************************

function member(req, res, next) {
  if (!req.currentUser) {
      res.redirect('/signup');
  } else {
    next();
  }
}
function loadUser(req, res, next) {
  function foundUser(err, user) {
    if (user) {
      req.currentUser = user;
      next();
    }
  }
  if (req.session.user_id) {
    User.findById(req.session.user_id, foundUser);
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    next();
  }
}
function checkUser(req, res, next) {
  //console.log(req.currentUser);
  next();
}
function validateErr(req, res, next) {
  req.onValidationError(function(msg) {
    console.log('Validation Error: ' + msg);
    throw new Error(msg);
  });
  next();
}

app.listen(3000);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);



//**********************************
// Routes
//**********************************
app.get('/', function(req, res) {
  console.log("IN INDEX");
  res.render('index', {isDevelopment: true});
});

// Sessions
app.get('/login', function(req, res) {
  res.render('login', {});
});

app.post('/checkValidLogin', function(req, res) {
  var returnObj = {
    url: '/'
  };
  function loginFailed() {
    returnObj.succeeded = false;
    res.write(JSON.stringify(returnObj));
    res.end();
  }
  function loginSucceed() {
    returnObj.succeeded = true;
    res.write(JSON.stringify(returnObj));
    res.end();
  }
  if (!req.body.user || !req.body.user.username || !req.body.user.password) {
    loginFailed();
    return;
  }
  var username = req.body.user.username,
      password = req.body.user.password;
  User.findOne({ username: username}, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      loginSucceed();
    } else {
      loginFailed();
    }
  });
});

app.post('/login', function(req, res) {
  function loginFailed() {
    res.redirect('/loginFailed');
    res.end();
  }
  function loginSucceed() {
    res.redirect('/');
    res.end();
  }
  if (!req.body.user || !req.body.user.username || !req.body.user.password) {
    loginFailed();
    return;
  }
  var username = req.body.user.username,
      password = req.body.user.password;
  User.findOne({ username: username}, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;
      req.currentUser = user;

      // Remember me
      //if (req.body.remember_me) {
      if (true) {
        var loginToken = new LoginToken({ username: user.username });
        loginToken.save(function() {
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          loginSucceed();
        });
      } else {
        loginSucceed();
      }
    } else {
      loginFailed();
    }
  });
});

app.get('/logout', member, function(req, res) {
  if (req.session) {
    LoginToken.remove({ username: req.currentUser.username }, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/');
  res.end();
});

app.post('/register', function(req, res) {
  var user = req.body.user;
  user.isArtist = true;
  user = new User(user);
  var paramsToCheck = ['username', 'email', 'password'];
  paramsToCheck.forEach(function(v) {
    user[v] = sanitize(user[v]).trim();
    check(user[v], 'Invalid ' + v + '!').notEmpty().len(3, 64);
  });
  check(user.email).isEmail();


  function userSaveFailed(err) {
    console.log(err);
    res.write('"failure"');
    res.end();
  }

  user.registerTime = Date.now();
  user.save(function(err) {
    if (err) return userSaveFailed(err);

    //req.flash('info', 'Your account has been created');
    //emails.sendWelcome(user);

    req.session.user_id = user.id;
    res.write('"success"');
    res.end();
  });
});

// Check Registration Duplicate
(function() {
  function checkField(fieldName, req, res) {
    if (!req.query || !req.query.user || !req.query.user[fieldName]) {
      res.write('true');
      res.end();
    } else {
      var field = req.query.user[fieldName];
      if (!field.length || field.length < 3) {
        res.write('true');
        res.end();
      } else {
        var searchObj = {};
        searchObj[fieldName] = field;
        User.findOne(searchObj, function(err, user) {
          if (err || user) {
            res.write('false');
            res.end();
          } else {
            res.write('true');
            res.end();
          }
        });
      }
    }
  }
  app.get('/checkUsername/', function(req, res) {
    checkField('username', req, res);
  });
  app.get('/checkEmail/', function(req, res) {
    checkField('email', req, res);
  });
})();

app.get('/getUsername/:userId', function(req, res) {
  var userId = req.params.userId;
  // TODO: Only get username field
  User.findById(userId, function(err, user) {
    if (err) {
      throw Error(err);
    }
    res.write(user.username + "");
    res.end();
  });
});

