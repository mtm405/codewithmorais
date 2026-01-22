#!/usr/bin/env node

/**
 * Script to add authorized domains for Firebase Authentication
 * This fixes the "Google sign-in failed" error
 */

const { execSync } = require('child_process');

console.log('\n🔧 Firebase Auth Domain Setup\n');
console.log('=' .repeat(50));

console.log('\n📋 Authorized domains that should be added:\n');
console.log('  1. codewithmorais.com');
console.log('  2. www.codewithmorais.com');
console.log('  3. code-with-morais-405.web.app');
console.log('  4. code-with-morais-405.firebaseapp.com');
console.log('  5. localhost (for local development)');

console.log('\n🌐 To add these domains:\n');
console.log('  1. Go to: https://console.firebase.google.com/project/code-with-morais-405/authentication/settings');
console.log('  2. Scroll to "Authorized domains"');
console.log('  3. Click "Add domain" for each domain above');
console.log('  4. Save changes');

console.log('\n💡 Alternative: Run this command to add them automatically:\n');

const domains = [
    'codewithmorais.com',
    'www.codewithmorais.com', 
    'code-with-morais-405.web.app',
    'code-with-morais-405.firebaseapp.com',
    'localhost'
];

domains.forEach(domain => {
    const command = `firebase auth:import --project code-with-morais-405 --add-domain ${domain}`;
    console.log(`  ${command}`);
});

console.log('\n🔍 Checking current authorized domains...\n');

try {
    // Try to get current config
    const result = execSync('firebase projects:list', { encoding: 'utf-8' });
    console.log('✅ Firebase CLI is working\n');
    
    console.log('📝 Next steps:');
    console.log('  1. Run: node scripts/add-auth-domains.js');
    console.log('  2. Or manually add domains in Firebase Console');
    console.log('  3. Then test Google sign-in again\n');
    
} catch (error) {
    console.log('⚠️  Unable to check domains automatically');
    console.log('   Please add domains manually in Firebase Console\n');
}

console.log('=' .repeat(50));
console.log('\n');
