// Common test setup for React Testing Library and vitest
import { vi, beforeEach } from 'vitest';

// Import extended matchers for RTL
import '@testing-library/jest-dom';

// Mock for window.matchMedia (often needed for UI component tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock for IntersectionObserver (often needed for UI components)
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Reset mocks between tests automatically
beforeEach(() => {
  vi.clearAllMocks();
}); 