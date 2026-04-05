const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../utils/ApiResponse');

class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get total income, expenses, and net balance.
   */
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      return ApiResponse.success(res, 'Dashboard summary retrieved successfully.', summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/category-summary
   * Get category-wise financial breakdown.
   */
  async getCategorySummary(req, res, next) {
    try {
      const categories = await dashboardService.getCategorySummary();
      return ApiResponse.success(res, 'Category summary retrieved successfully.', categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/trends
   * Get monthly income/expense trends.
   */
  async getTrends(req, res, next) {
    try {
      const trends = await dashboardService.getTrends();
      return ApiResponse.success(res, 'Monthly trends retrieved successfully.', trends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/recent-activity
   * Get recent financial records.
   */
  async getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const activity = await dashboardService.getRecentActivity(limit);
      return ApiResponse.success(res, 'Recent activity retrieved successfully.', activity);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
