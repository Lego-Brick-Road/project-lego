'use strict';


const express = require('express');
const myBricksRoute = express.Router();

const Brick = require('./model/lego');
const auth = require('./middleware/auth.js');
const oauth = require('./oauth/google.js');


myBricksRoute.get('/myBricks', auth() , getMyBricks);

function getMyBricks(request, response, next ) {
  console.log('route working');
  console.log(request.user.bricks);
  let myBricks = request.user.bricks;
  try {
    response.send(myBricks);
    response.status(200);
  }
  catch (error){
    console.log(error);
  }

}

module.exports = myBricksRoute;
