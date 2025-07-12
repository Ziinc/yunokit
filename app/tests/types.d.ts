/// <reference types="@testing-library/jest-dom" />

declare module '@testing-library/jest-dom/vitest' {
  interface CustomMatchers<R = unknown> {
    toBeInTheDocument(): R;
    toHaveValue(value: string | string[] | number | null): R;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Matchers<R> extends CustomMatchers<R> {
    // Additional jest-dom matchers can be added here in the future
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchers extends CustomMatchers {
    // Additional asymmetric matchers can be added here in the future
  }
}
