'use strict';

module.exports = (request, response, next) => {
  let error = { error: 'Resource Not Found' };
  response.status(404).json(error);
};