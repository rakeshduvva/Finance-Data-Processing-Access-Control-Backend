const userService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');

class UserController {
  /**
   * GET /api/users
   * List all users with pagination and filters.
   */
  async listUsers(req, res, next) {
    try {
      const result = await userService.listUsers(req.query);
      return ApiResponse.success(
        res,
        'Users retrieved successfully.',
        result.users,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get a single user by ID.
   */
  async getUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return ApiResponse.success(res, 'User retrieved successfully.', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id
   * Update a user's role, status, or name.
   */
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, 'User updated successfully.', user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Deactivate a user (soft delete).
   */
  async deleteUser(req, res, next) {
    try {
      const user = await userService.deleteUser(req.params.id, req.user.id);
      return ApiResponse.success(res, 'User deactivated successfully.', user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
