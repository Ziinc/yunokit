import { Comment } from '@/types/comments';

const STORAGE_KEY = 'comments';

const loadComments = (): Comment[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? (JSON.parse(data) as Comment[]) : [];
};

const persistComments = (data: Comment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const initializeStorage = async (): Promise<void> => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    persistComments([]);
  }
};

export const getComments = async (): Promise<Comment[]> => {
  return loadComments();
};

export const getCommentById = async (id: string): Promise<Comment | null> => {
  return loadComments().find(comment => comment.id === id) || null;
};

export const getCommentsByContentItem = async (contentItemId: string): Promise<Comment[]> => {
  return loadComments().filter(comment => (comment as any).contentItemId === contentItemId);
};

export const getPendingComments = async (): Promise<Comment[]> => {
  return loadComments().filter(comment => comment.status === 'pending');
};

export const saveComment = async (comment: Partial<Comment>): Promise<Comment> => {
  const comments = loadComments();
  const existingIndex = comments.findIndex(c => c.id === comment.id);

  if (existingIndex >= 0) {
    comments[existingIndex] = {
      ...comments[existingIndex],
      ...comment,
      updatedAt: new Date().toISOString(),
    } as Comment;
  } else {
    const newComment: Comment = {
      id: comment.id || crypto.randomUUID(),
      contentItemId: (comment as any).contentItemId || '',
      contentTitle: comment.contentTitle || '',
      contentType: comment.contentType || 'article',
      content: comment.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: comment.status || 'pending',
      author: comment.author || {
        id: 'anonymous',
        name: 'Anonymous',
        email: '',
        avatar: '',
        status: 'active',
      },
    };
    comments.push(newComment);
  }

  persistComments(comments);
  return loadComments().find(c => c.id === (comment.id || comments[comments.length - 1].id))!;
};

export const saveComments = async (newComments: Comment[]): Promise<Comment[]> => {
  persistComments(newComments);
  return loadComments();
};

export const deleteComment = async (id: string): Promise<void> => {
  const comments = loadComments().filter(comment => comment.id !== id);
  persistComments(comments);
};

export const approveComment = async (id: string): Promise<Comment> => {
  return saveComment({ id, status: 'approved' });
};

export const rejectComment = async (id: string): Promise<Comment> => {
  return saveComment({ id, status: 'deleted' });
};

export const getThreadedComments = async (contentItemId: string): Promise<Comment[]> => {
  const allComments = await getCommentsByContentItem(contentItemId);
  const topLevel = allComments.filter(c => !c.parentId);
  const replies = allComments.filter(c => c.parentId);

  topLevel.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return [...topLevel, ...replies];
};