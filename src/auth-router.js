'use strict';
/**
 * Auth Routes Module
 * @module src/auth-router
 */

const express = require('express');
const authRouter = express.Router();

const User = require('./model/user.js');
const auth = require('./middleware/auth.js');
const getCookie = require('./middleware/cookies');

authRouter.post('/signup', signup);
authRouter.post('/signin', getCookie, auth(), signin);
authRouter.post('/key', auth(), getKey);

/**
 * This function signs up a new user
 * @route POST /signup
 * @group User authentication
 * @param {string} username.query.required - user's username
 * @param {string} password.query.required - user's password
 * @returns {object} 200 - A token for authentication is generated
 * @returns {Error}  default - Unexpected error
 */
function signup (req, res, next){
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken(user.role);
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.redirect('/classify');
    })
    .catch(next);
}

/**
 * This function signs a user in using username and password
 * @route POST /signin
 * @group User authentication
 * @param {string} username.query.required - user's username
 * @param {string} password.query.required - user's password
 * @returns {object} 200 - A token for authentication is generated
 * @returns {Error}  default - Unexpected error
 */
function signin (req, res, next){
  res.cookie('auth', req.token);
  res.set('token', req.token);
  res.redirect('/classify');
}

/**
 * This function generates a key for indefinite use
 * @route POST /key
 * @group User authentication
 * @param {string} username.query.required - username
 * @param {string} password.query.required - user's password
 * @returns {object} 200 - A key for indefinite use
 * @returns {Error}  default - Unexpected error
 */
function getKey (req, res, next) {
  let key = req.user.generateKey();
  res.status(200).send(key);
}

module.exports = authRouter;
