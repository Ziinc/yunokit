import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ContentApi } from './ContentApi';
import { ContentItem } from '../contentSchema';

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
global.crypto = {
  randomUUID: vi.fn(() => 'test-uuid'),
} as any;

// Mock network delay 
vi.mock('./ContentApi', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./ContentApi')>();
  return {
    ...mod,
    ContentApi: {
      ...mod.ContentApi,
      initializeStorage: vi.fn(mod.ContentApi.initializeStorage),
      getContentItems: vi.fn(mod.ContentApi.getContentItems),
      getContentItemById: vi.fn(mod.ContentApi.getContentItemById),
      saveContentItem: vi.fn(mod.ContentApi.saveContentItem),
      deleteContentItem: vi.fn(mod.ContentApi.deleteContentItem),
    },
  };
});

describe('ContentApi', () => {
  // Test content item
  const testContentItem: ContentItem = {
    id: 'test-id',
    schemaId: 'blog-post',
    title: 'Test Content',
    content: { title: 'Test Content', content: 'Test content body' },
    status: 'draft',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
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
      await ContentApi.initializeStorage();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not initialize storage if already populated', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      await ContentApi.initializeStorage();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getContentItems', () => {
    it('should return empty array if no items exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);
      const result = await ContentApi.getContentItems();
      expect(result).toEqual([]);
    });

    it('should return content items from storage', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      const result = await ContentApi.getContentItems();
      expect(result).toEqual([testContentItem]);
    });
  });

  describe('getContentItemById', () => {
    it('should return null if item does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      const result = await ContentApi.getContentItemById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return content item by id', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      const result = await ContentApi.getContentItemById('test-id');
      expect(result).toEqual(testContentItem);
    });
  });

  describe('saveContentItem', () => {
    it('should add a new content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([]));
      const newItem = { ...testContentItem, id: undefined as any };
      
      await ContentApi.saveContentItem(newItem);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(1);
      expect(savedItems[0].id).toBe('test-uuid');
    });

    it('should update an existing content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      const updatedItem = { 
        ...testContentItem, 
        title: 'Updated Title',
        content: { ...testContentItem.content, title: 'Updated Title' }
      };
      
      await ContentApi.saveContentItem(updatedItem);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(1);
      expect(savedItems[0].title).toBe('Updated Title');
    });
  });

  describe('deleteContentItem', () => {
    it('should delete a content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      
      await ContentApi.deleteContentItem('test-id');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(0);
    });

    it('should not change storage if item does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testContentItem]));
      
      await ContentApi.deleteContentItem('non-existent-id');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedItems = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedItems.length).toBe(1);
    });
  });
}); 