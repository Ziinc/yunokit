import { vi } from 'vitest';

export const initializeStorage = vi.fn().mockResolvedValue(undefined);
export const getComments = vi.fn().mockResolvedValue([]);
export const getCommentById = vi.fn().mockResolvedValue(null);
export const getCommentsByContentItem = vi.fn().mockResolvedValue([]);
export const getPendingComments = vi.fn().mockResolvedValue([]);
export const saveComment = vi.fn().mockResolvedValue({});
export const saveComments = vi.fn().mockResolvedValue([]);
export const deleteComment = vi.fn().mockResolvedValue(undefined);
export const approveComment = vi.fn().mockResolvedValue({});
export const rejectComment = vi.fn().mockResolvedValue({});
export const getThreadedComments = vi.fn().mockResolvedValue([]);
