import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initializeStorage, getContentItems, getContentItemById, saveContentItem, deleteContentItem } from '../../src/lib/api/ContentApi';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock global methods
global.localStorage = localStorageMock as any;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  },
  configurable: true,
});

describe('ContentApi', () => {
  // Test content item
  const testItem = {
    id: 'test-id',
    title: 'Test Item',
    status: 'draft' as const,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    schemaId: 'test-schema',
    data: {}
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeStorage', () => {
    it('should initialize storage with mock content items if empty', async () => {
      await initializeStorage();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not initialize storage if already populated', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      await initializeStorage();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getContentItems', () => {
    it('should return empty array if no content items exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);
      const result = await getContentItems();
      expect(result).toEqual([]);
    });

    it('should return content items from storage', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      const result = await getContentItems();
      expect(result).toEqual([testItem]);
    });
  });

  describe('getContentItemById', () => {
    it('should return null if content item does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      const result = await getContentItemById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return content item by id', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      const result = await getContentItemById('test-id');
      expect(result).toEqual(testItem);
    });
  });

  describe('saveContentItem', () => {
    it('should add a new content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([]));
      const newItem = { ...testItem, id: undefined as any };
      
      await saveContentItem(newItem);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(1);
      expect(savedItems[0].id).toBe('test-uuid');
    });

    it('should update an existing content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      const updatedItem = { 
        ...testItem, 
        title: 'Updated Title',
        updatedAt: '2023-01-02T00:00:00Z'
      };
      
      await saveContentItem(updatedItem);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(1);
      expect(savedItems[0].title).toBe('Updated Title');
      expect(new Date(savedItems[0].updatedAt).toISOString()).toBe(savedItems[0].updatedAt);
    });
  });

  describe('deleteContentItem', () => {
    it('should delete a content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      
      await deleteContentItem('test-id');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(0);
    });

    it('should not throw error if content item does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testItem]));
      
      await expect(deleteContentItem('non-existent-id')).resolves.not.toThrow();
    });
  });
}); 