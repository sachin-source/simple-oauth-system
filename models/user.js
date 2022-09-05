
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;
const oAuthTypes = ['github', 'twitter', 'google', 'linkedin'];

/**
 * User Schema
 */

const UserSchema = new Schema({
  name: { type: String, default: '', trim: true, required: true },
  email: { type: String, default: '', trim: true, required: true, unique: true },
  provider: { type: String, default: 'custom', trim: true },
  hashed_password: { type: String, default: '', trim: true, required: true },
  role: { type: String, default: 'user', trim: true, required: true },
  authToken: { type: String, default: '' },
  notificationToken: [{ type: String }],
});

const validatePresenceOf = value => value && value.length;

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set(function (password) {
    this._password = password;
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

/**
 * Pre-save hook
 */

UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  if (!validatePresenceOf(this.password) && !this.skipValidation()) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @return {Boolean}
   * @api public
   */

  authenticate: function (password) {
    return bcrypt.compareSync(password, this.hashed_password);
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return bcrypt.hashSync(password, 10);
    } catch (err) {
      return '';
    }
  },
};

/**
 * Statics
 */

UserSchema.statics = {

  /**
   * Load
   * @param {Object} options for find select
   * @param {Fucntion} cb to send back the user data
   * @description Load the public data of particular user
   */

  load: function (options, cb) {
    options.select = options.select || 'name username';
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  },

  /**
   * List
   * @param {Object} options for find select
   * @param {Fucntion} cb to send back the users' data
   * @description Load the public data of users - not used now
   */

  list: function (options, cb) {
    const { find, select = 'name email -_id' } = options;
    return this.find(find)
      .select(select)
      .exec(cb);
  },

    /**
   * Signup
   * @param {Object} options includes email, name, password and role of new user
   * @param {Fucntion} cb to send back the status
   * @description Very bare minimum functionality for singup, will be updated soon
   */

  signUp: function (options, cb) {
    const { email, name, password, role } = options;
    const user = new this({ email, name, password, role });
    user.save((err, response) => {
      cb(err, response)
    })
  },
  
    /**
   * Login
   * @param {Object} options includes email, and password of user
   * @param {Fucntion} cb to send back the authentication status
   * @description login functionality
   */

  login: function (options, cb) {
    const { email, password } = options;
    this.findOne({ email }, (err, data) => {
      const same = bcrypt.compareSync(password, data.hashed_password);
      cb(err, same, data)
    })
  },
};

module.exports = mongoose.model('user', UserSchema);