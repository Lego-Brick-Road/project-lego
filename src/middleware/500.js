'use strict';

module.exports = (err, request, response, next) => {
  console.log('__SERVER_ERROR__', err);
  let error = { error: err.message || err };
  response.status(500).json(error);
};