'use strict';

const superagent = require('superagent');

/**
 * Hits Rebrickable API with part number to get part data
 * @param partNum
 * @returns {Promise}
 */
const getFromApi = (partNum) => {
  // Vinicio - this should be a const
  let key = process.env.KEY;
  const partURL = `https://rebrickable.com/api/v3/lego/parts/${partNum}/?key=${key}`;

  return superagent.get(partURL)
    .then(results => {
      // Vinicio - this can be const
      // Vinicio - also, I don't think it's neccessary to divide this in two lines
      let brick = JSON.parse(results.text);
      return brick;
    })
    .catch(console.log);
};


module.exports = getFromApi;