'use strict';
/**
 * API Server Module
 * @module src/middleware/cookies
 */

/**
 * Cookie middleware persists cookie throughout session
 * @param req - gets cookies from header
 * @param next
 */
function getCookie(req, res, next){
  if(req.headers.cookie){
    const [auth, cookieString] = req.headers.cookie.split('=');
    const newToken = 'bearer ' + cookieString;
    req.headers.authorization = newToken;
  }
  next();
}

module.exports = getCookie;
