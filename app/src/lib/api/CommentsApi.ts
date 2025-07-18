import { supabase } from '../supabase';
import type { Comment } from '@/types/comments';

const base = 'proxy/comments';

export const getComments = async () => {
  return await supabase.functions.invoke<Comment[]>(base, { method: 'GET' });
};

export const getCommentById = async (id: string) => {
  return await supabase.functions.invoke<Comment>(`${base}/${id}`, { method: 'GET' });
};

export const getCommentsByContentItem = async (contentItemId: string) => {
  const qp = new URLSearchParams({ contentItemId });
  return await supabase.functions.invoke<Comment[]>(`${base}?${qp.toString()}`, { method: 'GET' });
};

export const getPendingComments = async () => {
  return await supabase.functions.invoke<Comment[]>(`${base}/pending`, { method: 'GET' });
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

export const approveComment = async (id: string) => {
  return await supabase.functions.invoke<Comment>(`${base}/${id}/approve`, { method: 'POST' });
};

export const rejectComment = async (id: string) => {
  return await supabase.functions.invoke<Comment>(`${base}/${id}/reject`, { method: 'POST' });
};

export const getThreadedComments = async (contentItemId: string) => {
  const qp = new URLSearchParams({ contentItemId });
  return await supabase.functions.invoke<Comment[]>(`${base}/thread?${qp.toString()}`, { method: 'GET' });
};
