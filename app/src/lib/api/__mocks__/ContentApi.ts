import { vi } from 'vitest';

// Define mocks once, then export both individually and as an object
export const listContentItems = vi
  .fn()
  .mockResolvedValue({ data: [], error: null });
export const getSchemas = vi
  .fn()
  .mockResolvedValue({ data: [], error: null });
export const getContentItemById = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });
export const listContentItemsBySchema = vi
  .fn()
  .mockResolvedValue({ data: [], error: null });
export const createContentItem = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });
export const updateContentItem = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });
export const deleteContentItem = vi.fn().mockResolvedValue(undefined);
export const listContentItemVersions = vi
  .fn()
  .mockResolvedValue({ data: [], error: null });
export const getContentItemVersion = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });
export const createContentItemVersion = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });
export const updateContentItemVersion = vi
  .fn()
  .mockResolvedValue({ data: {}, error: null });
export const deleteContentItemVersion = vi.fn().mockResolvedValue(undefined);
export const listContentItemVersionsByOptions = vi
  .fn()
  .mockResolvedValue({ data: [], error: null });