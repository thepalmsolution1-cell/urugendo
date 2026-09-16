const { validationResult } = require('express-validator');
const { HttpError } = require('../utils/httpError');

/**
 * Middleware that checks validation results from express-validator.
 * If validation fails, throws a 400 HttpError with formatted field errors.
 */
function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    const errorMessage = formattedErrors.map((e) => `${e.field}: ${e.message}`).join(', ');
    const error = new HttpError(400, `Validation error: ${errorMessage}`);
    error.errors = formattedErrors;
    return next(error);
  }
  next();
}

module.exports = { validateRequest };
