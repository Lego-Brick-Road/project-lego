'use strict';
/**
 * API Server Module
 * @module src/middleware/404
 */

/**
 * Middleware to send error message when resource not found
 * @param req
 * @param res
 * @param next
 */
module.exports = (req, res, next) => {
  let error = { error: 'Resource Not Found' };
  res.status(404).json(error);
};