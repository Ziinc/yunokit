interface Comment {
  id: string;
  contentItemId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  status: 'pending' | 'approved' | 'rejected';
  meta?: Record<string, any>;
}

// Sample mock comments
const mockComments: Comment[] = [
  {
    id: crypto.randomUUID(),
    contentItemId: 'article-1',
    author: {
      id: '1',
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?u=jane',
      email: 'jane.smith@example.com'
    },
    text: 'Great article! Very informative and well-written.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'approved'
  },
  {
    id: crypto.randomUUID(),
    contentItemId: 'article-1',
    author: {
      id: '2',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?u=john',
      email: 'john.doe@example.com'
    },
    text: 'I have a question about the third point you made. Could you elaborate a bit more on that?',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'approved'
  },
  {
    id: crypto.randomUUID(),
    contentItemId: 'article-1',
    parentId: '1', // Reply to Jane's comment
    author: {
      id: '3',
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      email: 'alex.johnson@example.com'
    },
    text: 'I agree with Jane. This is a fantastic resource!',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'approved'
  },
  {
    id: crypto.randomUUID(),
    contentItemId: 'article-2',
    author: {
      id: '4',
      name: 'Sam Wilson',
      avatar: 'https://i.pravatar.cc/150?u=sam',
      email: 'sam.wilson@example.com'
    },
    text: 'I found a typo in the second paragraph. Just wanted to let you know!',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending'
  }
];

// Storage key
const COMMENTS_STORAGE_KEY = 'supacontent-comments';

export class CommentsApi {
  // Initialize storage with example comments if empty
  static async initializeStorage(): Promise<void> {
    const storedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!storedComments) {
      await this.saveComments(mockComments);
      console.log("Initialized comments storage with mock comments");
    }
  }

  // Comment Operations
  static async getComments(): Promise<Comment[]> {
    const storedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!storedComments) return [];
    return JSON.parse(storedComments);
  }

  static async getCommentById(id: string): Promise<Comment | null> {
    const comments = await this.getComments();
    return comments.find(comment => comment.id === id) || null;
  }

  static async getCommentsByContentItem(contentItemId: string): Promise<Comment[]> {
    const comments = await this.getComments();
    return comments.filter(comment => comment.contentItemId === contentItemId);
  }

  static async getPendingComments(): Promise<Comment[]> {
    const comments = await this.getComments();
    return comments.filter(comment => comment.status === 'pending');
  }

  static async saveComment(comment: Comment): Promise<Comment> {
    const comments = await this.getComments();
    const existingIndex = comments.findIndex(c => c.id === comment.id);
    
    if (existingIndex >= 0) {
      comments[existingIndex] = {
        ...comment,
        updatedAt: new Date().toISOString()
      };
    } else {
      comments.push({
        ...comment,
        id: comment.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: comment.status || 'pending'
      });
    }
    
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    return comment;
  }

  static async saveComments(comments: Comment[]): Promise<Comment[]> {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    return comments;
  }

  static async deleteComment(id: string): Promise<void> {
    const comments = await this.getComments();
    const filteredComments = comments.filter(comment => comment.id !== id);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(filteredComments));
  }

  static async approveComment(id: string): Promise<Comment> {
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new Error(`Comment with ID ${id} not found`);
    }
    
    comment.status = 'approved';
    return this.saveComment(comment);
  }

  static async rejectComment(id: string): Promise<Comment> {
    const comment = await this.getCommentById(id);
    if (!comment) {
      throw new Error(`Comment with ID ${id} not found`);
    }
    
    comment.status = 'rejected';
    return this.saveComment(comment);
  }

  // Helper method to get threaded comments
  static async getThreadedComments(contentItemId: string): Promise<Comment[]> {
    const comments = await this.getCommentsByContentItem(contentItemId);
    
    // Get top-level comments
    const topLevelComments = comments.filter(comment => !comment.parentId);
    
    // Get replies
    const replies = comments.filter(comment => comment.parentId);
    
    // Sort by date (newest first for top-level, oldest first for replies)
    topLevelComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return [...topLevelComments, ...replies];
  }
}

// Export the Comment interface
export type { Comment }; 