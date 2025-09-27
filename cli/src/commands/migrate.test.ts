import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { migrate } from './migrate';
import { createMigrator } from '../lib/migrator';

// Mock the migrator module
vi.mock('../lib/migrator');
// Mock the app data module
vi.mock('../../../app/src/data', () => ({
  migrations: [],
  Migration: {}
}));

const mockCreateMigrator = vi.mocked(createMigrator);

// Import the mocked module to manipulate it during tests
import * as mockDataModule from '../../../app/src/data';

describe('migrate command', () => {
  let mockMigrator: {
    authenticate: ReturnType<typeof vi.fn>;
    up: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  const testDatabaseUrl = 'postgresql://user:pass@localhost:5432/testdb';

  // Shared migration fixtures to reduce duplication
  const MIGRATION_TEST = {
    version: '20240101000000',
    name: 'test',
    schema: 'yunocontent',
    filename: 'supabase/migrations/yunocontent/20240101000000_test.sql',
    sql: 'CREATE TABLE test (id INT);',
    workspace: 'supabase'
  };

  const MIGRATION_CREATE_USERS = {
    version: '20240101000000',
    name: 'create_users',
    schema: 'yunocontent',
    filename: 'supabase/migrations/yunocontent/20240101000000_create_users.sql',
    sql: 'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL);',
    workspace: 'supabase'
  };

  const MIGRATION_ADD_POSTS = {
    version: '20240102000000',
    name: 'add_posts',
    schema: 'yunocontent',
    filename: 'supabase/migrations/yunocontent/20240102000000_add_posts.sql',
    sql: 'CREATE TABLE posts (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id));',
    workspace: 'supabase'
  };

  const MIGRATION_CREATE_FORUMS = {
    version: '20240103000000',
    name: 'create_forums',
    schema: 'yunocommunity',
    filename: 'supabase/migrations/yunocommunity/20240103000000_create_forums.sql',
    sql: 'CREATE TABLE forums (id SERIAL PRIMARY KEY, title VARCHAR(255));',
    workspace: 'supabase'
  };

  const setMigrations = (list: any[]) => {
    (mockDataModule as any).migrations = list;
  };

  beforeAll(() => {
    // Mock console.log to avoid noise during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock migrator with all required methods
    mockMigrator = {
      authenticate: vi.fn().mockResolvedValue(undefined),
      up: vi.fn().mockResolvedValue([]),
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Reset migrations array
    (mockDataModule as any).migrations = [];
    
    // Mock createMigrator to return our mock
    mockCreateMigrator.mockReturnValue(mockMigrator as any);
  });

  it('should establish database connection and setup', async () => {
    await migrate(testDatabaseUrl);

    expect(mockCreateMigrator).toHaveBeenCalledWith(testDatabaseUrl);
    expect(mockMigrator.authenticate).toHaveBeenCalledOnce();
  });

  it('should call migrator.up when not in preview mode', async () => {
    // Setup migrations
    setMigrations([MIGRATION_TEST]);

    await migrate(testDatabaseUrl, false);

    expect(mockMigrator.up).toHaveBeenCalledOnce();
  });

  it('should close migrator connection after completion', async () => {
    await migrate(testDatabaseUrl);

    expect(mockMigrator.close).toHaveBeenCalledOnce();
  });

  it('should close migrator connection even if migration fails', async () => {
    // Setup migrations to avoid early return
    setMigrations([MIGRATION_TEST]);

    mockMigrator.up.mockRejectedValue(new Error('Migration failed'));

    await expect(migrate(testDatabaseUrl)).rejects.toThrow('Migration failed');

    expect(mockMigrator.close).toHaveBeenCalledOnce();
  });

  it('should close migrator connection even if authentication fails', async () => {
    mockMigrator.authenticate.mockRejectedValue(new Error('Auth failed'));
    
    await expect(migrate(testDatabaseUrl)).rejects.toThrow('Auth failed');
    
    expect(mockMigrator.close).toHaveBeenCalledOnce();
  });

  it('should log no migrations found when migrations array is empty', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    (mockDataModule as any).migrations = [];

    await migrate(testDatabaseUrl);

    expect(consoleSpy).toHaveBeenCalledWith('Database connection established successfully.');
    expect(consoleSpy).toHaveBeenCalledWith('No migrations found.');
  });

  it('should load and display migrations when migrations exist', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    // Mock migrations data
    setMigrations([MIGRATION_CREATE_USERS, MIGRATION_ADD_POSTS]);

    const mockAppliedMigrations = [{ name: '20240101000000_create_users.sql' }];
    mockMigrator.up.mockResolvedValue(mockAppliedMigrations);

    await migrate(testDatabaseUrl);

    expect(consoleSpy).toHaveBeenCalledWith('Database connection established successfully.');
    expect(consoleSpy).toHaveBeenCalledWith('Found 2 migration(s) to apply:');
    expect(consoleSpy).toHaveBeenCalledWith('  - create_users (yunocontent)');
    expect(consoleSpy).toHaveBeenCalledWith('  - add_posts (yunocontent)');
  });

  it('should establish database connection with custom URL', async () => {
    const customDbUrl = 'postgresql://admin:secret@example.com:5432/proddb';

    await migrate(customDbUrl);

    expect(mockCreateMigrator).toHaveBeenCalledWith(customDbUrl);
    expect(mockMigrator.authenticate).toHaveBeenCalledOnce();
    expect(mockMigrator.close).toHaveBeenCalledOnce();
  });

  describe('preview functionality', () => {
    it('should not call migrator.up when preview flag is true', async () => {
      (mockDataModule as any).migrations = [
        {
          version: '20240101000000',
          name: 'test',
          schema: 'yunocontent',
          filename: 'supabase/migrations/yunocontent/20240101000000_test.sql',
          sql: 'CREATE TABLE test (id INT);',
          workspace: 'supabase'
        }
      ];

      await migrate(testDatabaseUrl, true);

      expect(mockMigrator.up).not.toHaveBeenCalled();
    });

    // Removed duplicate tests covered by non-preview cases:
    // - calling migrator.up when preview flag is false
    // - logging no migrations when none exist

    it('should log migrations with SQL when preview is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      setMigrations([MIGRATION_CREATE_USERS, MIGRATION_ADD_POSTS, MIGRATION_CREATE_FORUMS]);

      await migrate(testDatabaseUrl, true);

      expect(consoleSpy).toHaveBeenCalledWith('Database connection established successfully.');
      expect(consoleSpy).toHaveBeenCalledWith('Found migrations (in execution order):');
      expect(consoleSpy).toHaveBeenCalledWith('1. create_users (yunocontent)');
      expect(consoleSpy).toHaveBeenCalledWith('   File: supabase/migrations/yunocontent/20240101000000_create_users.sql');
      expect(consoleSpy).toHaveBeenCalledWith('   SQL: CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL);...');
      expect(consoleSpy).toHaveBeenCalledWith('2. add_posts (yunocontent)');
      expect(consoleSpy).toHaveBeenCalledWith('3. create_forums (yunocommunity)');
    });

    // Removed duplicate connection lifecycle tests in preview mode
  });
}); 
