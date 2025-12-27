#!/usr/bin/env node
// Post-build patch script to remove @shared/schema references from dist/index.js
// This is necessary because esbuild bundles these imports even though DbStorage is never exported

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(distPath)) {
  console.error('dist/index.js not found. Run `npm run build` first.');
  process.exit(1);
}

let content = fs.readFileSync(distPath, 'utf8');

// Patch 1: Remove the schema import from db.ts section
content = content.replace(
  /import \* as schema from "@shared\/schema";/,
  '// Stubbed for bootstrap\nvar schema = {};'
);

// Patch 2: Remove the problematic table imports from storage.ts section
content = content.replace(
  /import \{ users, localUsers, profiles, assessmentResponses, accessCodes, accessCodeRedemptions, dailyInsights, persons, compatibilityAnalyses, pushSubscriptions, frequencyLogs, webhookEvents \} from "@shared\/schema";/,
  '// Stubbed - DbStorage not used in bootstrap'
);

// Patch 3: Fix the drizzle initialization to not use schema
content = content.replace(
  /var db = drizzle\(\{ client: pool, schema \}\);/,
  'var db = drizzle({ client: pool });'
);

// Patch 4: Handle the old db.ts throw error (if present) - matches with optional whitespace/newlines
content = content.replace(
  /if\s*\(\s*!process\.env\.DATABASE_URL\s*\)\s*\{\s*throw new Error\(\s*"DATABASE_URL must be set[\s\S]*?\)\s*;\s*\}/g,
  '// Bootstrap mode: DATABASE_URL is optional\nconst databaseUrl = process.env.DATABASE_URL;'
);

// Patch 5: Fix old pool initialization pattern  
content = content.replace(
  /export const pool = new Pool\(\{ connectionString: process\.env\.DATABASE_URL \}\);/,
  'export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;'
);

fs.writeFileSync(distPath, content, 'utf8');
console.log('✓ Post-build patch applied to dist/index.js');
