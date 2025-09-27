import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { createMigrator } from './migrator';

// Mock pg Pool
vi.mock('pg');
const MockPool = vi.mocked(Pool);

// Mock fs for file operations
vi.mock('fs');
const mockFs = vi.mocked(fs);

// Mock Umzug
vi.mock('umzug');
import { Umzug } from 'umzug';
const MockUmzug = vi.mocked(Umzug);

describe('migrator', () => {
  let mockClient: any;
  let mockPool: any;
  let mockUmzug: any;
  
  const testDatabaseUrl = 'postgresql://user:pass@localhost:5432/testdb';
  const testMigrationsPath = path.join(process.cwd(), 'migrations');

  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fs operations
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('CREATE TABLE test (id SERIAL PRIMARY KEY);');

    // Mock pg client
    mockClient = {
      query: vi.fn().mockResolvedValue({ rows: [] }),
      release: vi.fn(),
    };

    // Mock pg Pool
    mockPool = {
      connect: vi.fn().mockResolvedValue(mockClient),
      end: vi.fn().mockResolvedValue(undefined),
    };
    MockPool.mockImplementation(() => mockPool);

    // Mock Umzug
    mockUmzug = {
      up: vi.fn().mockResolvedValue([]),
      down: vi.fn().mockResolvedValue([]),
    };
    MockUmzug.mockImplementation(() => mockUmzug);
  });

  it('should create Pool with provided database URL', () => {
    createMigrator(testDatabaseUrl);
    
    expect(MockPool).toHaveBeenCalledWith({
      connectionString: testDatabaseUrl,
    });
  });

  it('should throw error if migrations directory does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    
    expect(() => createMigrator(testDatabaseUrl))
      .toThrow(`Migrations directory not found: ${testMigrationsPath}`);
  });

  it('should check migrations directory exists', () => {
    createMigrator(testDatabaseUrl);
    
    expect(mockFs.existsSync).toHaveBeenCalledWith(testMigrationsPath);
  });

  describe('migrator instance', () => {
    let migrator: ReturnType<typeof createMigrator>;

    beforeEach(() => {
      migrator = createMigrator(testDatabaseUrl);
    });

    it('should authenticate using pg Pool connection', async () => {
      await migrator.authenticate();
      
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client even if authentication query fails', async () => {
      mockClient.query.mockRejectedValue(new Error('Connection failed'));
      
      await expect(migrator.authenticate()).rejects.toThrow('Connection failed');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should run migrations using umzug.up()', async () => {
      const mockMigrations = [{ name: '001-test.up.sql' }];
      mockUmzug.up.mockResolvedValue(mockMigrations);
      
      const result = await migrator.up();
      
      expect(mockUmzug.up).toHaveBeenCalled();
      expect(result).toEqual(mockMigrations);
    });

    it('should run down migrations using umzug.down()', async () => {
      const mockMigrations = [{ name: '001-test.up.sql' }];
      mockUmzug.down.mockResolvedValue(mockMigrations);
      
      const result = await migrator.down();
      
      expect(mockUmzug.down).toHaveBeenCalled();
      expect(result).toEqual(mockMigrations);
    });

    it('should close pg Pool connection', async () => {
      await migrator.close();
      
      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should configure Umzug with correct migration glob pattern', () => {
      expect(MockUmzug).toHaveBeenCalledWith(
        expect.objectContaining({
          migrations: expect.objectContaining({
            glob: path.join(testMigrationsPath, '*.up.sql'),
          }),
        })
      );
    });

    it('should configure Umzug with pg Pool as context', () => {
      expect(MockUmzug).toHaveBeenCalledWith(
        expect.objectContaining({
          context: mockPool,
        })
      );
    });

    it('should use pg client for SQL execution in migration resolver', () => {
      // Get the Umzug constructor call
      const umzugCall = MockUmzug.mock.calls[0][0];
      const migrationResolver = (umzugCall.migrations as any).resolve;
      
      // Test the migration resolver
      const mockMigration = migrationResolver({
        name: '001-test.up.sql',
        path: path.join(testMigrationsPath, '001-test.up.sql'),
      });
      
      expect(mockMigration.name).toBe('001-test.up.sql');
      expect(typeof mockMigration.up).toBe('function');
      expect(typeof mockMigration.down).toBe('function');
    });

    it('should execute SQL using pg client in up migration', async () => {
      const umzugCall = MockUmzug.mock.calls[0][0];
      const migrationResolver = (umzugCall.migrations as any).resolve;
      const mockMigration = migrationResolver({
        name: '001-test.up.sql',
        path: path.join(testMigrationsPath, '001-test.up.sql'),
      });
      
      await mockMigration.up();
      
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('CREATE TABLE test (id SERIAL PRIMARY KEY);');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should execute SQL using pg client in down migration', async () => {
      const downSql = 'DROP TABLE test;';
      
      // Reset and setup mocks specifically for this test
      vi.clearAllMocks();
      mockFs.existsSync.mockReturnValue(true); // migrations directory and down file exist
      mockFs.readFileSync.mockReturnValue(downSql); // return down SQL when read
      
      // Mock pg client
      mockClient = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
        release: vi.fn(),
      };
      
      mockPool = {
        connect: vi.fn().mockResolvedValue(mockClient),
        end: vi.fn().mockResolvedValue(undefined),
      };
      MockPool.mockImplementation(() => mockPool);
      
      // Mock Umzug
      mockUmzug = {
        up: vi.fn().mockResolvedValue([]),
        down: vi.fn().mockResolvedValue([]),
      };
      MockUmzug.mockImplementation(() => mockUmzug);
      
      // Create fresh migrator with clean mocks
      createMigrator(testDatabaseUrl);
      
      // Get the migration resolver from the most recent Umzug call
      const umzugCall = MockUmzug.mock.calls[MockUmzug.mock.calls.length - 1][0];
      const migrationResolver = (umzugCall.migrations as any).resolve;
      const mockMigration = migrationResolver({
        name: '001-test.up.sql',
        path: path.join(testMigrationsPath, '001-test.up.sql'),
      });
      
      await mockMigration.down();
      
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(downSql);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client even if SQL execution fails', async () => {
      mockClient.query.mockRejectedValue(new Error('SQL error'));
      
      const umzugCall = MockUmzug.mock.calls[0][0];
      const migrationResolver = (umzugCall.migrations as any).resolve;
      const mockMigration = migrationResolver({
        name: '001-test.up.sql',
        path: path.join(testMigrationsPath, '001-test.up.sql'),
      });
      
      await expect(mockMigration.up()).rejects.toThrow('SQL error');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should use pg client for migration tracking in SequelizeMeta table', async () => {
      const umzugCall = MockUmzug.mock.calls[0][0];
      const storage = umzugCall.storage as any;
      
      // Test logMigration
      await storage.logMigration({ name: '001-test.up.sql', context: mockPool });
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO "SequelizeMeta" ("name") VALUES ($1)',
        ['001-test.up.sql']
      );
      
      // Test unlogMigration  
      await storage.unlogMigration({ name: '001-test.up.sql', context: mockPool });
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM "SequelizeMeta" WHERE "name" = $1',
        ['001-test.up.sql']
      );
      
      // Test executed
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // CREATE TABLE response
      mockClient.query.mockResolvedValueOnce({ rows: [{ name: '001-test.up.sql' }] }); // SELECT response
      
      const executed = await storage.executed();
      expect(mockClient.query).toHaveBeenCalledWith(
        'CREATE TABLE IF NOT EXISTS "SequelizeMeta" ("name" VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY)'
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT "name" FROM "SequelizeMeta" ORDER BY "name" ASC'
      );
      expect(executed).toEqual(['001-test.up.sql']);
    });
  });
}); 