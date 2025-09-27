// Common test setup for React Testing Library and vitest
import { vi, beforeEach } from 'vitest';
import { configure as domConf } from '@testing-library/dom'
import { configure as reactConf } from '@testing-library/react'


const TESTING_LIBRARY_CONF = {
  // prevents large unhelpful HTML DOM outputs on failed tests
  getElementError: (message: string | null) => {
      const error = new Error(message ?? undefined)
      error.name = 'TestingLibraryElementError'
      error.stack = undefined
      return error
  },
}
domConf(TESTING_LIBRARY_CONF)
reactConf(TESTING_LIBRARY_CONF)


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
    random: vi.fn(() => 0.5),
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
  configurable: true,
});

// Mock document.elementFromPoint for Prosemirror
Object.defineProperty(document, 'elementFromPoint', {
  value: vi.fn(() => null),
  configurable: true,
});

// Mock getClientRects for Prosemirror
Object.defineProperty(Element.prototype, 'getClientRects', {
  value: vi.fn(() => []),
  configurable: true,
});

// Mock getBoundingClientRect for Prosemirror
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })),
  configurable: true,
});

// Mock hasPointerCapture for Radix UI
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: vi.fn(() => false),
  configurable: true,
});

// Mock setPointerCapture for Radix UI
Object.defineProperty(Element.prototype, 'setPointerCapture', {
  value: vi.fn(),
  configurable: true,
});

// Mock releasePointerCapture for Radix UI
Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  configurable: true,
});

// Mock scrollIntoView for Radix UI
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  configurable: true,
});

// Mock range methods for Prosemirror
if (global.Range) {
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    value: vi.fn(() => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    })),
    configurable: true,
  });

  Object.defineProperty(Range.prototype, 'getClientRects', {
    value: vi.fn(() => []),
    configurable: true,
  });
}

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
// vi.mock('../src/lib/api/CommentsApi'); // Tested directly in CommentsApi.test.ts
vi.mock('../src/lib/api/AssetsApi');
vi.mock('../src/lib/api/SchemaApi');
vi.mock('../src/lib/api/AuthApi');
vi.mock('../src/lib/api/TemplateGenerators');
vi.mock('../src/lib/api/TemplateService');
vi.mock('../src/lib/featureFlags');
vi.mock('../src/lib/api/auth');
vi.mock('../src/lib/supabase');

// Mock Context modules
vi.mock('../src/contexts/AuthContext');
vi.mock('../src/lib/contexts/WorkspaceContext');

// Mock SWR
vi.mock('swr'); 

