'use strict';

const express = require('express');
const apiRouter = express.Router();

const Brick = require('./model/lego');
const auth = require('./middleware/auth.js');
const getFromApi = require('./web-api-route');
const getCookie = require('./middleware/cookies');

apiRouter.get('/brick', getCookie, auth(), findBrickDB);
apiRouter.post('/brick',getCookie, auth(), addBrickToUser);
apiRouter.get('/bricks', getCookie, auth(), getUserBricks);
apiRouter.put('/brick/:partNum', getCookie, auth(), editBrick);
apiRouter.delete('/brick/:partNum', getCookie, auth(), deleteBrick);

/**
 * Function checks our bricks DB to see if we already have the brick info else get from Rebrickable API
 * @param request -> part number
 * @param response -> {*}
 * @param next
 */
function findBrickDB(request, response, next){
  console.log('HIT THE GET BRICK ROUTE');
  Brick.findOne({partNum: request.query.partNum})
    .then(result => {
      if(result){
        response.send(result);
      } else {
        getFromApi(request.query.partNum)
          .then(result => {
            let newBrick = new Brick(result);
            newBrick.name = result.name;
            newBrick.partNum = result.part_num;
            newBrick.imgUrl = result.part_img_url;
            newBrick.externalId = result.external_ids;
            newBrick.save();
            return newBrick;
          })
          .then(result => {
            response.send(result);
          })
          .catch(console.log);
      }
    });
}

/**
 * Function to increment brick in user collection, or add new brick to user collection
 * @param request
 * @param response
 * @param next
 */
function addBrickToUser (request, response, next){
  let partNum = request.query.partNum;
  let tempBricks = request.user.bricks;

  if(request.user.bricks[partNum]){
    tempBricks[partNum] = request.user.bricks[partNum] + 1;

    request.user.update({bricks: tempBricks})
      .then(() => {
        response.send(request.user.bricks);
      })
      .catch(console.log);
  } else {
    tempBricks[partNum] = 1;

    request.user.update({bricks: tempBricks})
      .then(() => {
        response.send(request.user.bricks);
      })
      .catch(console.log);
  }
}

/**
 * Function gets all bricks from a user and displays on the user collection page using ejs
 * @param request
 * @param response
 * @param next
 */
function getUserBricks (request, response, next ) {
  let myBricks = request.user.bricks;
  try {
    let brickArray = [];

    Object.keys(myBricks).forEach( partNum => {
      Brick.findOne({ partNum })
        .then( result => brickArray.push(result))
        .catch( console.log);
    });

    response.render('user-legos', { lego : brickArray});

    response.send(myBricks);
    response.status(200);
  }
  catch (error){
    console.log(error);
  }
}

function editBrick ( request, response, next ) {
  return Brick.update( {partNum: request.params.partNum} , request.body)
    .then( result => response.status(200).json(result))
    .catch( error => next(error) );
}

function deleteBrick ( request, response, next ) {
  return Brick.remove( {partNum: request.params.partNum})
    .then( result => response.status(200).json(result))
    .catch(error => next(error));
}

module.exports = apiRouter;
