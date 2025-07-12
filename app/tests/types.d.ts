/// <reference types="@testing-library/jest-dom" />

declare module '@testing-library/jest-dom/vitest' {
  import { Assertion, AsymmetricMatchersContaining } from 'vitest';
  interface CustomMatchers<R = unknown> {
    toBeInTheDocument(): R;
    toHaveValue(value: string | string[] | number | null): R;
  }
  interface Matchers<R> extends CustomMatchers<R> {}
  interface AsymmetricMatchers extends CustomMatchers {}
} 