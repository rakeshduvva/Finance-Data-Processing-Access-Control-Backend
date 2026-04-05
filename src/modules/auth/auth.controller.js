const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');

class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user and return JWT token.
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.created(res, 'User registered successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and return JWT token.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, 'Login successful.', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get the profile of the currently authenticated user.
   */
  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return ApiResponse.success(res, 'Profile retrieved successfully.', user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
