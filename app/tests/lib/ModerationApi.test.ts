import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { supabase } from '../../src/lib/supabase';
import { listBans, banUser, updateBan, unbanUser } from '../../src/lib/api/ModerationApi';

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

const invoke = supabase.functions.invoke as Mock;

describe('ModerationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listBans calls supabase', async () => {
    await listBans();
    expect(invoke).toHaveBeenCalledWith('proxy/community/bans', { method: 'GET' });
  });

  it('banUser calls supabase', async () => {
    const ban = { user_id: '1' };
    await banUser(ban as any);
    expect(invoke).toHaveBeenCalledWith('proxy/community/bans', { method: 'POST', body: ban });
  });

  it('updateBan calls supabase', async () => {
    const ban = { reason: 'x' };
    await updateBan(1, ban as any);
    expect(invoke).toHaveBeenCalledWith('proxy/community/bans/1', { method: 'PUT', body: ban });
  });

  it('unbanUser calls supabase', async () => {
    await unbanUser(1);
    expect(invoke).toHaveBeenCalledWith('proxy/community/bans/1', { method: 'DELETE' });
  });
});
