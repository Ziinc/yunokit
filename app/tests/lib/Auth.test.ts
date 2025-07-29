import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { supabase } from '../../src/lib/supabase';
import { signInWithGoogle } from '../../src/lib/api/auth';

vi.unmock('../../src/lib/api/auth');
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

const signIn = supabase.auth.signInWithOAuth as Mock;

describe('signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('DEV', true);
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost/?email=demo@example.com'),
      writable: true,
    });
  });

  it('bypasses OAuth when demo email provided', async () => {
    await signInWithGoogle();
    expect(signIn).not.toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sb-127-auth-token',
      expect.any(String)
    );
    expect(localStorage.setItem).toHaveBeenCalledWith('currentWorkspaceId', '1');
  });
});
