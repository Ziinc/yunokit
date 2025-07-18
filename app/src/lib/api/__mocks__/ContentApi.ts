import { vi } from 'vitest';

export const listContentItems = vi.fn().mockResolvedValue([]);
export const getSchemas = vi.fn().mockResolvedValue([]);
export const createContentItem = vi.fn().mockResolvedValue({});
export const updateContentItem = vi.fn().mockResolvedValue({});
export const deleteContentItem = vi.fn().mockResolvedValue(undefined);
export const getContentItemById = vi.fn().mockResolvedValue({});

export const ContentApi = {
  listContentItems,
  getSchemas,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentItemById,
};