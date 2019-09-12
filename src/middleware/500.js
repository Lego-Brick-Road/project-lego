'use strict';
/**
 * API Server Module
 * @module src/middleware/500
 */

/**
 * Error handling middleware
 * @param err - error message
 * @param req - request
 * @param res - response
 * @param next
 */
module.exports = (err, req, res, next) => {
  let error = { error: err.message || err };
  res.status(500).json(error);
};