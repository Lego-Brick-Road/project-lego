'use strict';

const express = require('express');
const apiRouter = express.Router();

const superagent = require('superagent');

let partNum = 10049;

apiRouter.get('/newBrick', (req, res, next) => {
  req.params.key = process.env.KEY;
  const partURL = `https://rebrickable.com/api/v3/lego/parts/${partNum}/?key=${req.params.key}`;

  superagent.get(partURL)
    .then(results => {
      res.status(200);
      let brick = JSON.parse(results.text);
      // TODO: Need to figure out where to send this information
      res.send(brick);
    })
    .catch(next);
});

module.exports = apiRouter;