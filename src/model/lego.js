'use strict';

const mongoose = require('mongoose');

const brickSchema = mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  partNum: { type: String, required: true },
  externalId: { type: String },
});

module.exports = mongoose.model('bricks', brickSchema);
