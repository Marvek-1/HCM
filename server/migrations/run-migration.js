const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Running migration: add_warehouse_id_to_users...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add_warehouse_id_to_users.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the migration
    await db.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('   - Added warehouse_id column to users table');
    console.log('   - Added index on warehouse_id');
    console.log('   - Added foreign key constraint to warehouses table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
