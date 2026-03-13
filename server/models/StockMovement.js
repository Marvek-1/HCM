const db = require('../config/database');

class StockMovement {
  // Get all movements with filters
  static async findAll({ warehouseId, commodityId, movementType, startDate, endDate, page = 1, limit = 50 } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (warehouseId) {
      whereClause += ` AND sm.warehouse_id = $${paramCount}`;
      params.push(warehouseId);
      paramCount++;
    }

    if (commodityId) {
      whereClause += ` AND sm.commodity_id = $${paramCount}`;
      params.push(commodityId);
      paramCount++;
    }

    if (movementType) {
      whereClause += ` AND sm.movement_type = $${paramCount}`;
      params.push(movementType);
      paramCount++;
    }

    if (startDate) {
      whereClause += ` AND sm.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereClause += ` AND sm.created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM stock_movements sm ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT sm.*, 
              c.name as commodity_name, c.unit as commodity_unit,
              w.name as warehouse_name, w.code as warehouse_code,
              w2.name as to_warehouse_name, w2.code as to_warehouse_code,
              u.name as performed_by_name
       FROM stock_movements sm
       LEFT JOIN commodities c ON sm.commodity_id = c.id
       LEFT JOIN warehouses w ON sm.warehouse_id = w.id
       LEFT JOIN warehouses w2 ON sm.to_warehouse_id = w2.id
       LEFT JOIN users u ON sm.performed_by = u.id
       ${whereClause}
       ORDER BY sm.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      movements: result.rows.map(row => ({
        id: row.id,
        movementType: row.movement_type,
        warehouseId: row.warehouse_id,
        warehouseName: row.warehouse_name,
        warehouseCode: row.warehouse_code,
        toWarehouseId: row.to_warehouse_id,
        toWarehouseName: row.to_warehouse_name,
        toWarehouseCode: row.to_warehouse_code,
        commodityId: row.commodity_id,
        commodityName: row.commodity_name,
        commodityUnit: row.commodity_unit,
        quantity: row.quantity,
        referenceType: row.reference_type,
        referenceId: row.reference_id,
        batchNumber: row.batch_number,
        reason: row.reason,
        notes: row.notes,
        performedBy: row.performed_by_name,
        createdAt: row.created_at
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  // Create stock movement
  static async create(data, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Record the movement
      const result = await client.query(
        `INSERT INTO stock_movements 
         (movement_type, warehouse_id, to_warehouse_id, commodity_id, quantity, 
          reference_type, reference_id, batch_number, reason, notes, performed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          data.movementType, data.warehouseId, data.toWarehouseId || null,
          data.commodityId, data.quantity, data.referenceType || null,
          data.referenceId || null, data.batchNumber || null,
          data.reason || null, data.notes || null, userId
        ]
      );

      // Update warehouse inventory based on movement type
      switch (data.movementType) {
        case 'Inbound':
          await client.query(
            `INSERT INTO warehouse_inventory (warehouse_id, commodity_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (warehouse_id, commodity_id) 
             DO UPDATE SET quantity = warehouse_inventory.quantity + $3, last_updated = CURRENT_TIMESTAMP`,
            [data.warehouseId, data.commodityId, data.quantity]
          );
          break;

        case 'Outbound':
        case 'Return':
          await client.query(
            `UPDATE warehouse_inventory 
             SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
             WHERE warehouse_id = $2 AND commodity_id = $3`,
            [data.quantity, data.warehouseId, data.commodityId]
          );
          break;

        case 'Transfer':
          // Deduct from source
          await client.query(
            `UPDATE warehouse_inventory 
             SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
             WHERE warehouse_id = $2 AND commodity_id = $3`,
            [data.quantity, data.warehouseId, data.commodityId]
          );
          // Add to destination
          await client.query(
            `INSERT INTO warehouse_inventory (warehouse_id, commodity_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (warehouse_id, commodity_id) 
             DO UPDATE SET quantity = warehouse_inventory.quantity + $3, last_updated = CURRENT_TIMESTAMP`,
            [data.toWarehouseId, data.commodityId, data.quantity]
          );
          break;

        case 'Adjustment':
          // Can be positive or negative
          await client.query(
            `INSERT INTO warehouse_inventory (warehouse_id, commodity_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (warehouse_id, commodity_id) 
             DO UPDATE SET quantity = warehouse_inventory.quantity + $3, last_updated = CURRENT_TIMESTAMP`,
            [data.warehouseId, data.commodityId, data.quantity]
          );
          break;
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get movement summary by type
  static async getSummary(warehouseId, startDate, endDate) {
    const params = [];
    let whereClause = 'WHERE 1=1';
    let paramCount = 1;

    if (warehouseId) {
      whereClause += ` AND warehouse_id = $${paramCount}`;
      params.push(warehouseId);
      paramCount++;
    }

    if (startDate) {
      whereClause += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const result = await db.query(
      `SELECT 
         movement_type,
         COUNT(*) as count,
         SUM(quantity) as total_quantity
       FROM stock_movements
       ${whereClause}
       GROUP BY movement_type
       ORDER BY movement_type`,
      params
    );

    return result.rows;
  }

  // Get low stock alerts
  static async getLowStockAlerts(threshold = 100) {
    const result = await db.query(
      `SELECT 
         wi.warehouse_id, w.name as warehouse_name, w.code as warehouse_code,
         wi.commodity_id, c.name as commodity_name, c.unit,
         wi.quantity as current_stock
       FROM warehouse_inventory wi
       JOIN warehouses w ON wi.warehouse_id = w.id
       JOIN commodities c ON wi.commodity_id = c.id
       WHERE wi.quantity < $1
       ORDER BY wi.quantity ASC`,
      [threshold]
    );
    return result.rows;
  }

  // Get outbound summary (shipments)
  static async getOutboundSummary({ startDate, endDate } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (startDate) {
      whereClause += ` AND s.created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereClause += ` AND s.created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const result = await db.query(
      `SELECT 
         s.status,
         COUNT(DISTINCT s.id) as shipment_count,
         COUNT(DISTINCT s.order_id) as order_count,
         w.name as warehouse_name, w.code as warehouse_code
       FROM shipments s
       LEFT JOIN warehouses w ON s.warehouse_id = w.id
       ${whereClause}
       GROUP BY s.status, w.name, w.code
       ORDER BY s.status`,
      params
    );

    return result.rows;
  }
}

module.exports = StockMovement;
