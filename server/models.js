var crypto = require('crypto'),
    Document,
    User,
    LoginToken;

function defineModels(mongoose, fn) {
  var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

  /**
    * Model: User
    */
  function validatePresenceOf(value) {
    return value && value.length;
  }

  User = new Schema({
    'username': { type: String, validate: [validatePresenceOf, 'a username is required'], index: { unique: true } },
    'email': { type: String, lowercase: true,  validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    //'profPicLoc': {type: String}, //index: { unique: true}},

    // Array of poster ids
    'upVotes': {type: [String], 'default': []},
    'downVotes': {type: [String], 'default': []},
    'isArtist': {type: Boolean, 'default': false},

    'karmaPoints': {type: Number, 'default': 10},
    'personalWebsite': {type: String},
    'hashed_password': String,
    'registerTime': {type: Number},
    'registerDateStr': {type: String},
    'salt': String
  });

  User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });

  // Returns if the user has voted for a particular
  // transcription or not. 0 for no, 1 for downVote,
  // 2 for upVote
  User.statics.hasVoted = function(userId, trId, cb) {
    this.findById(userId, function(err, user) {
      if (user.upVotes.indexOf(trId) > -1) {
        cb(err, 2);
      } else if (user.downVotes.indexOf(trId) > -1) {
        cb(err, 1);
      } else {
        cb(err, 0);
      }
    });
  };

  User.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  });

  User.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  User.method('encryptPassword', function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  });

  // Never have < 0 karmaPoints
  User.pre('save', function(next) {
    // Convert to readable time
    if (!this.registerTime) {
      this.registerTime = Date.now();
    }
    this.registerDateStr = makeReadableTime(this.registerTime);

    if (this.karmaPoints < 0) {
      this.karmaPoints = 0;
    }
    next();
  });

  /*
  User.pre('save', function(next) {
    if (!validatePresenceOf(this.password)) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
  });
  */

  /**
    * Model: LoginToken
    *
    * Used for session persistence.
    */
  LoginToken = new Schema({
    username: { type: String, index: true },
    series: { type: String, index: true },
    token: { type: String, index: true }
  });

  LoginToken.method('randomToken', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  LoginToken.pre('save', function(next) {
    // Automatically create the tokens
    this.token = this.randomToken();

    if (this.isNew)
      this.series = this.randomToken();

    next();
  });

  LoginToken.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  LoginToken.virtual('cookieValue')
    .get(function() {
      return JSON.stringify({ username: this.username, token: this.token, series: this.series });
    });

  // Create models
  mongoose.model('User', User);
  mongoose.model('LoginToken', LoginToken);

  fn();
}


exports.defineModels = defineModels;
