const db = require('../config/database');

class Warehouse {
  // Get all warehouses with summary
  static async findAll() {
    const result = await db.query(`
      SELECT w.*, 
        COALESCE((SELECT SUM(wi.quantity) FROM warehouse_inventory wi WHERE wi.warehouse_id = w.id), 0) as total_stock
      FROM warehouses w 
      WHERE w.is_active = true 
      ORDER BY w.name
    `);
    return result.rows;
  }

  // Find by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM warehouses WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Find by code
  static async findByCode(code) {
    const result = await db.query(
      'SELECT * FROM warehouses WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  // Get warehouse stock for a specific commodity
  static async getStockForCommodity(commodityId) {
    const result = await db.query(`
      SELECT w.id, w.name, w.code, w.location, 
             COALESCE(wi.quantity, 0) as quantity
      FROM warehouses w
      LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id AND wi.commodity_id = $1
      WHERE w.is_active = true
      ORDER BY w.name
    `, [commodityId]);
    return result.rows;
  }

  // Get all stock for a warehouse
  static async getStock(warehouseId) {
    const result = await db.query(`
      SELECT c.id, c.name, c.category, c.unit, c.price,
             COALESCE(wi.quantity, 0) as quantity
      FROM commodities c
      LEFT JOIN warehouse_inventory wi ON c.id = wi.commodity_id AND wi.warehouse_id = $1
      ORDER BY c.category, c.name
    `, [warehouseId]);
    return result.rows;
  }

  // Update stock for a commodity in a warehouse
  static async updateStock(warehouseId, commodityId, quantity, userId = null) {
    const result = await db.query(`
      INSERT INTO warehouse_inventory (warehouse_id, commodity_id, quantity, last_updated, updated_by)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
      ON CONFLICT (warehouse_id, commodity_id) 
      DO UPDATE SET quantity = $3, last_updated = CURRENT_TIMESTAMP, updated_by = $4
      RETURNING *
    `, [warehouseId, commodityId, quantity, userId]);
    
    // Sync total stock in commodities table
    await this.syncCommodityStock(commodityId);
    
    return result.rows[0];
  }

  // Decrease stock (for fulfillment)
  static async decreaseStock(warehouseId, commodityId, quantity) {
    const result = await db.query(`
      UPDATE warehouse_inventory 
      SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
      WHERE warehouse_id = $2 AND commodity_id = $3 AND quantity >= $1
      RETURNING *
    `, [quantity, warehouseId, commodityId]);
    
    if (result.rows.length > 0) {
      await this.syncCommodityStock(commodityId);
    }
    
    return result.rows[0];
  }

  // Sync commodity total stock from warehouse stock
  static async syncCommodityStock(commodityId) {
    await db.query(`
      UPDATE commodities 
      SET stock = COALESCE((
        SELECT SUM(quantity) FROM warehouse_inventory WHERE commodity_id = $1
      ), 0),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [commodityId]);
  }

  // Check availability for order items in a specific warehouse
  static async checkAvailability(items, warehouseId) {
    const availability = [];
    
    for (const item of items) {
      const commodityId = item.commodity_id || item.commodityId || item.commodity?.id;
      const requestedQty = item.quantity || 0;
      
      const result = await db.query(`
        SELECT COALESCE(quantity, 0) as available 
        FROM warehouse_inventory 
        WHERE commodity_id = $1 AND warehouse_id = $2
      `, [commodityId, warehouseId]);
      
      const available = parseInt(result.rows[0]?.available) || 0;
      const canFulfillQty = Math.min(available, requestedQty);
      
      availability.push({
        itemId: item.id,
        commodityId,
        commodityName: item.commodity?.name || item.name,
        requested: requestedQty,
        available,
        canFulfill: canFulfillQty,
        pending: requestedQty - canFulfillQty,
        status: canFulfillQty === 0 ? 'Unavailable' : 
                canFulfillQty < requestedQty ? 'Partial' : 'Fulfilled'
      });
    }
    
    return availability;
  }

  // Create warehouse
  static async create({ name, location, code }) {
    const result = await db.query(
      `INSERT INTO warehouses (name, location, code) VALUES ($1, $2, $3) RETURNING *`,
      [name, location, code]
    );
    return result.rows[0];
  }

  // Update warehouse
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);

    const result = await db.query(
      `UPDATE warehouses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // Seed warehouses
  static async seed() {
    await db.query(`
      INSERT INTO warehouses (name, location, code) VALUES
        ('Nairobi Warehouse', 'Nairobi, Kenya', 'NBO'),
        ('Dakar Warehouse', 'Dakar, Senegal', 'DKR')
      ON CONFLICT (code) DO NOTHING
    `);
  }
}

module.exports = Warehouse;
