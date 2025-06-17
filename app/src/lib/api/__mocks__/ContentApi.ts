import { vi } from 'vitest';

export const ContentApi = {
  listContentItems: vi.fn().mockResolvedValue([]),
  getSchemas: vi.fn().mockResolvedValue([]),
  createContentItem: vi.fn().mockResolvedValue({}),
  updateContentItem: vi.fn().mockResolvedValue({}),
  deleteContentItem: vi.fn().mockResolvedValue(undefined),
  getContentItemById: vi.fn().mockResolvedValue({}),
}; 