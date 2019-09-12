'use strict';

const express = require('express');
const apiRouter = express.Router();

// Vinicio - let's organize this alphabetically
const Brick = require('./model/brick');
const auth = require('./middleware/auth.js');
const getFromApi = require('./web-api');
const getCookie = require('./middleware/cookies');

// Vinicio - good organization
apiRouter.get('/bricks', getCookie, auth(), getUserBricks);
apiRouter.get('/brick/:partNum', getCookie, auth(), findBrickDB);
apiRouter.post('/brick/:partNum',getCookie, auth(), addBrickToUser);
apiRouter.put('/brick/:partNum', getCookie, auth(), editBrick);
apiRouter.delete('/brick/:partNum', getCookie, auth(), deleteBrick);

/**
 * Function checks our bricks DB to see if we already have the brick info else get from Rebrickable API
 * @param request -> part number
 * @param response -> {*}
 * @param next
 */
function findBrickDB(request, response, next){
  Brick.findOne({partNum: request.params.partNum})
    .then(result => {
      if(result){
        response.send(result);
      } else {
        getFromApi(request.params.partNum)
          .then(result => {
            // Vinicio - a couple of empty lines in this block would be great
            let newBrick = new Brick(result);
            newBrick.name = result.name;
            newBrick.partNum = result.part_num;
            newBrick.imgUrl = result.part_img_url;
            newBrick.externalId = result.external_ids;
            newBrick.save();
            return newBrick;
          })
          // Vinicio - you don't need this then since return newBrick is not async
          .then(result => {
            response.send(result);
          })
          .catch(console.log);
          // Vinicio - same here, no response
      }
    })
    .catch(console.log);
  // Vinicio - same here, no response
}

/**
 * Function to increment brick in user collection, or add new brick to user collection
 * @param request
 * @param response
 * @param next
 */
function addBrickToUser (request, response, next){
  // Vinicio - make this const
  let partNum = request.params.partNum;
  let tempBricks = request.user.bricks;

  // A general theme I'm noticing is that you don't respond anything if there is an error
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
 * Function gets all bricks from a user and displays on the user collection ejs page
 * @param request
 * @param response
 * @param next
 */
function getUserBricks (request, response, next ) {
  let myBricks = request.user.bricks;
  // Vinicio - why is this in a try/catch? whta kind of error you are expecting?
  try {
    makeBrickDataArray(myBricks)
      .then(brickArray => {
        response.render('user-legos', { lego : brickArray});
      });
  }
  catch (error){
    // Vinicio - what happens if there is an error, you should still respond to the user
    console.log(error);
  }
}

/**
 * Function makes an array from all data return from bricks DB
 * @param myBricks -> object
 * @returns {*}
 */
async function makeBrickDataArray(myBricks){
  let brickArray = [];
  let keys = Object.keys(myBricks);
  let brickQuantity = Object.values(myBricks);

  for(let i = 0; i < keys.length; i++){
    // Vinicio - I'm not against await, but why are you using promises at some point and
    // await here?. Add a comment of use Promise.all
    let results = await getBrickDataFromDB(keys[i]);
    results.quantity = brickQuantity[i];
    brickArray.push(results);
  }
  return brickArray;
}

/**
 * Function finds a brick from brick database
 * @param partNum
 * @returns {*}
 */
function getBrickDataFromDB(partNum){
  return Brick.findOne({ partNum })
    .then( result => {
      return result;
    })
    .catch( console.log);
}

//TODO: Edit this to access user bricks
function editBrick ( request, response, next ) {
  return Brick.update( {partNum: request.params.partNum} , request.body)
    .then( result => response.status(200).json(result))
    .catch( error => next(error) );
}

//TODO: Still in progress
function deleteBrick ( request, response, next ) {
  // vinicio - you guessed it, this can be const ;)
  let partNum = request.params.partNum;
  let tempBricks = request.user.bricks;

  // Vinicio - let's not use console.log to debug
  console.log(partNum, tempBricks[partNum]);
  delete tempBricks[partNum];
  console.log(partNum, tempBricks[partNum]);

  request.user.update({bricks: tempBricks})
    .then(() => {
      response.send(request.user.bricks);
    })
    .catch(console.log);

}

module.exports = apiRouter;

