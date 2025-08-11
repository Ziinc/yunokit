import { vi } from 'vitest';

export const listContentItems = vi.fn().mockResolvedValue([]);
export const getSchemas = vi.fn().mockResolvedValue([]);
export const createContentItem = vi.fn().mockResolvedValue({});
export const updateContentItem = vi.fn().mockResolvedValue({});
export const deleteContentItem = vi.fn().mockResolvedValue(undefined);
export const getContentItemById = vi.fn().mockResolvedValue({});
export const listContentItemsBySchema = vi.fn().mockResolvedValue([]);
export const listContentItemVersions = vi.fn().mockResolvedValue([]);
export const getContentItemVersion = vi.fn().mockResolvedValue({});
export const createContentItemVersion = vi.fn().mockResolvedValue({});
export const updateContentItemVersion = vi.fn().mockResolvedValue({});
export const deleteContentItemVersion = vi.fn().mockResolvedValue(undefined);
export const listContentItemVersionsByOptions = vi.fn().mockResolvedValue([]);

export const ContentApi = {
  listContentItems: vi.fn().mockResolvedValue([]),
  getSchemas: vi.fn().mockResolvedValue([]),
  createContentItem: vi.fn().mockResolvedValue({}),
  updateContentItem: vi.fn().mockResolvedValue({}),
  deleteContentItem: vi.fn().mockResolvedValue(undefined),
  getContentItemById: vi.fn().mockResolvedValue({}),
  listContentItemsBySchema: vi.fn().mockResolvedValue([]),
  listContentItemVersions: vi.fn().mockResolvedValue([]),
  getContentItemVersion: vi.fn().mockResolvedValue({}),
  createContentItemVersion: vi.fn().mockResolvedValue({}),
  updateContentItemVersion: vi.fn().mockResolvedValue({}),
  deleteContentItemVersion: vi.fn().mockResolvedValue(undefined),
  listContentItemVersionsByOptions: vi.fn().mockResolvedValue([]),
};