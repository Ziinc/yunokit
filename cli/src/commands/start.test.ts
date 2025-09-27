import { describe, it, expect, beforeEach, vi, beforeAll, afterAll, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
// Mock serve-static so we can assert configuration
vi.mock('serve-static', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next && next())
}));
import serveStatic from 'serve-static';
import { start } from './start';

// Mock fs to control directory existence
vi.mock('fs');
const mockFs = vi.mocked(fs);

// Mock process.exit to prevent actual exit during tests
const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('start command', () => {
  const testPort = 3001;
  const testDirectory = './test-dist/app';
  const testStaticPath = path.resolve(process.cwd(), testDirectory);

  beforeAll(() => {
    // Mock console.log to avoid noise during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock directory exists by default
    mockFs.existsSync.mockReturnValue(true);
    // Reset the mock for process.exit
    mockExit.mockClear();
  });

  // Shared helpers to reduce duplication
  const wait = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
  const startServerAndWait = async (opts: { port: number; directory?: string }, ms = 50) => {
    await start(opts);
    await wait(ms);
  };
  const cleanupServer = async (signal: 'SIGINT' | 'SIGTERM' = 'SIGINT', ms = 50) => {
    process.emit(signal);
    await wait(ms);
  };

  it('should throw error if static files directory does not exist', async () => {
    mockFs.existsSync.mockReturnValue(false);

    await expect(start({ port: testPort, directory: testDirectory }))
      .rejects
      .toThrow(`Static files directory not found: ${testStaticPath}`);
  });

  it('should handle directory option (default and custom)', async () => {
    const defaultPath = path.resolve(process.cwd(), './dist/app');

    await startServerAndWait({ port: testPort });
    expect(mockFs.existsSync).toHaveBeenCalledWith(defaultPath);
    await cleanupServer('SIGINT');

    mockFs.existsSync.mockClear();

    await startServerAndWait({ port: testPort, directory: testDirectory });
    expect(mockFs.existsSync).toHaveBeenCalledWith(testStaticPath);
    await cleanupServer('SIGINT');
  });

  it('should start server and configure static serving', async () => {
    await startServerAndWait({ port: testPort, directory: testDirectory }, 80);

    // Verify directory path resolution checked
    expect(mockFs.existsSync).toHaveBeenCalledWith(testStaticPath);

    // Verify serve-static configured with correct path and options
    const mockServeStatic = vi.mocked(serveStatic);
    expect(mockServeStatic).toHaveBeenCalledWith(
      testStaticPath,
      expect.objectContaining({ index: ['index.html', 'index.htm'], dotfiles: 'ignore' })
    );

    await cleanupServer('SIGINT');
  });

  test.each(['SIGINT', 'SIGTERM'] as const)('should handle %s signal for graceful shutdown', async (sig) => {
    await startServerAndWait({ port: testPort, directory: testDirectory });

    await cleanupServer(sig);

    expect(mockExit).toHaveBeenCalledWith(0);
  });
}); 
