const db = require('../config/database');

/**
 * Migration: Add _by_name columns for workflow confirmations
 * These columns store the username of who confirmed each workflow stage
 */

async function up() {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    console.log('Adding workflow *_by_name columns to orders table...');

    // Add columns for storing usernames of workflow confirmations
    const columns = [
      'pateo_confirmed_by_name',
      'contact_confirmed_by_name',
      'fulfillment_confirmed_by_name',
      'packaging_confirmed_by_name',
      'shipping_booked_by_name',
      'shipping_confirmed_by_name',
      'carrier_delivery_confirmed_by_name',
      'country_receipt_confirmed_by_name'
    ];

    for (const column of columns) {
      // Check if column exists
      const exists = await client.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_name = 'orders' AND column_name = $1`,
        [column]
      );

      if (exists.rows.length === 0) {
        console.log(`  Adding column: ${column}`);
        await client.query(
          `ALTER TABLE orders ADD COLUMN ${column} VARCHAR(255)`
        );
      } else {
        console.log(`  Column already exists: ${column}`);
      }
    }

    await client.query('COMMIT');
    console.log('✓ Migration completed successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    console.log('Removing workflow *_by_name columns from orders table...');

    const columns = [
      'pateo_confirmed_by_name',
      'contact_confirmed_by_name',
      'fulfillment_confirmed_by_name',
      'packaging_confirmed_by_name',
      'shipping_booked_by_name',
      'shipping_confirmed_by_name',
      'carrier_delivery_confirmed_by_name',
      'country_receipt_confirmed_by_name'
    ];

    for (const column of columns) {
      console.log(`  Dropping column: ${column}`);
      await client.query(
        `ALTER TABLE orders DROP COLUMN IF EXISTS ${column}`
      );
    }

    await client.query('COMMIT');
    console.log('✓ Rollback completed successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Rollback failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  (async () => {
    try {
      await up();
      process.exit(0);
    } catch (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
  })();
}

module.exports = { up, down };
