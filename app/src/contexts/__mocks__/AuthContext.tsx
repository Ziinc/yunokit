import { vi } from 'vitest';

export const AuthContext = {
  isAuthenticated: false,
  user: null,
  login: vi.fn().mockResolvedValue({}),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn().mockResolvedValue({}),
}; 