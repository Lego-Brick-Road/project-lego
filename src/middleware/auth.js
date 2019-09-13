'use strict';
/**
 * API Server Module
 * @module src/middleware/auth
 */

const User = require('../model/user.js');

module.exports = capability => {
  return (req, res, next) => {

    try {
      let [authType, authString] = req.headers.authorization.split(/\s+/);

      switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString);
      case 'bearer':
        return _authBearer(authString);
      default:
        return _authError();
      }
    } catch (e) {
      _authError();
    }

    /**
     * This function parses basic authentication
     * @method _authBasic
     * @param authString
     * @returns {Promise}
     */
    function _authBasic(authString) {
      let base64Buffer = Buffer.from(authString, 'base64');
      let bufferString = base64Buffer.toString();
      let [username, password] = bufferString.split(':');
      let auth = { username, password };

      return User.authenticateBasic(auth)
        .then(user => _authenticate(user))
        .catch(_authError);
    }

    /**
     * This function sends the authString to be authenticated, if a token
     * @method _authBearer
     * @param authString
     * @returns {Promise}
     */
    function _authBearer(authString) {
      return User.authenticateToken(authString)
        .then(user => _authenticate(user))
        .catch('_authBearer ERROR:',_authError);
    }

    /**
     * This function assigns the user and token
     * @method _authenticate
     * @param user
     */
    function _authenticate(user) {
      if (user && (!capability || user.can(capability))) {
        req.user = user;
        req.token = user.generateToken(user.role);
        next();
      }
      else {
        _authError();
      }
    }

    /**
     * This function throws an error if the user ID or password is invalid
     * @private
     */
    function _authError() {
      next('Invalid User ID / Password');
    }
  };
};