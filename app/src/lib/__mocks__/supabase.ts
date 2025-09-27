import { vi } from 'vitest';

// Mock implementations for supabase functions
export const initiateOAuthFlow = vi.fn().mockResolvedValue(undefined);

export const exchangeCodeForToken = vi.fn().mockResolvedValue({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
});

export const checkSupabaseConnection = vi.fn().mockResolvedValue({
  result: true
});

export const listProjects = vi.fn().mockResolvedValue([
  {
    id: "project-1",
    name: "Test Project 1",
    status: "ACTIVE_HEALTHY",
    region: "us-east-1",
  },
  {
    id: "project-2",
    name: "Test Project 2",
    status: "ACTIVE_HEALTHY", 
    region: "us-west-2",
  },
]);

export const checkTokenNeedsRefresh = vi.fn().mockResolvedValue(false);

export const refreshAccessToken = vi.fn().mockResolvedValue({
  access_token: 'new-access-token',
  refresh_token: 'new-refresh-token',
});

export const checkApiKey = vi.fn().mockResolvedValue(true); 