const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial summary (All roles)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data with total income, expenses, net balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalIncome:
 *                   type: number
 *                 totalExpenses:
 *                   type: number
 *                 netBalance:
 *                   type: number
 *                 totalRecords:
 *                   type: integer
 */
router.get(
  '/summary',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  dashboardController.getSummary
);

/**
 * @swagger
 * /api/dashboard/category-summary:
 *   get:
 *     summary: Get category-wise breakdown (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category-wise income and expense totals
 */
router.get(
  '/category-summary',
  authorize('ANALYST', 'ADMIN'),
  dashboardController.getCategorySummary
);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get monthly income/expense trends (Analyst, Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend data for the last 12 months
 */
router.get(
  '/trends',
  authorize('ANALYST', 'ADMIN'),
  dashboardController.getTrends
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent financial activity (All roles)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent records to return
 *     responses:
 *       200:
 *         description: Recent financial records
 */
router.get(
  '/recent-activity',
  authorize('VIEWER', 'ANALYST', 'ADMIN'),
  dashboardController.getRecentActivity
);

module.exports = router;
