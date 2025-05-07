import { Comment } from '@/types/comments';

// Sample mock comments
const mockComments: Comment[] = [
  {
    id: crypto.randomUUID(),
    contentId: 'article-1',
    contentTitle: 'Sample Article 1',
    contentType: 'article',
    author: {
      id: '1',
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?u=jane',
      email: 'jane.smith@example.com',
      status: 'active'
    },
    content: 'Great article! Very informative and well-written.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'approved'
  },
  {
    id: crypto.randomUUID(),
    contentId: 'article-1',
    contentTitle: 'Sample Article 1',
    contentType: 'article',
    author: {
      id: '2',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?u=john',
      email: 'john.doe@example.com',
      status: 'active'
    },
    content: 'I have a question about the third point you made. Could you elaborate a bit more on that?',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'approved'
  },
  {
    id: crypto.randomUUID(),
    contentId: 'article-1',
    contentTitle: 'Sample Article 1',
    contentType: 'article',
    parentId: '1',
    author: {
      id: '3',
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      email: 'alex.johnson@example.com',
      status: 'active'
    },
    content: 'I agree with Jane. This is a fantastic resource!',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'approved'
  },
  {
    id: crypto.randomUUID(),
    contentId: 'article-2',
    contentTitle: 'Sample Article 2',
    contentType: 'article',
    author: {
      id: '4',
      name: 'Sam Wilson',
      avatar: 'https://i.pravatar.cc/150?u=sam',
      email: 'sam.wilson@example.com',
      status: 'active'
    },
    content: 'I found a typo in the second paragraph. Just wanted to let you know!',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending'
  }
];

// In-memory storage
let comments: Comment[] = [...mockComments];

export const initializeStorage = async (): Promise<void> => {
  if (comments.length === 0) {
    comments = [...mockComments];
    console.log("Initialized comments storage with mock comments");
  }
};

export const getComments = async (): Promise<Comment[]> => {
  return comments;
};

export const getCommentById = async (id: string): Promise<Comment | null> => {
  return comments.find(comment => comment.id === id) || null;
};

export const getCommentsByContentItem = async (contentItemId: string): Promise<Comment[]> => {
  return comments.filter(comment => comment.contentId === contentItemId);
};

export const getPendingComments = async (): Promise<Comment[]> => {
  return comments.filter(comment => comment.status === 'pending');
};

export const saveComment = async (comment: Partial<Comment>): Promise<Comment> => {
  const existingIndex = comments.findIndex(c => c.id === comment.id);
  
  if (existingIndex >= 0) {
    comments[existingIndex] = {
      ...comments[existingIndex],
      ...comment,
    };
    return comments[existingIndex];
  } else {
    const newComment: Comment = {
      id: comment.id || crypto.randomUUID(),
      contentId: comment.contentId || '',
      contentTitle: comment.contentTitle || '',
      contentType: comment.contentType || 'article',
      content: comment.content || '',
      createdAt: new Date().toISOString(),
      status: comment.status || 'pending',
      author: comment.author || {
        id: 'anonymous',
        name: 'Anonymous',
        email: '',
        avatar: '',
        status: 'active'
      }
    };
    comments.push(newComment);
    return newComment;
  }
};

export const saveComments = async (newComments: Comment[]): Promise<Comment[]> => {
  comments = newComments;
  return comments;
};

export const deleteComment = async (id: string): Promise<void> => {
  comments = comments.filter(comment => comment.id !== id);
};

export const approveComment = async (id: string): Promise<Comment> => {
  const comment = await getCommentById(id);
  if (!comment) {
    throw new Error(`Comment with ID ${id} not found`);
  }
  
  return saveComment({ ...comment, status: 'approved' });
};

export const rejectComment = async (id: string): Promise<Comment> => {
  const comment = await getCommentById(id);
  if (!comment) {
    throw new Error(`Comment with ID ${id} not found`);
  }
  
  return saveComment({ ...comment, status: 'deleted' });
};

export const getThreadedComments = async (contentItemId: string): Promise<Comment[]> => {
  const comments = await getCommentsByContentItem(contentItemId);
  
  const topLevelComments = comments.filter(comment => !comment.parentId);
  const replies = comments.filter(comment => comment.parentId);
  
  topLevelComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  return [...topLevelComments, ...replies];
}; 