const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { initializeDatabase, seedTestUsers, seedWarehouses, seedWarehouseStock } = require('./config/database');

async function runInit() {
  try {
    console.log('Connecting to Neon DB:', process.env.PGHOST);
    await initializeDatabase();
    await seedTestUsers();
    await seedWarehouses();
    await seedWarehouseStock();
    console.log('Database initialization and seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize text database:', error);
    process.exit(1);
  }
}

runInit();
