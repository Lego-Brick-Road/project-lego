'use strict';

const express = require('express');
const apiRouter = express.Router();

const Brick = require('./model/brick');
const auth = require('./middleware/auth.js');
const getFromApi = require('./web-api');
const getCookie = require('./middleware/cookies');

apiRouter.get('/bricks', getCookie, auth(), getUserBricks);
apiRouter.get('/brick/:partNum', getCookie, auth(), findBrickDB);
apiRouter.post('/brick/:partNum',getCookie, auth(), addBrickToUser);
apiRouter.put('/brick/:partNum', getCookie, auth(), editBrick);
apiRouter.delete('/brick/:partNum', getCookie, auth(), deleteBrick);

/**
 * This function gets brick data from database or rebrickable API
 * @route GET /brick/:partNum
 * @group Brick
 * @param {string} partNum.query.required - the partNum of the brick to be found
 * @returns {object} 200 - An object with brick data
 * @returns {Error}  default - Unexpected error
 */
function findBrickDB(request, response, next){
  Brick.findOne({partNum: request.params.partNum})
    .then(result => {
      if(result){
        response.send(result);
      } else {
        getFromApi(request.params.partNum)
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
    })
    .catch(console.log);
}

/**
 * This function increments brick quantity in user collection, or add new brick to user collection
 * @route POST /brick/:partNum
 * @group Brick
 * @param {string} partNum.query.required - the partNum of the brick to be found
 * @returns {object} 200 - An object with all bricks that belong to the user
 * @returns {Error}  default - Unexpected error
 */
function addBrickToUser (request, response, next){
  let partNum = request.params.partNum;
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
 * Function gets all bricks from a user and prepares it for rendering
 * @route GET /bricks
 * @group Brick
 * @param {string} request.user
 * @returns {object} 200 - An object with all brick data from user
 * @returns {Error}  default - Unexpected error
 */
function getUserBricks (request, response, next ) {
  let myBricks = request.user.bricks;
  try {
    makeBrickDataArray(myBricks)
      .then(brickArray => {
        response.render('user-legos', { lego : brickArray});
      });
  }
  catch (error){
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

/**
 * This function updates the quantity of bricks in user collection
 * @route PUT /brick/:partNum
 * @group Brick
 * @param {string} partNum.query.required - the partNum of the brick to be updated
 * @returns {object} 200 - An object with brick data
 * @returns {Error}  default - Unexpected error
 */

//TODO: Edit this to access user bricks
function editBrick ( request, response, next ) {
  return Brick.update( {partNum: request.params.partNum} , request.body)
    .then( result => response.status(200).json(result))
    .catch( error => next(error) );
}

/**
 * This function deletes bricks from user collection
 * @route DELETE /brick/:partNum
 * @group Brick
 * @param {string} partNum.query.required - the partNum of the brick to be deleted
 * @returns {object} 200 - An object with all brick data from user
 * @returns {Error}  default - Unexpected error
 */
//TODO: Still in progress
function deleteBrick ( request, response, next ) {
  let partNum = request.params.partNum;
  let tempBricks = request.user.bricks;

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

