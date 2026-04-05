const prisma = require('../../utils/prisma');

class DashboardService {
  /**
   * Get overall financial summary.
   * Returns: total income, total expenses, net balance, record count.
   */
  async getSummary() {
    const [incomeResult, expenseResult, recordCount] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { type: 'INCOME', isDeleted: false },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.financialRecord.aggregate({
        where: { type: 'EXPENSE', isDeleted: false },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.financialRecord.count({
        where: { isDeleted: false },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      totalRecords: recordCount,
      incomeCount: incomeResult._count,
      expenseCount: expenseResult._count,
    };
  }

  /**
   * Get category-wise financial breakdown.
   * Returns totals grouped by category and type.
   */
  async getCategorySummary() {
    const categoryData = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: { isDeleted: false },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Restructure into a more readable format
    const categories = {};
    for (const item of categoryData) {
      if (!categories[item.category]) {
        categories[item.category] = {
          category: item.category,
          income: 0,
          expense: 0,
          net: 0,
          transactionCount: 0,
        };
      }

      const amount = Math.round((item._sum.amount || 0) * 100) / 100;
      if (item.type === 'INCOME') {
        categories[item.category].income = amount;
      } else {
        categories[item.category].expense = amount;
      }
      categories[item.category].transactionCount += item._count;
    }

    // Calculate net for each category
    const result = Object.values(categories).map((cat) => ({
      ...cat,
      net: Math.round((cat.income - cat.expense) * 100) / 100,
    }));

    // Sort by total volume (income + expense)
    result.sort((a, b) => (b.income + b.expense) - (a.income + a.expense));

    return result;
  }

  /**
   * Get monthly income/expense trends.
   * Returns data for the last 12 months.
   */
  async getTrends() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const records = await prisma.financialRecord.findMany({
      where: {
        isDeleted: false,
        date: { gte: twelveMonthsAgo },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyData = {};
    for (const record of records) {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: key,
          income: 0,
          expense: 0,
          net: 0,
          transactionCount: 0,
        };
      }

      if (record.type === 'INCOME') {
        monthlyData[key].income += record.amount;
      } else {
        monthlyData[key].expense += record.amount;
      }
      monthlyData[key].transactionCount++;
    }

    // Calculate net and round values
    const trends = Object.values(monthlyData).map((month) => ({
      ...month,
      income: Math.round(month.income * 100) / 100,
      expense: Math.round(month.expense * 100) / 100,
      net: Math.round((month.income - month.expense) * 100) / 100,
    }));

    // Sort by month
    trends.sort((a, b) => a.month.localeCompare(b.month));

    return trends;
  }

  /**
   * Get recent activity — last N financial records.
   */
  async getRecentActivity(limit = 10) {
    const records = await prisma.financialRecord.findMany({
      where: { isDeleted: false },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return records;
  }
}

module.exports = new DashboardService();
