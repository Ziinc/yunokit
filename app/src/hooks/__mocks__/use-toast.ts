import { vi } from 'vitest';

export const useToast = vi.fn().mockReturnValue({
  toast: vi.fn(),
  dismiss: vi.fn(),
  toasts: [],
});

export const toast = vi.fn(); 