import { supabase } from '../supabase';
import type { Comment } from '@/types/comments';
import { buildApiUrl } from './utils';

const base = 'proxy/community/comments';

export const getComments = async () => {
  return await supabase.functions.invoke<Comment[]>(base, { method: 'GET' });
};

export const getCommentById = async (id: string) => {
  return await supabase.functions.invoke<Comment>(`${base}/${id}`, { method: 'GET' });
};

export const getCommentsByContentItem = async (contentItemId: string) => {
  return await supabase.functions.invoke<Comment[]>(
    buildApiUrl(base, { query: { contentItemId } }),
    { method: 'GET' }
  );
};


export const saveComment = async (comment: Partial<Comment>) => {
  return await supabase.functions.invoke<Comment>(base, { method: 'POST', body: comment });
};

export const saveComments = async (newComments: Comment[]) => {
  return await supabase.functions.invoke<Comment[]>(`${base}/bulk`, { method: 'POST', body: newComments });
};

export const deleteComment = async (id: string) => {
  await supabase.functions.invoke(`${base}/${id}`, { method: 'DELETE' });
};



export const getThreadedComments = async (contentItemId: string) => {
  return await supabase.functions.invoke<Comment[]>(
    buildApiUrl(base, { path: 'thread', query: { contentItemId } }),
    { method: 'GET' }
  );
};

export const getCommentsByForum = async (forumId: string) => {
  return await supabase.functions.invoke<Comment[]>(
    buildApiUrl(base, { query: { forumId } }),
    { method: 'GET' }
  );
};

export const getPendingComments = async () => {
  return await supabase.functions.invoke<Comment[]>(`${base}/pending`, { method: 'GET' });
};

export const approveComment = async (id: string) => {
  return await supabase.functions.invoke(`${base}/${id}/approve`, { method: 'POST' });
};

export const rejectComment = async (id: string) => {
  return await supabase.functions.invoke(`${base}/${id}/reject`, { method: 'POST' });
};
