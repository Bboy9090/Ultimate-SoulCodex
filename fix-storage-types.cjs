const fs = require('fs');
const p = 'packages/db/storage.ts';
let c = fs.readFileSync(p, 'utf8');

// Replace the primary import with a star import from local schema
c = c.replace(/import\s+{[^}]+}\s+from\s+['"](@soulcodex\/db|shared\/schema)['"]/, 'import * as schema from "./schema"');

const types = [
    'User', 'UpsertUser', 'Profile', 'InsertProfile', 
    'Person', 'InsertPerson', 'Assessment', 'InsertAssessment', 
    'AccessCode', 'AccessCodeRedemption', 'InsertAccessCode', 
    'DailyInsight', 'InsertDailyInsight', 'CompatibilityAnalysis', 
    'InsertCompatibility', 'LocalUser', 'PushSubscription', 
    'InsertPushSubscription', 'FrequencyLog', 'InsertFrequencyLog', 
    'WebhookEvent', 'InsertWebhookEvent'
];

types.forEach(t => {
    // Use word boundaries to only replace the exact type name
    const r = new RegExp('\\b' + t + '\\b', 'g');
    c = c.replace(r, 'schema.' + t);
});

// Also fix the stripe types that were likely broken or missing
// (Actually just ensuring the generated file is clean)

fs.writeFileSync(p, c);
console.log('Successfully updated types in packages/db/storage.ts');
