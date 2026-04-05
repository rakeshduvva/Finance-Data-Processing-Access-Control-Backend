const { z } = require('zod');

const updateUserSchema = {
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),
    role: z
      .enum(['VIEWER', 'ANALYST', 'ADMIN'], {
        invalid_type_error: 'Role must be VIEWER, ANALYST, or ADMIN',
      })
      .optional(),
    isActive: z.boolean().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
};

const getUserSchema = {
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
};

const listUsersSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    search: z.string().optional(),
  }),
};

module.exports = { updateUserSchema, getUserSchema, listUsersSchema };
