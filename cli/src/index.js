#!/usr/bin/env node

// This is a wrapper to run the TypeScript version using ts-node in development
// or the compiled JavaScript version in production

const path = require('path');
const fs = require('fs');

const distIndexPath = path.join(__dirname, '../dist/index.js');
const srcIndexPath = path.join(__dirname, 'index.ts');

if (fs.existsSync(distIndexPath)) {
  // Use compiled version if it exists
  require(distIndexPath);
} else {
  // Fall back to ts-node for development
  require('ts-node/register');
  require(srcIndexPath);
}