import * as real from '../CommentsApi';
import { vi } from 'vitest';

export const initializeStorage = vi.fn(real.initializeStorage);
export const getComments = vi.fn(real.getComments);
export const getCommentById = vi.fn(real.getCommentById);
export const getCommentsByContentItem = vi.fn(real.getCommentsByContentItem);
export const getPendingComments = vi.fn(real.getPendingComments);
export const saveComment = vi.fn(real.saveComment);
export const saveComments = vi.fn(real.saveComments);
export const deleteComment = vi.fn(real.deleteComment);
export const approveComment = vi.fn(async (id: string) => {
  const comment = await getCommentById(id);
  if (!comment) {
    throw new Error(`Comment with ID ${id} not found`);
  }
  return saveComment({ ...(comment as any), status: 'approved' });
});

export const rejectComment = vi.fn(async (id: string) => {
  const comment = await getCommentById(id);
  if (!comment) {
    throw new Error(`Comment with ID ${id} not found`);
  }
  return saveComment({ ...(comment as any), status: 'deleted' });
});
export const getThreadedComments = vi.fn(real.getThreadedComments);
