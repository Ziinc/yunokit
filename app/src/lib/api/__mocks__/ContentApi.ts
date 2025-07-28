import { vi } from 'vitest';

export const listContentItems = vi.fn().mockResolvedValue([]);
export const getSchemas = vi.fn().mockResolvedValue([]);
export const createContentItem = vi.fn().mockResolvedValue({});
export const updateContentItem = vi.fn().mockResolvedValue({});
export const deleteContentItem = vi.fn().mockResolvedValue(undefined);
export const getContentItemById = vi.fn().mockResolvedValue({});

export const ContentApi = {
  listContentItems: vi.fn().mockResolvedValue([]),
  getSchemas: vi.fn().mockResolvedValue([]),
  createContentItem: vi.fn().mockResolvedValue({}),
  updateContentItem: vi.fn().mockResolvedValue({}),
  deleteContentItem: vi.fn().mockResolvedValue(undefined),
  getContentItemById: vi.fn().mockResolvedValue({}),
  listContentItemVersions: vi.fn().mockResolvedValue([]),
};