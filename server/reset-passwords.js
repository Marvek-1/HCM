/**
 * Reset Test User Passwords
 * Run with: node server/reset-passwords.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, 'config/.env') }) ||
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }) ||
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

const TEST_PASSWORD = 'Password123';

const testUsers = [
  { email: 'admin.nigeria@who.int', name: 'Nigeria Admin', role: 'Country Office', country: 'Nigeria' },
  { email: 'admin.kenya@who.int', name: 'Kenya Admin', role: 'Country Office', country: 'Kenya' },
  { email: 'admin.ghana@who.int', name: 'Ghana Admin', role: 'Country Office', country: 'Ghana' },
  { email: 'lab.reviewer@who.int', name: 'Lab Reviewer', role: 'Laboratory Team', country: null },
  { email: 'osl.admin@who.int', name: 'OSL Administrator', role: 'OSL Team', country: null },
];

async function resetPasswords() {
  console.log('='.repeat(50));
  console.log('Resetting Test User Passwords');
  console.log('='.repeat(50));
  console.log(`\nNew password for all test users: ${TEST_PASSWORD}\n`);

  try {
    // Generate new password hash
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
    console.log('Generated password hash:', hashedPassword.substring(0, 20) + '...');

    for (const user of testUsers) {
      // Check if user exists
      const exists = await pool.query('SELECT id, email FROM users WHERE email = $1', [user.email]);
      
      if (exists.rows.length > 0) {
        // Update existing user's password
        await pool.query(
          'UPDATE users SET password = $1, login_attempts = 0, locked_until = NULL WHERE email = $2',
          [hashedPassword, user.email]
        );
        console.log(`✅ Updated password for: ${user.email}`);
      } else {
        // Create new user
        await pool.query(
          `INSERT INTO users (email, password, name, role, country) VALUES ($1, $2, $3, $4, $5)`,
          [user.email, hashedPassword, user.name, user.role, user.country]
        );
        console.log(`✅ Created new user: ${user.email}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Password reset complete!');
    console.log('='.repeat(50));
    console.log('\nYou can now login with:');
    console.log(`  Email:    admin.nigeria@who.int`);
    console.log(`  Password: ${TEST_PASSWORD}`);
    console.log('\nOther test accounts:');
    testUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetPasswords();
