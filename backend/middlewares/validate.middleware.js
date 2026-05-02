const ApiError = require('../utils/apiError');

/**
 * Validate request body against a Joi schema.
 * Returns 422 with field-level error details on failure.
 *
 * @param {Joi.Schema} schema
 * @param {'body'|'query'|'params'} [target='body']
 */
const validate = (schema, target = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return next(new ApiError(422, 'Validation failed', errors));
  }

  req[target] = value;   // use the sanitised/coerced value
  next();
};

module.exports = validate;
