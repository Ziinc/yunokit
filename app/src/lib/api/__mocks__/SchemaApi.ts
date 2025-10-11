import { vi } from 'vitest';

export const listSchemas = vi
  .fn()
  .mockResolvedValue({ data: [], error: null });

export const createSchema = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });

export const updateSchema = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });

export const deleteSchema = vi
  .fn()
  .mockResolvedValue({ data: null, error: null });

export const getSchemaById = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });

// Export all exports for * import usage 