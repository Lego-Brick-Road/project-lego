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

//If user gives us a couple of part nums that they have, what can we give back to them
//Maybe give them back a list of colors a lego appears in
// then take in the part num, color and give back some information
// get average price of a lego part
//get the total value of a user's lego collection

const getColors = (partNum) => {
  let key = process.env.KEY;
  const colorsURL = `https://rebrickable.com/api/v3/lego/parts/${partNum}/colors?key=${key}`;

  return superagent.get(colorsURL)
    .then(results => {
      let colors = JSON.parse(results.color_name);
      return colors;
    })
    .catch(console.log);

};

//this function takes in partNum and color id, returns what sets the part appears in

const getSetsOfPart = (partNum, color_id) => {
  let key = process.env.key;
  const getSetsURL =  `https://rebrickable.com/api/v3/lego/parts/${partNum}/colors/${color_id}/sets/?key=${key}`;

  return superagent.get(getSetsURL)
    .then(results => {
      let setsOfPart = JSON.parse(results.name);
      return setsOfPart;
    })
    .catch(console.log);
};


module.exports = getFromApi;
