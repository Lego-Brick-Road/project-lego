'use strict';

const express = require('express');
const apiRouter = express.Router();

const Brick = require('./model/lego');
const auth = require('./middleware/auth.js');
const getFromApi = require('./web-api-route');
const getCookie = require('./middleware/cookies');

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
 * Function to increment brick in user collection, or add new brick to user collection
 * @param request
 * @param response
 * @param next
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
 * Function gets all bricks from a user and displays on the user collection page using ejs
 * @param request
 * @param response
 * @param next
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

async function makeBrickDataArray(myBricks){
  let brickArray = [];
  let keys = Object.keys(myBricks);
  let brickQuantity = Object.values(myBricks);

  for(let i = 0; i < keys.length; i++){
    let results = await getBrickDataFromDB(keys[i]);
    results.quantity = brickQuantity[i];
    brickArray.push(results);
  }
  console.log('BRICK ARRAY', brickArray);
  return brickArray;
}

function getBrickDataFromDB(partNum){
  return Brick.findOne({ partNum })
    .then( result => {
      console.log('GET BRICK DATA DB- RESULT', result);
      return result;
    })
    .catch( console.log);
}


// Object.keys(myBricks).forEach( partNum => {
//   console.log('PART NUM', partNum);
//   Brick.findOne({ partNum })
//     .then( result => {
//       console.log('RESULT', result);
//       brickArray.push(result);
//     })
//     .then(() => {
//       console.log('BRICK ARRAY', brickArray);
//       response.render('user-legos', { lego : brickArray});
//     })
//     .catch( console.log);
// });

function editBrick ( request, response, next ) {
  return Brick.update( {partNum: request.params.partNum} , request.body)
    .then( result => response.status(200).json(result))
    .catch( error => next(error) );
}

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

