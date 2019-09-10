'use strict';

const express = require('express');
const apiRouter = express.Router();

const User = require('./model/user');
const Brick = require('./model/lego');
const auth = require('./middleware/auth.js');
const oauth = require('./oauth/google.js');
const getFromApi = require('./web-api-route');

apiRouter.get('/brick', auth(), findBrickDB );
apiRouter.post('/brick', auth(), addBrickToUser);
apiRouter.put('/brick/:partNum', auth(), editBrick);
apiRouter.delete('/brick/:partNum', auth(), deleteBrick);

/**
 * Function checks our bricks DB to see if we already have the brick info
 * @param request -> part number
 * @param response -> {*}
 * @param next
 */
function findBrickDB(request, response, next){
  Brick.findOne({partNum: request.query.partNum})
    .then(result => {
      if(result){
        response.send(result);
      } else {
        getFromApi(request.query.partNum)
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

function getExistingCollection(request, response, next){
  let bricks = request.user.bricks;
  // let partNum = request.query.partNum;
  let quantity = bricks[request.query.partNum] ? bricks[request.query.partNum] : 0;
  console.log('QUANTITY', quantity);

  Brick.findOne({partNum: request.query.partNum})
    .then(result => {
      if(result){
        result.quantity = quantity;
        response.send(result);
      } else {
        // console.log(request.params.partNum);
        getFromApi(request.params.partNum)
          .then(result => {
            result.quantity = quantity;
            response.send(result);
          })
          .catch(console.log);
      }
    });
}

// function getBrick (request, response, next ) {
//   //Hanna- find lego brick by part number
//   console.log(User.bricks);
//   return User.bricks.findOne({partNum: request.params.partNum})
//     .then( result => response.status(200).json(result))
//     .catch( error => next( error) );
// }
// function getBrick (request, response, next ) {
//   //Hanna- find lego brick by part number
//   return Brick.findOne({partNum: request.params.partNum})
//     .then( result => response.status(200).json(result))
//     .catch( error => next( error) );
// }

// function createBrick( request, response, next) {
//   let brick = new Brick(request.body);
//   brick.save()
//     .then(results => {
//       console.log(User);
//       User.bricks[request.body.partNum] = 1;
//       return results;
//     })
//     .then(result => response.status(200).json(result) )
//     .catch( error => next( error ));
// }

function editBrick ( request, response, next ) {
  //console.log(request.params.partNum);
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
