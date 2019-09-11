'use strict';

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

module.exports = getCookie;
