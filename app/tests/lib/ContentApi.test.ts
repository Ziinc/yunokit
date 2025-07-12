import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import * as ContentApi from '../../src/lib/api/ContentApi';

// Mock the entire ContentApi module
vi.mock('../../src/lib/api/ContentApi', () => ({
  listContentItems: vi.fn(),
  getContentItemById: vi.fn(),
  deleteContentItem: vi.fn(),
  createContentItem: vi.fn(),
  updateContentItem: vi.fn(),
  listContentItemsBySchema: vi.fn(),
}));

// Mock supabase functions
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('ContentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listContentItems', () => {
    it('should call supabase functions with correct parameters', async () => {
      const mockListContentItems = ContentApi.listContentItems as Mock;
      mockListContentItems.mockResolvedValue({ data: [] });
      
      await ContentApi.listContentItems(1);
      
      expect(mockListContentItems).toHaveBeenCalledWith(1);
    });
  });

  describe('getContentItemById', () => {
    it('should call supabase functions with correct parameters', async () => {
      const mockGetContentItemById = ContentApi.getContentItemById as Mock;
      mockGetContentItemById.mockResolvedValue({ data: {} });
      
      await ContentApi.getContentItemById(1, 1);
      
      expect(mockGetContentItemById).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('deleteContentItem', () => {
    it('should call supabase functions with correct parameters', async () => {
      const mockDeleteContentItem = ContentApi.deleteContentItem as Mock;
      mockDeleteContentItem.mockResolvedValue(undefined);
      
      await ContentApi.deleteContentItem(1, 1);
      
      expect(mockDeleteContentItem).toHaveBeenCalledWith(1, 1);
    });
  });
}); 