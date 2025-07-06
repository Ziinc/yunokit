import { Comment } from '@/types/comments';

// In-memory storage
let comments: Comment[] = [];

export const initializeStorage = async (): Promise<void> => {
  // Storage is now initialized empty
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