import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initializeStorage, getComments, getCommentById, getCommentsByContentItem, getPendingComments, saveComment, approveComment, getThreadedComments } from '../../src/lib/api/CommentsApi';

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
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  },
  configurable: true,
});


describe('CommentsApi', () => {
  // Test comment
  const testComment = {
    id: 'test-comment-id',
    contentItemId: 'test-content-item-id',
    author: {
      id: 'test-user-id',
      name: 'Test User',
      avatar: 'https://example.com/avatar.png',
      email: 'test@example.com',
    },
    text: 'This is a test comment',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    status: 'pending' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeStorage', () => {
    it('should initialize storage with mock comments if empty', async () => {
      await initializeStorage();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not initialize storage if already populated', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      await initializeStorage();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getComments', () => {
    it('should return empty array if no comments exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(null);
      const result = await getComments();
      expect(result).toEqual([]);
    });

    it('should return comments from storage', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      const result = await getComments();
      expect(result).toEqual([testComment]);
    });
  });

  describe('getCommentById', () => {
    it('should return null if comment does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      const result = await getCommentById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should return comment by id', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      const result = await getCommentById('test-comment-id');
      expect(result).toEqual(testComment);
    });
  });

  describe('getCommentsByContentItem', () => {
    it('should return empty array if no comments exist for content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      const result = await getCommentsByContentItem('non-existent-content-id');
      expect(result).toEqual([]);
    });

    it('should return comments for a specific content item', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      const result = await getCommentsByContentItem('test-content-item-id');
      expect(result).toEqual([testComment]);
    });
  });

  describe('getPendingComments', () => {
    it('should return only pending comments', async () => {
      const approvedComment = { ...testComment, id: 'approved-comment', status: 'approved' as const };
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment, approvedComment]));
      
      const result = await getPendingComments();
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-comment-id');
      expect(result[0].status).toBe('pending');
    });
  });

  describe('saveComment', () => {
    it('should add a new comment', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([]));
      const newComment = { ...testComment, id: undefined as any };
      
      await saveComment(newComment);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedComments = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedComments.length).toBe(1);
      expect(savedComments[0].id).toBe('test-uuid');
    });

    it('should update an existing comment', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      const updatedComment = { 
        ...testComment, 
        text: 'Updated comment text',
        updatedAt: '2023-01-02T00:00:00Z'
      };
      
      await saveComment(updatedComment);
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedComments = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedComments.length).toBe(1);
      expect(savedComments[0].text).toBe('Updated comment text');
      expect(new Date(savedComments[0].updatedAt).toISOString()).toBe(savedComments[0].updatedAt);
    });
  });

  describe('approveComment', () => {
    it('should update a comment status to approved', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      
      await approveComment('test-comment-id');
      
      expect(saveComment).toHaveBeenCalled();
      const savedComment = (saveComment as any).mock.calls[0][0];
      expect(savedComment.status).toBe('approved');
    });

    it('should throw an error if comment does not exist', async () => {
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([testComment]));
      
      await expect(approveComment('non-existent-id')).rejects.toThrow();
    });
  });

  describe('getThreadedComments', () => {
    it('should return comments in threaded order', async () => {
      const parentComment = testComment;
      const childComment = {
        ...testComment,
        id: 'child-comment',
        parentId: 'test-comment-id',
        createdAt: '2023-01-02T00:00:00Z'
      };
      
      localStorage.getItem = vi.fn().mockReturnValue(JSON.stringify([parentComment, childComment]));
      
      const result = await getThreadedComments('test-content-item-id');
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('test-comment-id'); // Parent comment first
      expect(result[1].id).toBe('child-comment'); // Child comment second
    });
  });
}); 