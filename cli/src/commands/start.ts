import * as path from 'path';
import * as fs from 'fs';
import express from 'express';
import serveStatic from 'serve-static';

export async function start(options: { port: number; directory?: string }): Promise<void> {
  const { port, directory = './dist/app' } = options;
  const staticPath = path.resolve(process.cwd(), directory);

  // Check if the directory exists
  if (!fs.existsSync(staticPath)) {
    throw new Error(`Static files directory not found: ${staticPath}`);
  }

  const app = express();

  // Serve static files
  app.use(serveStatic(staticPath, {
    index: ['index.html', 'index.htm'],
    dotfiles: 'ignore',
    etag: false
  }));

  // Start listening
  const server = app.listen(port, () => {
    console.log(`🚀 Development server running at http://localhost:${port}`);
    console.log(`📁 Serving files from: ${staticPath}`);
    console.log('Press Ctrl+C to stop');
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  });
}