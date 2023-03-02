import { vi } from "vitest";
export const session = vi.fn().mockReturnValue({ user: null });

export let client;

client = {
  auth: {
    signUp: vi.fn().mockResolvedValue({ user: {}, error: null }),
    session,
    onAuthStateChange() {
      return { data: null };
    },
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session } }),
  },
  from: vi.fn().mockImplementation(() => client),
  limit: vi.fn().mockImplementation(() => client),
  select: vi.fn().mockImplementation(() => client),
  filter: vi.fn().mockImplementation(() => client),
};

export const createClient = vi.fn().mockReturnValue(client);
