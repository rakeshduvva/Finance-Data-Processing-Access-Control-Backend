const prisma = require('../../utils/prisma');
const ApiError = require('../../utils/ApiError');

class RecordService {
  /**
   * Create a new financial record.
   */
  async createRecord(data, userId) {
    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        description: data.description || null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  }

  /**
   * List financial records with filters, pagination, and sorting.
   */
  async listRecords({ page = 1, limit = 20, type, category, startDate, endDate, sortBy = 'date', order = 'desc', search }) {
    const skip = (page - 1) * limit;

    const where = { isDeleted: false };

    if (type) where.type = type;
    if (category) where.category = { contains: category };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single financial record by ID.
   */
  async getRecordById(id) {
    const record = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      throw ApiError.notFound('Financial record not found.');
    }

    return record;
  }

  /**
   * Update a financial record.
   */
  async updateRecord(id, data) {
    const existing = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw ApiError.notFound('Financial record not found.');
    }

    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    const record = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  }

  /**
   * Soft-delete a financial record.
   */
  async deleteRecord(id) {
    const existing = await prisma.financialRecord.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw ApiError.notFound('Financial record not found.');
    }

    const record = await prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
      select: { id: true, type: true, amount: true, category: true, isDeleted: true },
    });

    return record;
  }
}

module.exports = new RecordService();
