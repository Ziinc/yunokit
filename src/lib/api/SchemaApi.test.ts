/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SchemaApi } from './SchemaApi';
import { ContentSchema } from '../contentSchema';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock global methods
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
});

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  }
}); 