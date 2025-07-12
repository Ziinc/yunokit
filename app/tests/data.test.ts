import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Provide a compileTime stub similar to vite-plugin-compile-time
(globalThis as any).compileTime = async (fn: any) => fn();

const mockSqlFile = '20240101010101_test.sql';
const mockSqlContent = 'SELECT 1;';

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => [mockSqlFile]),
    readFileSync: vi.fn(() => mockSqlContent)
  }
}));

vi.mock('path', async () => {
  const actual = await vi.importActual<typeof import('path')>('path');
  return { default: actual };
});

let migrationsModule: typeof import('../src/data');

beforeEach(async () => {
  vi.resetModules();
  migrationsModule = await import('../src/data');
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('migrations', () => {
  it('loads migrations from the filesystem', async () => {
    const result = await (migrationsModule.migrations as any);
    expect(result).toEqual([
      {
        version: '20240101010101',
        name: 'test',
        filename: `supabase/migrations/${mockSqlFile}`,
        sql: mockSqlContent,
        workspace: 'supabase'
      }
    ]);
  });
});
