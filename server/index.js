const path = require('path');

// Load environment variables - check multiple locations
const dotenv = require('dotenv');
const envPaths = [
  path.resolve(__dirname, '../.env'),           // Project root
  path.resolve(__dirname, 'config/.env'),       // server/config/
  path.resolve(__dirname, '.env'),              // server/
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`Environment loaded from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('Warning: No .env file found. Using environment variables.');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const commodityRoutes = require('./routes/commodities');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const countryRoutes = require('./routes/countries');
const oslRoutes = require('./routes/osl');
const chatRoutes = require('./routes/chat');
const warehouseRoutes = require('./routes/warehouses');
const aiRoutes = require('./routes/ai');
const catalogRoutes = require('./catalog/routes');
const signalRoutes = require('./routes/signals');
const sessionRoutes = require('./routes/sessions');
const assetRoutes = require('./routes/assets');
const { initAuditTable } = require('./services/auditService');
const { initIdempotencyTable } = require('./middleware/idempotency');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key']
}));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/commodities', commodityRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/osl', oslRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/assets', assetRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const { testConnection } = require('./config/database');
  const aiService = require('./services/aiService');
  
  let dbStatus = 'unknown';
  let dbError = null;
  let aiStatus = 'unknown';
  let aiError = null;
  
  try {
    const connected = await testConnection();
    dbStatus = connected ? 'connected' : 'disconnected';
  } catch (error) {
    dbStatus = 'error';
    dbError = error.message;
  }

  try {
    // Basic connectivity check to Azure OpenAI
    await aiService.generateChatCompletion([{ role: 'user', content: 'hi' }], { maxTokens: 5 });
    aiStatus = 'connected';
  } catch (error) {
    aiStatus = 'error';
    aiError = error.message;
  }

  res.json({ 
    status: (dbStatus === 'connected' && aiStatus === 'connected') ? 'ok' : 'degraded', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      host: process.env.PGHOST ? process.env.PGHOST.substring(0, 20) + '...' : 'NOT SET',
      error: dbError
    },
    ai: {
      status: aiStatus,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'configured' : 'MISSING',
      error: aiError
    },
    config: {
      jwtSecret: process.env.JWT_SECRET ? 'configured' : 'MISSING',
      allowedDomain: process.env.ALLOWED_EMAIL_DOMAIN || 'who.int'
    }
  });
});

// Diagnostic endpoint (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/users', async (req, res) => {
    try {
      const { query } = require('./config/database');
      const result = await query('SELECT id, email, name, role, country, is_active FROM users LIMIT 10');
      res.json({ users: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred.' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Log configuration (without sensitive data)
    console.log('Starting HCOMS Server...');
    console.log(`Database Host: ${process.env.DB_HOST || 'NOT SET'}`);
    console.log(`Database Name: ${process.env.DB_NAME || 'NOT SET'}`);
    console.log(`Database SSL: ${process.env.DB_SSL || 'false'}`);
    console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
    console.log(`Allowed Email Domain: ${process.env.ALLOWED_EMAIL_DOMAIN || 'who.int'}`);

    // Test database connection first
    const { testConnection } = require('./config/database');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Cannot connect to database. Please check your .env configuration.');
      process.exit(1);
    }

    // Only run heavy init/seed when explicitly requested via SEED_DB=true
    if (process.env.SEED_DB === 'true') {
      console.log('SEED_DB=true → running full DB init + seed...');
      const { seedTestUsers, seedWarehouses, seedWarehouseStock } = require('./config/database');
      await initializeDatabase();
      await seedTestUsers();
      await seedWarehouses();
      const { Commodity } = require('./models');
      await Commodity.seed();
      await seedWarehouseStock();
    } else {
      // Lightweight startup — just ensure tables exist
      await initializeDatabase();
      console.log('Skipping seed (set SEED_DB=true to seed on startup)');
    }

    // Initialize pipeline tables (audit log, idempotency keys)
    await initAuditTable().catch(err => console.warn('[Startup] Audit table init skipped:', err.message));
    await initIdempotencyTable().catch(err => console.warn('[Startup] Idempotency table init skipped:', err.message));

    
    app.listen(PORT, () => {
      console.log('========================================');
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log('========================================');
      console.log('Warehouses: Nairobi (NBO), Dakar (DKR)');
      console.log('========================================');
      console.log('Test accounts (password: Password123):');
      console.log('  - super.admin@who.int (Super Admin)');
      console.log('  - admin.nigeria@who.int (Country Office)');
      console.log('  - lab.reviewer@who.int (Laboratory Team)');
      console.log('  - osl.admin@who.int (OSL Team)');
      console.log('========================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
