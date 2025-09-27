#!/usr/bin/env node

import { Command } from 'commander';
import { migrate } from './commands/migrate';
import { start } from './commands/start';

const program = new Command();

program
  .name('yunokit')
  .description('YunoKit CLI tool for database migrations')
  .version('1.0.0');

program
  .command('migrate')
  .description('Run database migrations')
  .option('-u, --url <url>', 'Database URL', 'postgresql://postgres:postgres@localhost:54322/postgres')
  .option('--preview', 'Show pending migrations and their SQL without executing')
  .action(async (options: { url: string; preview?: boolean }) => {
    try {
      await migrate(options.url, options.preview);
      if (!options.preview) {
        console.log('Migrations completed successfully');
      }
    } catch (error) {
      console.error('Migration failed:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('start')
  .description('Start development server')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-d, --directory <directory>', 'Directory to serve static files from', './dist/app')
  .action(async (options: { port: string; directory: string }) => {
    try {
      const port = parseInt(options.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Port must be a valid number between 1 and 65535');
      }
      await start({ port, directory: options.directory });
    } catch (error) {
      console.error('Failed to start server:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();