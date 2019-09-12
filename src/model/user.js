'use strict';
/**
 * API Server Module
 * @module src/model/user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Role = require('./role.js');

const SINGLE_USE_TOKENS = !!process.env.SINGLE_USE_TOKENS;
const TOKEN_EXPIRE = process.env.TOKEN_LIFETIME || '120m';
const SECRET = process.env.SECRET || 'removethis';

const usedTokens = new Set();

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String},
  role: { type: String, required: true, default: 'user', enum: ['user', 'admin', 'editor', 'superuser'] },
  bricks: { type: Object , default: {}},
}, {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

userSchema.virtual('capabilities', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne: true,
});

userSchema.pre('findOne', async function () {
  try {
    this.populate('capabilities');
  }
  catch (e) {
    console.error('userSchema Find Prehook Error', e);
  }
});

const capabilities = {
  superuser: [ 'superuser'],
  user: ['create', 'read', 'update', 'delete'],
};

/**
 * Pre hook uses bcrypt to hash the password, saves the Role Model if it doesn't already exist
 */
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  try {
    let userRole = await Role.findOne({ role: this.role });
    if (!userRole) {
      userRole = new Role({ role: this.role, capabilities: capabilities[this.role] });
      await userRole.save();
    }
  } catch (err) {
    console.error(`ERROR ${err}`);
  }
});

/**
 * Finds a user where a token was used in bearer authentication
 * @method authenticateToken
 * @param token
 * @returns {object|Error}
 */
userSchema.statics.authenticateToken = function (token) {
  if (usedTokens.has(token)) {
    return Promise.reject('Invalid Token');
  }
  try {
    let parsedToken = jwt.verify(token, SECRET);
    (SINGLE_USE_TOKENS) && parsedToken.type !== 'key' && usedTokens.add(token);
    let query = { _id: parsedToken.id };
    return this.findOne(query);
  } catch (e) {
    throw new Error('Invalid Token');
  }
};

/**
 * Finds a user where basic authentication
 * @method authenticateBasic
 * @param auth
 * @returns {object} - user
 */
userSchema.statics.authenticateBasic = function (auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => { throw error; });
};

/**
 * Uses bcrypt to check if password is valid
 * @method comparePassword
 * @param password
 * @returns {object| null}
 */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

/**
 * Checks for user capabilities and expiration, generates token
 * @method generateToken
 * @param type
 * @returns {*}
 */
userSchema.methods.generateToken = function (type) {
  let token = {
    id: this._id,
    capabilities: capabilities[this.role],
    type: type || 'user',
  };

  let options = {};

  if (type !== 'key' && !!TOKEN_EXPIRE) {
    options = { expiresIn: TOKEN_EXPIRE };
  }
  return jwt.sign(token, SECRET, options);
};

/**
 * Checks a user for access controls
 * @method can
 * @param capability
 * @returns {*}
 */
userSchema.methods.can = function (capability) {
  return capabilities[this.role].includes(capability);
};

/**
 * Generates key that does not expire
 * @method generateKey
 * @returns {*}
 */
userSchema.methods.generateKey = function () {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', userSchema);
