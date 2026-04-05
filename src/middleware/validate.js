const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory using Zod schemas.
 * Validates request body, query, and/or params against provided schemas.
 *
 * @param {Object} schemas - Object with optional body, query, params Zod schemas
 * @returns {Function} Express middleware
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each part of the request if schema is provided
    for (const [key, schema] of Object.entries(schemas)) {
      if (!['body', 'query', 'params'].includes(key)) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const fieldErrors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          location: key,
        }));
        errors.push(...fieldErrors);
      } else {
        // Replace with parsed/transformed values (handles coercion, defaults, etc.)
        req[key] = result.data;
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
};

module.exports = validate;
