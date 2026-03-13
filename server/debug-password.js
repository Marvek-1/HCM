/**
 * Debug Password Script
 * Run with: node server/debug-password.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from multiple possible locations
require('dotenv').config({ path: path.resolve(__dirname, 'config/.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const TEST_EMAIL = 'admin.nigeria@who.int';
const TEST_PASSWORD = 'Password123';

async function debugPassword() {
  console.log('='.repeat(60));
  console.log('Password Debug Script');
  console.log('='.repeat(60));
  
  try {
    // 1. Get current user from database
    console.log(`\n1. Looking up user: ${TEST_EMAIL}`);
    const userResult = await pool.query('SELECT id, email, password, name FROM users WHERE email = $1', [TEST_EMAIL]);
    
    if (userResult.rows.length === 0) {
      console.log('   ❌ User not found! Creating user...');
      const newHash = await bcrypt.hash(TEST_PASSWORD, 12);
      await pool.query(
        `INSERT INTO users (email, password, name, role, country) VALUES ($1, $2, $3, $4, $5)`,
        [TEST_EMAIL, newHash, 'Nigeria Admin', 'Country Office', 'Nigeria']
      );
      console.log('   ✅ User created with password: ' + TEST_PASSWORD);
      await pool.end();
      return;
    }

    const user = userResult.rows[0];
    console.log(`   ✅ User found: ${user.name} (ID: ${user.id})`);
    console.log(`   Current password hash: ${user.password.substring(0, 30)}...`);

    // 2. Test current password
    console.log(`\n2. Testing password "${TEST_PASSWORD}" against stored hash...`);
    const isValid = await bcrypt.compare(TEST_PASSWORD, user.password);
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    if (!isValid) {
      // 3. Generate new hash and test it
      console.log('\n3. Generating new password hash...');
      const newHash = await bcrypt.hash(TEST_PASSWORD, 12);
      console.log(`   New hash: ${newHash.substring(0, 30)}...`);
      
      // Verify the new hash works
      const newHashValid = await bcrypt.compare(TEST_PASSWORD, newHash);
      console.log(`   New hash verification: ${newHashValid ? '✅ VALID' : '❌ INVALID'}`);

      // 4. Update password in database
      console.log('\n4. Updating password in database...');
      await pool.query(
        'UPDATE users SET password = $1, login_attempts = 0, locked_until = NULL WHERE email = $2',
        [newHash, TEST_EMAIL]
      );
      console.log('   ✅ Password updated!');

      // 5. Verify update
      console.log('\n5. Verifying update...');
      const verifyResult = await pool.query('SELECT password FROM users WHERE email = $1', [TEST_EMAIL]);
      const storedHash = verifyResult.rows[0].password;
      const finalCheck = await bcrypt.compare(TEST_PASSWORD, storedHash);
      console.log(`   Final verification: ${finalCheck ? '✅ SUCCESS' : '❌ FAILED'}`);

      if (finalCheck) {
        console.log('\n' + '='.repeat(60));
        console.log('✅ Password has been fixed!');
        console.log('='.repeat(60));
        console.log(`\nYou can now login with:`);
        console.log(`   Email:    ${TEST_EMAIL}`);
        console.log(`   Password: ${TEST_PASSWORD}`);
      }
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('✅ Password is already correct!');
      console.log('='.repeat(60));
      console.log(`\nYou can login with:`);
      console.log(`   Email:    ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
    }

    // Also update other test users
    console.log('\n6. Updating all test users...');
    const newHash = await bcrypt.hash(TEST_PASSWORD, 12);
    const testEmails = [
      'admin.nigeria@who.int',
      'admin.kenya@who.int', 
      'admin.ghana@who.int',
      'lab.reviewer@who.int',
      'osl.admin@who.int'
    ];
    
    for (const email of testEmails) {
      await pool.query(
        'UPDATE users SET password = $1, login_attempts = 0, locked_until = NULL WHERE email = $2',
        [newHash, email]
      );
    }
    console.log('   ✅ All test user passwords updated to: ' + TEST_PASSWORD);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugPassword();
