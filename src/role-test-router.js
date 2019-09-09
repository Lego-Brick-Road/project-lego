'use strict';

const express = require('express');
const apiRouter = express.Router();

const User = require('./model/user.js');
const Article = require('./model/article.js');
const auth = require('./middleware/auth.js');
const oauth = require('./oauth/google.js');

apiRouter.get('/public-stuff', (req, res, next) => {
  res.send('success');
});

apiRouter.get('/hidden-stuff', auth(), (req, res, next) => {
  console.log('ATTACHED USER ROLE', req.user);
  res.send('success');
});

apiRouter.get('/something-to-read', auth('read'), (req, res, next) => {
  res.send(req.user.can('read'));
});

apiRouter.post('/create-a-thing', auth('create'), (req, res, next) => {
  res.send(req.user.can('create'));
});

apiRouter.put('/update', auth('update'), (req, res, next) => {
  res.send(req.user.can('update'));
});

apiRouter.patch('/jp', auth('update'), (req, res, next) => {
  res.send(req.user.can('update'));
});

apiRouter.delete('/bye-bye', auth('delete'), (req, res, next) => {
  res.send(req.user.can('delete'));
});

apiRouter.get('/everything', auth('superuser'), (req, res, next) => {
  res.send(req.user.can('superuser'));
});

module.exports = apiRouter;