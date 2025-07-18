import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { supabase } from '../../src/lib/supabase';
import { listForums, getForumById, createForum, updateForum, deleteForum } from '../../src/lib/api/ForumsApi';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

const invoke = supabase.functions.invoke as Mock;

describe('ForumsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listForums calls supabase', async () => {
    await listForums();
    expect(invoke).toHaveBeenCalledWith('community/forums', { method: 'GET' });
  });

  it('getForumById calls supabase', async () => {
    await getForumById(1);
    expect(invoke).toHaveBeenCalledWith('community/forums/1', { method: 'GET' });
  });

  it('createForum calls supabase', async () => {
    const forum = { name: 'test' };
    await createForum(forum as any);
    expect(invoke).toHaveBeenCalledWith('community/forums', { method: 'POST', body: forum });
  });

  it('updateForum calls supabase', async () => {
    const forum = { name: 'upd' };
    await updateForum(1, forum as any);
    expect(invoke).toHaveBeenCalledWith('community/forums/1', { method: 'PUT', body: forum });
  });

  it('deleteForum calls supabase', async () => {
    await deleteForum(1);
    expect(invoke).toHaveBeenCalledWith('community/forums/1', { method: 'DELETE' });
  });
});
