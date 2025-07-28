import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { supabase } from '../../src/lib/supabase';
import {
  getComments,
  getCommentById,
  getCommentsByContentItem,
  getPendingComments,
  saveComment,
  saveComments,
  deleteComment,
  approveComment,
  rejectComment,
  getThreadedComments
} from '../../src/lib/api/CommentsApi';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

const invoke = supabase.functions.invoke as Mock;

describe('CommentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getComments calls supabase', async () => {
    await getComments();
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments', { method: 'GET' });
  });

  it('getCommentById calls supabase', async () => {
    await getCommentById('1');
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/1', { method: 'GET' });
  });

  it('getCommentsByContentItem calls supabase', async () => {
    await getCommentsByContentItem('2');
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments?contentItemId=2', { method: 'GET' });
  });

  it('getPendingComments calls supabase', async () => {
    await getPendingComments();
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/pending', { method: 'GET' });
  });

  it('saveComment calls supabase', async () => {
    const comment = { content: 'hi' };
    await saveComment(comment);
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments', { method: 'POST', body: comment });
  });

  it('saveComments calls supabase', async () => {
    const comments = [];
    await saveComments(comments as any);
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/bulk', { method: 'POST', body: comments });
  });

  it('deleteComment calls supabase', async () => {
    await deleteComment('1');
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/1', { method: 'DELETE' });
  });

  it('approveComment calls supabase', async () => {
    await approveComment('1');
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/1/approve', { method: 'POST' });
  });

  it('rejectComment calls supabase', async () => {
    await rejectComment('1');
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/1/reject', { method: 'POST' });
  });

  it('getThreadedComments calls supabase', async () => {
    await getThreadedComments('2');
    expect(invoke).toHaveBeenCalledWith('proxy/community/comments/thread?contentItemId=2', { method: 'GET' });
  });
});
