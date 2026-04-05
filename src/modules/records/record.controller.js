const recordService = require('./record.service');
const ApiResponse = require('../../utils/ApiResponse');

class RecordController {
  /**
   * POST /api/records
   * Create a new financial record.
   */
  async createRecord(req, res, next) {
    try {
      const record = await recordService.createRecord(req.body, req.user.id);
      return ApiResponse.created(res, 'Financial record created successfully.', record);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/records
   * List records with filters and pagination.
   */
  async listRecords(req, res, next) {
    try {
      const result = await recordService.listRecords(req.query);
      return ApiResponse.success(
        res,
        'Financial records retrieved successfully.',
        result.records,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/records/:id
   * Get a single record by ID.
   */
  async getRecord(req, res, next) {
    try {
      const record = await recordService.getRecordById(req.params.id);
      return ApiResponse.success(res, 'Financial record retrieved successfully.', record);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/records/:id
   * Update a financial record.
   */
  async updateRecord(req, res, next) {
    try {
      const record = await recordService.updateRecord(req.params.id, req.body);
      return ApiResponse.success(res, 'Financial record updated successfully.', record);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/records/:id
   * Soft-delete a financial record.
   */
  async deleteRecord(req, res, next) {
    try {
      const record = await recordService.deleteRecord(req.params.id);
      return ApiResponse.success(res, 'Financial record deleted successfully.', record);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecordController();
