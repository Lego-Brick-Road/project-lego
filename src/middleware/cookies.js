'use strict';

/**
 * Cookie middleware persists cookie throughout session
 * @param req - gets cookies from header
 * @param next
 */
function getCookie(req, res, next){
  if(req.headers.cookie){
    let [auth, cookieString] = req.headers.cookie.split('=');
    let newToken = 'bearer ' + cookieString;
    req.headers.authorization = newToken;
  }
  next();
}

module.exports = getCookie;
