'use strict';

const express = require('express');
const apiRouter = express.Router();

const User = require('./model/user.js');
const auth = require('./middleware/auth.js');
const getCookie = require('./middleware/cookies');

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

// generates a key for indefinite use.
apiRouter.post('/key', auth(), (req, res, next) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});

module.exports = apiRouter;
