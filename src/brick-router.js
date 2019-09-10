'use strict';

const express = require('express');
const apiRouter = express.Router();

const Brick = require('./model/lego');
const auth = require('./middleware/auth.js');
const oauth = require('./oauth/google.js');

apiRouter.get('/brick/:partNum', getBrick );
apiRouter.post('/brick', createBrick);
apiRouter.put('/brick/:partNum', editBrick);
apiRouter.delete('/brick/:partNum', deleteBrick);




function getBrick (request, response, next ) {
  //Hanna- find lego brick by part number
  return Brick.findOne({partNum: request.params.partNum})
    .then( result => response.status(200).json(result))
    .catch( error => next( error) );
}

function createBrick( request, response, next) {
  let brick = new Brick(request.body);
  brick.save()
    .then( result => response.status(200).json(result) )
    .catch( error => next( error ));
}

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
