const { z } = require('zod');

const createRecordSchema = {
  body: z.object({
    amount: z
      .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be a positive number')
      .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      required_error: 'Type is required',
      invalid_type_error: 'Type must be INCOME or EXPENSE',
    }),
    category: z
      .string({ required_error: 'Category is required' })
      .min(1, 'Category is required')
      .max(50, 'Category must not exceed 50 characters')
      .trim(),
    date: z
      .string({ required_error: 'Date is required' })
      .datetime({ message: 'Date must be a valid ISO 8601 date string' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO 8601 format')),
    description: z
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .trim()
      .optional()
      .nullable(),
  }),
};

const updateRecordSchema = {
  params: z.object({
    id: z.string().uuid('Invalid record ID format'),
  }),
  body: z.object({
    amount: z
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be a positive number')
      .multipleOf(0.01, 'Amount can have at most 2 decimal places')
      .optional(),
    type: z
      .enum(['INCOME', 'EXPENSE'], { invalid_type_error: 'Type must be INCOME or EXPENSE' })
      .optional(),
    category: z
      .string()
      .min(1, 'Category cannot be empty')
      .max(50, 'Category must not exceed 50 characters')
      .trim()
      .optional(),
    date: z
      .string()
      .datetime({ message: 'Date must be a valid ISO 8601 date string' })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD or ISO 8601 format'))
      .optional(),
    description: z
      .string()
      .max(500, 'Description must not exceed 500 characters')
      .trim()
      .optional()
      .nullable(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
};

const getRecordSchema = {
  params: z.object({
    id: z.string().uuid('Invalid record ID format'),
  }),
};

const listRecordsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['date', 'amount', 'createdAt', 'category']).optional().default('date'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional(),
  }),
};

module.exports = { createRecordSchema, updateRecordSchema, getRecordSchema, listRecordsSchema };
