'use strict';
/**
 * Auth Routes Module
 * @module src/brick-router
 */

const express = require('express');
const apiRouter = express.Router();

const auth = require('./middleware/auth.js');
const Brick = require('./model/brick.js');
const getCookie = require('./middleware/cookies');
const Rebrickable = require('./rebrickable-api');
const User = require('./model/user');


apiRouter.get('/bricks', getCookie, auth(), getUserBricks);
apiRouter.get('/brick/:partNum', getCookie, auth(), findBrickDB);
apiRouter.post('/brick/:partNum',getCookie, auth(), addBrickToUser);
apiRouter.put('/brick/:partNum', getCookie, auth(), editBrick);
apiRouter.delete('/brick/:partNum', getCookie, auth(), deleteBrick);
apiRouter.get('/brickstotal', getCookie, auth(), getUserTotal);
apiRouter.get('/leaderboard', getCookie, auth(), getUsers);

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
        Rebrickable.getPartInfo(request.params.partNum)
          .then(result => {
            let newBrick = new Brick(result);

            newBrick.name = result.name;
            newBrick.partNum = result.part_num;
            newBrick.imgUrl = result.part_img_url;
            newBrick.externalId = result.external_ids;

            return newBrick.save();
          })
          .then(result => {
            response.send(result);
          })
          .catch(next);
      }
    });
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
  const partNum = request.params.partNum;
  const tempBricks = request.user.bricks;

  if(request.user.bricks[partNum]){
    tempBricks[partNum] = request.user.bricks[partNum] + 1;

    request.user.update({bricks: tempBricks})
      .then(() => {
        response.send(request.user.bricks);
      });
  } else {
    tempBricks[partNum] = 1;

    request.user.update({bricks: tempBricks})
      .then(() => {
        response.send(request.user.bricks);
      });
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
  if(request.user.bricks.length !== 0){
    let myBricks = request.user.bricks;
    makeBrickDataArray(myBricks)
      .then(brickArray => {
        response.status(200);
        response.render('user-legos', { lego : brickArray});
      });
  } else {
    next();
  }
}

/**
 * Function makes an array from all data return from bricks DB
 * @param myBricks -> object
 * @returns {*}
 */
async function makeBrickDataArray(myBricks){
  const brickArray = [];
  const keys = Object.keys(myBricks);
  const brickQuantity = Object.values(myBricks);

  for(let i = 0; i < keys.length; i++){
    let results = await getBrickDataFromDB(keys[i]);
    if (results){
      results.quantity = brickQuantity[i];
      brickArray.push(results);
    } else {
      brickArray.push({ partNum:keys[i], quantity:brickQuantity[i]});
    }
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
    });
}

/**
 * This function updates the quantity of bricks in user collection
 * @route PUT /brick/:partNum
 * @group Brick
 * @param {string} partNum.query.required - the partNum of the brick to be updated
 * @returns {object} 200 - An object with brick data
 * @returns {Error}  default - Unexpected error
 */
function editBrick ( request, response, next ) {
  const partNum = request.params.partNum;
  const tempBricks = request.user.bricks;
  tempBricks[partNum] = tempBricks[partNum] > 0 ? tempBricks[partNum] -1 : tempBricks[partNum];
  
  request.user.update({bricks: tempBricks})
    .then(() => {
      response.status(204);
      response.send(request.user.bricks);
    })
    .catch(next);
}

/**
 * This function deletes bricks from user collection
 * @route DELETE /brick/:partNum
 * @group Brick
 * @param {string} partNum.query.required - the partNum of the brick to be deleted
 * @returns {object} 200 - An object with all brick data from user
 * @returns {Error}  default - Unexpected error
 */
function deleteBrick ( request, response, next ) {
  const partNum = request.params.partNum;
  const tempBricks = request.user.bricks;

  delete tempBricks[partNum];

  request.user.update({bricks: tempBricks})
    .then(() => {
      response.send(request.user.bricks);
    })
    .catch(next);
}

/**
 * This function calculates the number of types of lego parts the user has and total number of legos in their collection
 * @route GET /brickstotal
 * @group User Data
 * @param {string} request - user's brick collection
 * @returns {object} Number of lego part types and total lego parts in user's collection
 * @returns {Error}  default - Unexpected error
 */
function getUserTotal(request, response, next ){
  if (request.user.bricks.length !== 0){
    const myBricks = request.user.bricks;
    const myBrickNums = Object.values(myBricks);
    let numOfbricks = 1;
    let totalQuantity = 0;

    for (let i = 0; i < myBrickNums.length; i++) {
      numOfbricks = numOfbricks++;
      totalQuantity = totalQuantity + myBrickNums[i];
    }

    response.send(`Number of Lego Part types: ${numOfbricks}.  Total lego parts you have: ${totalQuantity}`);
  } else {
    next();
  }
}

/**
 * This function retrieves all users in db, returns an array of user objects sorted by highest number of total bricks
 * @route GET /leaderboard
 * @group User Data
 * @param {string} request - user's brick collection
 * @returns {object} Array of objects containing username and total number of bricks
 * @returns {Error}  default - Unexpected error
 */
function getUsers(request, response, next){
  let userArray = [];
  User.find({})
    .then(result => {
      for(let i = 0; i < result.length; i++){
        let userBricks = 0;
        Object.values(result[i].bricks).forEach(value =>{
          userBricks = userBricks + value;
        });

        userArray.push({user: result[i].username, total: userBricks});
      }
      userArray.sort((a,b)=>{
        return b.total - a.total;
      });
      response.send(userArray);
    })
    .catch(next);
}

module.exports = apiRouter;
