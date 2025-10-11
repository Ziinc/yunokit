import React from 'react';
import { vi } from 'vitest';

// Match real module's public API
export const useAuth = () => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  signOut: vi.fn().mockResolvedValue(undefined),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
);
