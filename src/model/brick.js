'use strict';

const mongoose = require('mongoose');

const brickSchema = mongoose.Schema({
  name: { type: String, required: true },
  partNum: { type: String, required: true },
  imgUrl: { type: String},
  externalId: { type: Object },
  url: { type: String }
});

module.exports = mongoose.model('bricks', brickSchema);
