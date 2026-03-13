const db = require('../../config/database');

class CatalogItem {
  // ─── READ OPERATIONS ─────────────────────────────────────

  // Paginated search with category filter, warehouse stock aggregation
  static async findAll({ search, category, page = 1, limit = 20, unit } = {}) {
    let whereClause = 'WHERE c.is_active = true';
    const params = [];
    let p = 1;

    if (search) {
      whereClause += ` AND (LOWER(c.name) LIKE LOWER($${p}) OR LOWER(c.description) LIKE LOWER($${p}))`;
      params.push(`%${search}%`);
      p++;
    }
    if (category) {
      whereClause += ` AND c.category = $${p}`;
      params.push(category);
      p++;
    }
    if (unit) {
      whereClause += ` AND c.unit = $${p}`;
      params.push(unit);
      p++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM commodities c ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT c.id, c.name, c.category, c.unit, c.price, c.stock,
             c.description, c.storage_requirements, c.shelf_life,
             c.created_at, c.updated_at,
             COALESCE(json_agg(
               json_build_object(
                 'warehouse_id', wi.warehouse_id,
                 'warehouse_name', w.name,
                 'warehouse_code', w.code,
                 'quantity', wi.quantity
               )
             ) FILTER (WHERE wi.id IS NOT NULL), '[]') as warehouse_stock
      FROM commodities c
      LEFT JOIN warehouse_inventory wi ON c.id = wi.commodity_id
      LEFT JOIN warehouses w ON wi.warehouse_id = w.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.category, c.name
      LIMIT $${p} OFFSET $${p + 1}
    `, [...params, limit, offset]);

    return {
      items: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  // Flat list for dropdowns / exports (no pagination)
  static async findAllSimple() {
    const result = await db.query(`
      SELECT c.id, c.name, c.category, c.unit, c.price, c.stock,
             c.description, c.storage_requirements, c.shelf_life
      FROM commodities c
      WHERE c.is_active = true
      ORDER BY c.category, c.name
    `);
    return result.rows;
  }

  // Single item by ID with full warehouse breakdown
  static async findById(id) {
    const result = await db.query(`
      SELECT c.*,
             COALESCE(json_agg(
               json_build_object(
                 'warehouse_id', wi.warehouse_id,
                 'warehouse_name', w.name,
                 'warehouse_code', w.code,
                 'quantity', wi.quantity
               )
             ) FILTER (WHERE wi.id IS NOT NULL), '[]') as warehouse_stock
      FROM commodities c
      LEFT JOIN warehouse_inventory wi ON c.id = wi.commodity_id
      LEFT JOIN warehouses w ON wi.warehouse_id = w.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    return result.rows[0] || null;
  }

  // ─── CATEGORY OPERATIONS ─────────────────────────────────

  // All active categories with item counts
  static async getCategories() {
    const result = await db.query(`
      SELECT cat.id, cat.name, cat.description,
             COUNT(c.id) FILTER (WHERE c.is_active = true) as item_count
      FROM categories cat
      LEFT JOIN commodities c ON c.category_id = cat.id
      WHERE cat.is_active = true
      GROUP BY cat.id
      ORDER BY cat.name
    `);
    return result.rows;
  }

  // ─── STOCK / WAREHOUSE OPERATIONS ────────────────────────

  // Items below a stock threshold
  static async getLowStock(threshold = 100) {
    const result = await db.query(`
      SELECT c.id, c.name, c.category, c.unit, c.stock, c.price,
             c.storage_requirements, c.shelf_life
      FROM commodities c
      WHERE c.is_active = true AND c.stock < $1
      ORDER BY c.stock ASC
    `, [threshold]);
    return result.rows;
  }

  // Stock breakdown per warehouse for a single commodity
  static async getWarehouseStock(commodityId) {
    const result = await db.query(`
      SELECT w.id as warehouse_id, w.name, w.code, w.location,
             COALESCE(wi.quantity, 0) as quantity
      FROM warehouses w
      LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id AND wi.commodity_id = $1
      WHERE w.is_active = true
      ORDER BY w.name
    `, [commodityId]);
    return result.rows;
  }

  // All warehouses
  static async getWarehouses() {
    const result = await db.query(`
      SELECT id, name, code, location, is_active
      FROM warehouses
      WHERE is_active = true
      ORDER BY name
    `);
    return result.rows;
  }

  // ─── AGGREGATE / DASHBOARD QUERIES ───────────────────────

  // Category-level summary (total items, total stock value)
  static async getCategorySummary() {
    const result = await db.query(`
      SELECT c.category,
             COUNT(*) as item_count,
             SUM(c.stock) as total_units,
             SUM(c.stock * c.price) as total_value
      FROM commodities c
      WHERE c.is_active = true
      GROUP BY c.category
      ORDER BY total_value DESC
    `);
    return result.rows;
  }

  // Warehouse-level summary
  static async getWarehouseSummary() {
    const result = await db.query(`
      SELECT w.id, w.name, w.code, w.location,
             COUNT(DISTINCT wi.commodity_id) as item_count,
             SUM(wi.quantity) as total_units,
             SUM(wi.quantity * c.price) as total_value
      FROM warehouses w
      LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id
      LEFT JOIN commodities c ON wi.commodity_id = c.id AND c.is_active = true
      WHERE w.is_active = true
      GROUP BY w.id
      ORDER BY w.name
    `);
    return result.rows;
  }

  // Distinct units in the catalog
  static async getUnits() {
    const result = await db.query(`
      SELECT DISTINCT unit FROM commodities WHERE is_active = true ORDER BY unit
    `);
    return result.rows.map(r => r.unit);
  }
}

module.exports = CatalogItem;
