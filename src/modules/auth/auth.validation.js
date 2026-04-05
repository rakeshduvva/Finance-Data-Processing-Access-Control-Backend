const { z } = require('zod');

const registerSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password must not exceed 128 characters'),
    role: z
      .enum(['VIEWER', 'ANALYST', 'ADMIN'], {
        invalid_type_error: 'Role must be VIEWER, ANALYST, or ADMIN',
      })
      .optional()
      .default('VIEWER'),
  }),
};

const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
};

module.exports = { registerSchema, loginSchema };
