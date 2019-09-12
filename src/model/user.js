'use strict';

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

userSchema.pre('save', async function () {
  // hash password before saving it
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // if the user Role Model doesn't exist yet create it
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

userSchema.statics.authenticateBasic = function (auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => { throw error; });
};

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

// refactoring generate token method to check for user capabilities and expiration variable
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

// Method for checking a specify users access controls
userSchema.methods.can = function (capability) {
  return capabilities[this.role].includes(capability);
};

userSchema.methods.generateKey = function () {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', userSchema);
