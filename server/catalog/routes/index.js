const express = require('express');
const router = express.Router();
const catalog = require('../controllers/catalogController');

// ─── PUBLIC CATALOG ENDPOINTS ──────────────────────────────
// These can be used with or without authentication.
// To require auth, import { authenticate } from '../../middleware/auth'
// and add it as middleware: router.get('/', authenticate, catalog.browse);

// Browse catalog (paginated, searchable, filterable)
router.get('/', catalog.browse);

// Flat list for dropdowns / exports
router.get('/simple', catalog.simpleList);

// Categories with item counts
router.get('/categories', catalog.getCategories);

// Low stock items
router.get('/low-stock', catalog.getLowStock);

// Warehouses
router.get('/warehouses', catalog.getWarehouses);

// Dashboard analytics
router.get('/dashboard', catalog.getDashboard);

// Single item detail
router.get('/item/:id', catalog.getItem);

// Single item warehouse stock breakdown
router.get('/item/:id/stock', catalog.getItemStock);

module.exports = router;
