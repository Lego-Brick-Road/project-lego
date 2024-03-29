'use strict';
/**
 * API Server Module
 * @module src/rebrickable-api
 */

const superagent = require('superagent');
module.exports = {};

/**
 * This function hits the Rebrickable API with part number to get part data
 * @param partNum
 * @returns {*}
 */
module.exports.getPartInfo = (partNum) => {
  const key = process.env.KEY;
  const partURL = `https://rebrickable.com/api/v3/lego/parts/${partNum}/?key=${key}`;

  return superagent.get(partURL)
    .then(results => {
      return JSON.parse(results.text);
    })
    .catch(console.log);
};

module.exports.getPartSets = (partNum) => {
  
};

