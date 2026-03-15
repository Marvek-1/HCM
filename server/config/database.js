const { Pool } = require('pg');

// PostgreSQL connection configuration for Azure
const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: process.env.PGPORT || process.env.DB_PORT || 5432,
  database: process.env.PGDATABASE || process.env.DB_NAME || 'hcoms_db',
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || process.env.GPASSWORD || 'postgres',
  ssl: (process.env.DB_SSL === 'true' || process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production' || process.env.PGHOST?.includes('azure.com') || process.env.PGHOST?.includes('neon.tech')) ? {
    rejectUnauthorized: false // Required for Azure PostgreSQL and Neon
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for Azure
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        country VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create warehouses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        code VARCHAR(10) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create commodities table with description
    await client.query(`
      CREATE TABLE IF NOT EXISTS commodities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        unit VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        storage_requirements VARCHAR(255),
        shelf_life VARCHAR(100),
        manufacturer VARCHAR(255),
        last_updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create warehouse_inventory table for tracking stock per warehouse
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouse_inventory (
        id SERIAL PRIMARY KEY,
        commodity_id INTEGER REFERENCES commodities(id) ON DELETE CASCADE,
        warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        UNIQUE(commodity_id, warehouse_id)
      )
    `);

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        country VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
        status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
        pateo_ref VARCHAR(100) NOT NULL,
        pateo_file VARCHAR(255) NOT NULL,
        notes TEXT,
        created_by INTEGER REFERENCES users(id),
        lab_reviewed_by INTEGER REFERENCES users(id),
        lab_review_date TIMESTAMP,
        osl_approved_by INTEGER REFERENCES users(id),
        osl_approve_date TIMESTAMP,
        shipment_tracking VARCHAR(100),
        fulfillment_warehouse_id INTEGER REFERENCES warehouses(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table with fulfillment tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        commodity_id INTEGER REFERENCES commodities(id),
        quantity INTEGER NOT NULL,
        quantity_fulfilled INTEGER DEFAULT 0,
        unit_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'partial', 'unavailable')),
        fulfilled_from_warehouse INTEGER REFERENCES warehouses(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create login_logs table for monitoring
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'locked')),
        failure_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for active session tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create activity_logs table for audit trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns if they don't exist (for existing databases)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commodities' AND column_name = 'description') THEN
          ALTER TABLE commodities ADD COLUMN description TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commodities' AND column_name = 'storage_requirements') THEN
          ALTER TABLE commodities ADD COLUMN storage_requirements VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'commodities' AND column_name = 'manufacturer') THEN
          ALTER TABLE commodities ADD COLUMN manufacturer VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'quantity_fulfilled') THEN
          ALTER TABLE order_items ADD COLUMN quantity_fulfilled INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'status') THEN
          ALTER TABLE order_items ADD COLUMN status VARCHAR(30) DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'fulfilled_from_warehouse') THEN
          ALTER TABLE order_items ADD COLUMN fulfilled_from_warehouse INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'notes') THEN
          ALTER TABLE order_items ADD COLUMN notes TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'updated_at') THEN
          ALTER TABLE order_items ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        -- Add warehouse_id to users table for OSL Team warehouse assignment
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'warehouse_id') THEN
          ALTER TABLE users ADD COLUMN warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL;
        END IF;
        -- Add fulfillment_warehouse_id to orders table for Lab Team warehouse forwarding
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfillment_warehouse_id') THEN
          ALTER TABLE orders ADD COLUMN fulfillment_warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL;
        END IF;
        -- Fix users constraints and columns
        -- Fix users constraints and columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'must_change_password') THEN
          ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `);
      
    await client.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_country ON orders(country)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_commodity ON warehouse_inventory(commodity_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse ON warehouse_inventory(warehouse_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON users(warehouse_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)`);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

// Seed test users
const seedTestUsers = async () => {
  const bcrypt = require('bcryptjs');
  
  const testUsers = [
    { email: 'super.admin@who.int', name: 'System Administrator', role: 'Super Admin', country: null },
    { email: 'admin.nigeria@who.int', name: 'Nigeria Admin', role: 'Country Office', country: 'Nigeria' },
    { email: 'admin.kenya@who.int', name: 'Kenya Admin', role: 'Country Office', country: 'Kenya' },
    { email: 'admin.ghana@who.int', name: 'Ghana Admin', role: 'Country Office', country: 'Ghana' },
    { email: 'lab.reviewer@who.int', name: 'Lab Reviewer', role: 'Laboratory Team', country: null },
    { email: 'osl.admin@who.int', name: 'OSL Administrator', role: 'OSL Team', country: null },
  ];

  // Default password for test accounts: Password123
  const hashedPassword = await bcrypt.hash('Password123', 12);

  for (const user of testUsers) {
    try {
      // Check if user exists
      const exists = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO users (email, password, name, role, country, must_change_password) VALUES ($1, $2, $3, $4, $5, false)`,
          [user.email, hashedPassword, user.name, user.role, user.country]
        );
        console.log(`Created test user: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    }
  }
};

// Seed warehouses
const seedWarehouses = async () => {
  const warehouses = [
    { name: 'Nairobi Warehouse', location: 'Nairobi, Kenya', code: 'NBO' },
    { name: 'Dakar Warehouse', location: 'Dakar, Senegal', code: 'DKR' },
  ];

  for (const warehouse of warehouses) {
    try {
      const exists = await pool.query('SELECT id FROM warehouses WHERE code = $1', [warehouse.code]);
      
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO warehouses (name, location, code) VALUES ($1, $2, $3)`,
          [warehouse.name, warehouse.location, warehouse.code]
        );
        console.log(`Created warehouse: ${warehouse.name}`);
      }
    } catch (error) {
      console.error(`Error creating warehouse ${warehouse.name}:`, error.message);
    }
  }
};

// Seed warehouse stock for commodities
const seedWarehouseStock = async () => {
  try {
    // Get all warehouses
    const warehouses = await pool.query('SELECT id, code FROM warehouses');
    const commodities = await pool.query('SELECT id FROM commodities');

    for (const commodity of commodities.rows) {
      for (const warehouse of warehouses.rows) {
        const exists = await pool.query(
          'SELECT id FROM warehouse_inventory WHERE commodity_id = $1 AND warehouse_id = $2',
          [commodity.id, warehouse.id]
        );

        if (exists.rows.length === 0) {
          // Random stock between 50 and 500 for each warehouse
          const quantity = Math.floor(Math.random() * 450) + 50;
          await pool.query(
            `INSERT INTO warehouse_inventory (commodity_id, warehouse_id, quantity) VALUES ($1, $2, $3)`,
            [commodity.id, warehouse.id, quantity]
          );
        }
      }
    }

    // Update total stock in commodities table
    await pool.query(`
      UPDATE commodities c SET stock = (
        SELECT COALESCE(SUM(wi.quantity), 0)
        FROM warehouse_inventory wi
        WHERE wi.commodity_id = c.id
      )
    `);

    console.log('Warehouse stock initialized');
  } catch (error) {
    console.error('Error seeding warehouse stock:', error.message);
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  initializeDatabase,
  testConnection,
  seedTestUsers,
  seedWarehouses,
  seedWarehouseStock
};
