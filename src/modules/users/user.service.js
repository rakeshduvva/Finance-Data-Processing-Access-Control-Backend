const prisma = require('../../utils/prisma');
const ApiError = require('../../utils/ApiError');
const config = require('../../config');

class UserService {
  /**
   * List users with pagination and optional filters.
   */
  async listUsers({ page = 1, limit = 20, role, isActive, search }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single user by ID.
   */
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { financialRecords: true },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    return user;
  }

  /**
   * Update a user's profile (role, status, name).
   */
  async updateUser(id, data, currentUserId) {
    // Prevent self-demotion/deactivation
    if (id === currentUserId) {
      if (data.role && data.role !== 'ADMIN') {
        throw ApiError.badRequest('You cannot change your own role.');
      }
      if (data.isActive === false) {
        throw ApiError.badRequest('You cannot deactivate your own account.');
      }
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Deactivate a user (soft delete).
   */
  async deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      throw ApiError.badRequest('You cannot deactivate your own account.');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  }
}

module.exports = new UserService();
