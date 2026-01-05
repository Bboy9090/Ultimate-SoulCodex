// Simple test script to verify environment variable configuration
// Run with: node test-env-config.js

// Check if .env file exists
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 Environment Configuration Test');
console.log('═══════════════════════════════════════════════════════════════\n');

// Check .env.example
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('✅ .env.example exists');
  const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
  const hasVapid = /VAPID_PUBLIC_KEY/.test(exampleContent) && /VAPID_PRIVATE_KEY/.test(exampleContent);
  if (hasVapid) {
    console.log('✅ .env.example contains VAPID key placeholders');
  }
} else {
  console.log('❌ .env.example not found');
}

console.log('');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for VAPID keys
  const hasVapidPublic = /VAPID_PUBLIC_KEY=/.test(envContent);
  const hasVapidPrivate = /VAPID_PRIVATE_KEY=/.test(envContent);
  const hasVapidSubject = /VAPID_SUBJECT=/.test(envContent);
  
  if (hasVapidPublic && hasVapidPrivate) {
    const publicKeyMatch = envContent.match(/VAPID_PUBLIC_KEY=(.+)/);
    const privateKeyMatch = envContent.match(/VAPID_PRIVATE_KEY=(.+)/);
    
    if (publicKeyMatch && publicKeyMatch[1] && !publicKeyMatch[1].includes('your_public_key_here')) {
      console.log('✅ VAPID_PUBLIC_KEY is set');
    } else {
      console.log('⚠️  VAPID_PUBLIC_KEY needs to be configured');
    }
    
    if (privateKeyMatch && privateKeyMatch[1] && !privateKeyMatch[1].includes('your_private_key_here')) {
      console.log('✅ VAPID_PRIVATE_KEY is set');
    } else {
      console.log('⚠️  VAPID_PRIVATE_KEY needs to be configured');
    }
  } else {
    console.log('⚠️  VAPID keys are missing from .env file');
  }
  
  if (hasVapidSubject) {
    console.log('✅ VAPID_SUBJECT is configured');
  }
  
  // Check other important vars
  const hasDatabase = /DATABASE_URL=/.test(envContent);
  const hasStripe = /STRIPE_SECRET_KEY=/.test(envContent);
  
  console.log('');
  console.log('Other configuration:');
  console.log(hasDatabase ? '✅ DATABASE_URL configured' : 'ℹ️  DATABASE_URL not set (will use MemStorage)');
  console.log(hasStripe ? '✅ Stripe keys configured' : 'ℹ️  Stripe keys not set (premium features disabled)');
  
} else {
  console.log('ℹ️  .env file does not exist');
  console.log('   → Copy .env.example to .env and fill in your values');
  console.log('   → Generate VAPID keys with: web-push generate-vapid-keys');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('📝 Next Steps:');
console.log('═══════════════════════════════════════════════════════════════');
console.log('1. If .env doesn\'t exist, copy .env.example to .env');
console.log('2. Generate VAPID keys: web-push generate-vapid-keys');
console.log('3. Add the keys to your .env file');
console.log('4. Start the server: npm run dev');
console.log('5. Check server logs for VAPID configuration status');
console.log('═══════════════════════════════════════════════════════════════\n');
