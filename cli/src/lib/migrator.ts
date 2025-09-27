import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { Umzug } from 'umzug';

interface Migration {
  name: string;
}

interface PreviewMigration {
  name: string;
  sql: string;
}

interface Migrator {
  authenticate(): Promise<void>;
  up(): Promise<Migration[]>;
  down(): Promise<Migration[]>;
  preview(): Promise<PreviewMigration[]>;
  close(): Promise<void>;
}

export function createMigrator(databaseUrl: string): Migrator {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const migrationsPath = path.join(process.cwd(), 'migrations');

  if (!fs.existsSync(migrationsPath)) {
    throw new Error(`Migrations directory not found: ${migrationsPath}`);
  }

  const umzug = new Umzug({
    migrations: {
      glob: path.join(migrationsPath, '*.up.sql'),
      resolve: ({ name, path: migrationPath }) => {
        if (!migrationPath) {
          throw new Error(`Migration path is undefined for ${name}`);
        }
        return {
          name,
          up: async () => {
            const sql = fs.readFileSync(migrationPath).toString();
            const client = await pool.connect();
            try {
              return await client.query(sql);
            } finally {
              client.release();
            }
          },
          down: async () => {
            const downPath = migrationPath.replace('.up.sql', '.down.sql');
            if (!fs.existsSync(downPath)) {
              throw new Error(`Down migration file not found: ${downPath}`);
            }
            const sql = fs.readFileSync(downPath).toString();
            const client = await pool.connect();
            try {
              return await client.query(sql);
            } finally {
              client.release();
            }
          },
        };
      },
    },
    context: pool,
    storage: {
      async logMigration({ name }: { name: string }) {
        const client = await pool.connect();
        try {
          await client.query(
            'INSERT INTO "SequelizeMeta" ("name") VALUES ($1)',
            [name]
          );
        } finally {
          client.release();
        }
      },
      async unlogMigration({ name }: { name: string }) {
        const client = await pool.connect();
        try {
          await client.query(
            'DELETE FROM "SequelizeMeta" WHERE "name" = $1',
            [name]
          );
        } finally {
          client.release();
        }
      },
      async executed() {
        const client = await pool.connect();
        try {
          await client.query(
            'CREATE TABLE IF NOT EXISTS "SequelizeMeta" ("name" VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY)'
          );
          const results = await client.query(
            'SELECT "name" FROM "SequelizeMeta" ORDER BY "name" ASC'
          );
          return results.rows.map((row: any) => row.name);
        } finally {
          client.release();
        }
      },
    },
    logger: console,
  });

  return {
    async authenticate() {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
      } finally {
        client.release();
      }
    },
    async up() {
      return umzug.up();
    },
    async down() {
      return umzug.down();
    },
    async preview() {
      const pending = await umzug.pending();
      const previewMigrations: PreviewMigration[] = [];

      for (const migration of pending) {
        const migrationPath = path.join(migrationsPath, `${migration.name}.up.sql`);
        if (fs.existsSync(migrationPath)) {
          const sql = fs.readFileSync(migrationPath, 'utf8');
          previewMigrations.push({
            name: migration.name,
            sql: sql.trim()
          });
        }
      }

      return previewMigrations;
    },
    async close() {
      return pool.end();
    }
  };
}