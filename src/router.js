'use strict';

const express = require('express');
const apiRouter = express.Router();

const User = require('./model/user.js');
const auth = require('./middleware/auth.js');
const oauth = require('./oauth/google.js');

apiRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken(user.role);
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      // res.send(req.token);
      res.redirect('/classify');
    })
    .catch(next);
});

apiRouter.post('/signin', getCookie, auth(), (req, res, next) => {
  res.cookie('auth', req.token);
  // res.send(req.token);
  res.redirect('/classify');
});

// Gets cookie for auth
function getCookie(req, res, next){
  try {
    let [auth, cookieString] = req.headers.cookie.split('=');
    // console.log(cookieString);
    let newToken = 'bearer ' + cookieString;
    req.headers.authorization = newToken;
    next();
  } catch (error){
    console.log(error);
  }
}

apiRouter.get('/oauth', (req, res, next) => {
  oauth.authorize(req)
    .then(token => {
      res.status(200).send(token);
    })
    .catch(next);
});

// generates a key for indefinite use.
apiRouter.post('/key', auth(), (req, res, next) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});

module.exports = apiRouter;
