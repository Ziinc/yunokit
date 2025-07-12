import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { listContentItems, getContentItemById, deleteContentItem } from '../../src/lib/api/ContentApi';

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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listContentItems', () => {
    it('should call supabase functions with correct parameters', async () => {
      const { supabase } = await import('../../src/lib/supabase');
      (supabase.functions.invoke as any).mockResolvedValue({ data: [] });
      
      await listContentItems(1);
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'proxy/content_items?workspaceId=1',
        { method: 'GET' }
      );
    });
  });

  describe('getContentItemById', () => {
    it('should call supabase functions with correct parameters', async () => {
      const { supabase } = await import('../../src/lib/supabase');
      (supabase.functions.invoke as any).mockResolvedValue({ data: {} });
      
      await getContentItemById(1, 1);
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'proxy/content_items/1?workspaceId=1',
        { method: 'GET' }
      );
    });
  });

  describe('deleteContentItem', () => {
    it('should call supabase functions with correct parameters', async () => {
      const { supabase } = await import('../../src/lib/supabase');
      (supabase.functions.invoke as any).mockResolvedValue({});
      
      await deleteContentItem(1, 1);
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'proxy/content_items/1?workspaceId=1',
        { method: 'DELETE' }
      );
    });
  });
}); 