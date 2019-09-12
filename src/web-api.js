'use strict';

const superagent = require('superagent');

/**
 * Hits Rebrickable API with part number to get part data
 * @param partNum
 * @returns {Promise}
 */
const getFromApi = (partNum) => {
  let key = process.env.KEY;
  const partURL = `https://rebrickable.com/api/v3/lego/parts/${partNum}/?key=${key}`;

  return superagent.get(partURL)
    .then(results => {
      let brick = JSON.parse(results.text);
      return brick;
    })
    .catch(console.log);
};


module.exports = getFromApi;
