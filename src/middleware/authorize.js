const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware factory.
 * Usage: authorize('ADMIN') or authorize('ANALYST', 'ADMIN')
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(' or ')}.`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
