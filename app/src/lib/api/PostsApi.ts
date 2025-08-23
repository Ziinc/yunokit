import { supabase } from '../supabase';

interface PostData {
  title: string;
  content?: string;
  content_data?: Record<string, unknown>;
  forum_id: number;
  status?: 'draft' | 'published' | 'archived' | 'flagged';
}

interface Post {
  id: number;
  title: string;
  content?: string;
  content_data?: Record<string, unknown>;
  forum_id: number;
  status: 'draft' | 'published' | 'archived' | 'flagged';
  created_at: string;
  updated_at: string;
  user_author_id?: string;
}

const base = 'proxy/community/posts';

export const createPost = async (postData: PostData) => {
  return await supabase.functions.invoke<Post>(base, { method: 'POST', body: postData });
};

export const getPost = async (id: number) => {
  return await supabase.functions.invoke<Post>(`${base}/${id}`, { method: 'GET' });
};

export const updatePost = async (id: number, postData: Partial<PostData>) => {
  return await supabase.functions.invoke<Post>(`${base}/${id}`, { method: 'PUT', body: postData });
};

export const deletePost = async (id: number) => {
  return await supabase.functions.invoke(`${base}/${id}`, { method: 'DELETE' });
};

export const getPostsByForum = async (forumId: number) => {
  const qp = new URLSearchParams({ forumId: forumId.toString() });
  return await supabase.functions.invoke<Post[]>(`${base}?${qp.toString()}`, { method: 'GET' });
};