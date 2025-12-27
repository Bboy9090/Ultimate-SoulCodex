#!/usr/bin/env node
// Post-build patch script to remove @shared/schema references from dist/index.js
// This is necessary because esbuild bundles these imports even though DbStorage is never exported

const fs = require('fs');
const path = require('path');

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

// Patch 4: Make DbStorage methods return stubs
const dbStorageGetUserRegex = /async getUser\(id\) \{\s*const result = await db\.select\(\)\.from\(users\)\.where\(eq\(users\.id, id\)\);\s*return result\[0\];\s*\}/;
content = content.replace(
  dbStorageGetUserRegex,
  'async getUser(id) {\n    return undefined;\n  }'
);

fs.writeFileSync(distPath, content, 'utf8');
console.log('✓ Post-build patch applied to dist/index.js');
