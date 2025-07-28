// Common test setup for React Testing Library and vitest
import { vi, beforeEach } from 'vitest';
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

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  },
  configurable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

// Mock API modules
vi.mock('../src/lib/api/ContentApi');
vi.mock('../src/lib/api/WorkspaceApi');
vi.mock('../src/lib/api/SupabaseConnectionApi');
vi.mock('../src/lib/api/CommentsApi');
vi.mock('../src/lib/api/SystemAuthorApi');
vi.mock('../src/lib/api/AssetsApi');
vi.mock('../src/lib/api/SchemaApi');
vi.mock('../src/lib/api/AuthApi');
vi.mock('../src/lib/api/TemplateGenerators');
vi.mock('../src/lib/api/TemplateService');
vi.mock('../src/lib/featureFlags');
vi.mock('../src/lib/api/auth');

// Mock Context modules
vi.mock('../src/contexts/AuthContext');
vi.mock('../src/contexts/SearchContext');
vi.mock('../src/lib/contexts/WorkspaceContext'); 

