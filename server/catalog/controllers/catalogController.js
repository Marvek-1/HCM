const catalogService = require('../services/catalogService');

// GET /api/catalog
// Browse catalog with search, category filter, pagination
exports.browse = async (req, res) => {
  try {
    const { search, category, page, limit, unit } = req.query;
    const result = await catalogService.browse({
      search,
      category,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      unit
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Catalog] Browse error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to browse catalog.' });
  }
};

// GET /api/catalog/simple
// Flat list for dropdowns / exports
exports.simpleList = async (req, res) => {
  try {
    const items = await catalogService.getSimpleList();
    res.json({ success: true, data: { items } });
  } catch (error) {
    console.error('[Catalog] Simple list error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch catalog items.' });
  }
};

// GET /api/catalog/item/:id
// Single item detail with warehouse breakdown
exports.getItem = async (req, res) => {
  try {
    const item = await catalogService.getItem(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    res.json({ success: true, data: { item } });
  } catch (error) {
    console.error('[Catalog] Get item error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch item.' });
  }
};

// GET /api/catalog/item/:id/stock
// Warehouse-level stock breakdown for a single item
exports.getItemStock = async (req, res) => {
  try {
    const stock = await catalogService.getItemWarehouseBreakdown(req.params.id);
    res.json({ success: true, data: { stock } });
  } catch (error) {
    console.error('[Catalog] Item stock error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stock.' });
  }
};

// GET /api/catalog/categories
// All categories with item counts
exports.getCategories = async (req, res) => {
  try {
    const categories = await catalogService.getCategories();
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error('[Catalog] Categories error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// GET /api/catalog/low-stock?threshold=100
// Items below stock threshold
exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 100;
    const items = await catalogService.getLowStockItems(threshold);
    res.json({ success: true, data: { items, threshold } });
  } catch (error) {
    console.error('[Catalog] Low stock error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock items.' });
  }
};

// GET /api/catalog/warehouses
// All warehouses
exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await catalogService.getWarehouses();
    res.json({ success: true, data: { warehouses } });
  } catch (error) {
    console.error('[Catalog] Warehouses error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses.' });
  }
};

// GET /api/catalog/dashboard
// Aggregate analytics: totals, category breakdown, warehouse breakdown, critical stock
exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await catalogService.getDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('[Catalog] Dashboard error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate dashboard.' });
  }
};
