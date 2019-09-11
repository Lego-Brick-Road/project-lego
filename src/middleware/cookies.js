'use strict';

// Gets cookie for auth
function getCookie(req, res, next){
  if(req.headers.cookie){
    let [auth, cookieString] = req.headers.cookie.split('=');
    // console.log(cookieString);
    let newToken = 'bearer ' + cookieString;
    req.headers.authorization = newToken;
  }
  next();
}

module.exports = getCookie;
