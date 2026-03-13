const CatalogItem = require('../models/CatalogItem');

class CatalogService {
  // ─── CATALOG BROWSING ────────────────────────────────────

  async browse({ search, category, page, limit, unit }) {
    const result = await CatalogItem.findAll({ search, category, page, limit, unit });

    // Enrich items with computed fields
    result.items = result.items.map(item => this._enrichItem(item));
    return result;
  }

  async getItem(id) {
    const item = await CatalogItem.findById(id);
    if (!item) return null;
    return this._enrichItem(item);
  }

  async getSimpleList() {
    return CatalogItem.findAllSimple();
  }

  // ─── CATEGORIES ──────────────────────────────────────────

  async getCategories() {
    return CatalogItem.getCategories();
  }

  // ─── STOCK INTELLIGENCE ──────────────────────────────────

  async getLowStockItems(threshold) {
    return CatalogItem.getLowStock(threshold);
  }

  async getItemWarehouseBreakdown(commodityId) {
    return CatalogItem.getWarehouseStock(commodityId);
  }

  async getWarehouses() {
    return CatalogItem.getWarehouses();
  }

  // ─── DASHBOARD / ANALYTICS ──────────────────────────────

  async getDashboard() {
    const [categories, warehouses, units, lowStock] = await Promise.all([
      CatalogItem.getCategorySummary(),
      CatalogItem.getWarehouseSummary(),
      CatalogItem.getUnits(),
      CatalogItem.getLowStock(50)
    ]);

    const totalItems = categories.reduce((sum, c) => sum + parseInt(c.item_count), 0);
    const totalUnits = categories.reduce((sum, c) => sum + parseInt(c.total_units || 0), 0);
    const totalValue = categories.reduce((sum, c) => sum + parseFloat(c.total_value || 0), 0);

    return {
      overview: {
        totalItems,
        totalUnits,
        totalValue: Math.round(totalValue * 100) / 100,
        categoryCount: categories.length,
        warehouseCount: warehouses.length,
        lowStockCount: lowStock.length,
        unitTypes: units
      },
      categories,
      warehouses,
      criticalStock: lowStock.slice(0, 10)
    };
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────

  _enrichItem(item) {
    // Compute availability status
    const stock = parseInt(item.stock) || 0;
    let availability;
    if (stock === 0) availability = 'out_of_stock';
    else if (stock < 50) availability = 'critical';
    else if (stock < 200) availability = 'low';
    else availability = 'in_stock';

    // Compute total value
    const totalValue = stock * (parseFloat(item.price) || 0);

    return {
      ...item,
      availability,
      total_value: Math.round(totalValue * 100) / 100
    };
  }
}

module.exports = new CatalogService();
