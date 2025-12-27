#!/usr/bin/env node
// Wrapper script to fix @shared/schema module resolution for in-memory bootstrap
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Stub @shared/schema as an empty module before loading dist/index.js
import.meta.resolve('@shared/schema').catch(() => {
  // Module not found, which is expected - we'll stub it
});

// Load and execute the built server
import('./dist/index.js').catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
