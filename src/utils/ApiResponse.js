/**
 * Standardized API response wrapper.
 * Ensures all API responses follow a consistent format.
 */
class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  static success(res, message, data = null, meta = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data, meta));
  }

  static created(res, message, data = null) {
    return res.status(201).json(new ApiResponse(201, message, data));
  }

  static error(res, statusCode, message, errors = []) {
    const response = {
      success: false,
      message,
    };
    if (errors.length > 0) response.errors = errors;
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
