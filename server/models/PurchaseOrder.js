const db = require('../config/database');

class PurchaseOrder {
  // Generate PO number
  static async generatePONumber() {
    const year = new Date().getFullYear();
    const result = await db.query(
      `SELECT COUNT(*) + 1 as next_num FROM purchase_orders WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const nextNum = result.rows[0].next_num.toString().padStart(4, '0');
    return `PO-${year}-${nextNum}`;
  }

  // Get all purchase orders
  static async findAll({ supplierId, warehouseId, status, page = 1, limit = 20 } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (supplierId) {
      whereClause += ` AND po.supplier_id = $${paramCount}`;
      params.push(supplierId);
      paramCount++;
    }

    if (warehouseId) {
      whereClause += ` AND po.warehouse_id = $${paramCount}`;
      params.push(warehouseId);
      paramCount++;
    }

    if (status) {
      whereClause += ` AND po.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM purchase_orders po ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT po.*, s.name as supplier_name, s.code as supplier_code,
              w.name as warehouse_name, w.code as warehouse_code,
              u.name as created_by_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN warehouses w ON po.warehouse_id = w.id
       LEFT JOIN users u ON po.created_by = u.id
       ${whereClause}
       ORDER BY po.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      purchaseOrders: result.rows.map(this._formatPO),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  // Get PO by ID with items
  static async findById(id) {
    const poResult = await db.query(
      `SELECT po.*, s.name as supplier_name, s.code as supplier_code,
              s.contact_name as supplier_contact, s.contact_email as supplier_email,
              w.name as warehouse_name, w.code as warehouse_code,
              u.name as created_by_name, u2.name as approved_by_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN warehouses w ON po.warehouse_id = w.id
       LEFT JOIN users u ON po.created_by = u.id
       LEFT JOIN users u2 ON po.approved_by = u2.id
       WHERE po.id = $1`,
      [id]
    );

    if (poResult.rows.length === 0) return null;

    const po = this._formatPO(poResult.rows[0]);

    // Get items
    const itemsResult = await db.query(
      `SELECT poi.*, c.name as commodity_name, c.unit as commodity_unit
       FROM purchase_order_items poi
       JOIN commodities c ON poi.commodity_id = c.id
       WHERE poi.purchase_order_id = $1
       ORDER BY poi.id`,
      [id]
    );

    po.items = itemsResult.rows.map(item => ({
      id: item.id,
      commodityId: item.commodity_id,
      commodityName: item.commodity_name,
      commodityUnit: item.commodity_unit,
      quantityOrdered: item.quantity_ordered,
      quantityReceived: item.quantity_received,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price),
      status: item.status,
      notes: item.notes
    }));

    return po;
  }

  // Create purchase order
  static async create(data, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const poNumber = await this.generatePONumber();
      
      const poResult = await client.query(
        `INSERT INTO purchase_orders 
         (po_number, supplier_id, warehouse_id, status, order_date, expected_delivery_date, 
          shipping_method, notes, created_by)
         VALUES ($1, $2, $3, 'Draft', $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          poNumber, data.supplierId, data.warehouseId, data.orderDate || new Date(),
          data.expectedDeliveryDate || null, data.shippingMethod || null,
          data.notes || null, userId
        ]
      );

      const po = poResult.rows[0];
      let subtotal = 0;

      // Add items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const totalPrice = item.quantity * item.unitPrice;
          subtotal += totalPrice;
          
          await client.query(
            `INSERT INTO purchase_order_items 
             (purchase_order_id, commodity_id, quantity_ordered, unit_price, total_price, notes)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [po.id, item.commodityId, item.quantity, item.unitPrice, totalPrice, item.notes || null]
          );
        }
      }

      // Update totals
      await client.query(
        `UPDATE purchase_orders SET subtotal = $1, total_amount = $1 WHERE id = $2`,
        [subtotal, po.id]
      );

      await client.query('COMMIT');
      return this.findById(po.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update PO status
  static async updateStatus(id, status, userId) {
    const updates = { status };
    
    if (status === 'Confirmed' || status === 'Submitted') {
      updates.approved_by = userId;
      updates.approved_at = new Date();
    }
    
    if (status === 'Received') {
      updates.actual_delivery_date = new Date();
    }

    const fields = Object.keys(updates).map((k, i) => `${k} = $${i + 1}`);
    const values = Object.values(updates);
    values.push(id);

    await db.query(
      `UPDATE purchase_orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${values.length}`,
      values
    );

    return this.findById(id);
  }

  // Receive items (partial or full)
  static async receiveItems(poId, items, warehouseId, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Generate receipt number
      const receiptNum = `REC-${Date.now()}`;
      
      // Create stock receipt
      const receiptResult = await client.query(
        `INSERT INTO stock_receipts (receipt_number, purchase_order_id, warehouse_id, receipt_date, received_by)
         VALUES ($1, $2, $3, CURRENT_DATE, $4) RETURNING *`,
        [receiptNum, poId, warehouseId, userId]
      );
      const receipt = receiptResult.rows[0];

      let allReceived = true;

      for (const item of items) {
        // Update PO item
        await client.query(
          `UPDATE purchase_order_items 
           SET quantity_received = quantity_received + $1,
               status = CASE 
                 WHEN quantity_received + $1 >= quantity_ordered THEN 'Received'
                 WHEN quantity_received + $1 > 0 THEN 'Partial'
                 ELSE status
               END
           WHERE id = $2`,
          [item.quantityReceived, item.poItemId]
        );

        // Check if all received
        const itemCheck = await client.query(
          `SELECT quantity_ordered, quantity_received + $1 as new_received 
           FROM purchase_order_items WHERE id = $2`,
          [item.quantityReceived, item.poItemId]
        );
        if (itemCheck.rows[0].new_received < itemCheck.rows[0].quantity_ordered) {
          allReceived = false;
        }

        // Create receipt item
        await client.query(
          `INSERT INTO stock_receipt_items 
           (stock_receipt_id, purchase_order_item_id, commodity_id, quantity_received, batch_number, expiry_date, condition)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [receipt.id, item.poItemId, item.commodityId, item.quantityReceived, 
           item.batchNumber || null, item.expiryDate || null, item.condition || 'Good']
        );

        // Update warehouse inventory
        await client.query(
          `INSERT INTO warehouse_inventory (warehouse_id, commodity_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (warehouse_id, commodity_id) 
           DO UPDATE SET quantity = warehouse_inventory.quantity + $3, last_updated = CURRENT_TIMESTAMP`,
          [warehouseId, item.commodityId, item.quantityReceived]
        );

        // Record stock movement
        await client.query(
          `INSERT INTO stock_movements 
           (movement_type, warehouse_id, commodity_id, quantity, reference_type, reference_id, batch_number, performed_by)
           VALUES ('Inbound', $1, $2, $3, 'PurchaseOrder', $4, $5, $6)`,
          [warehouseId, item.commodityId, item.quantityReceived, poId, item.batchNumber || null, userId]
        );
      }

      // Update PO status
      await client.query(
        `UPDATE purchase_orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [allReceived ? 'Received' : 'Partially Received', poId]
      );

      await client.query('COMMIT');
      return this.findById(poId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Format PO object
  static _formatPO(row) {
    return {
      id: row.id,
      poNumber: row.po_number,
      supplierId: row.supplier_id,
      supplierName: row.supplier_name,
      supplierCode: row.supplier_code,
      supplierContact: row.supplier_contact,
      supplierEmail: row.supplier_email,
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name,
      warehouseCode: row.warehouse_code,
      status: row.status,
      orderDate: row.order_date,
      expectedDeliveryDate: row.expected_delivery_date,
      actualDeliveryDate: row.actual_delivery_date,
      shippingMethod: row.shipping_method,
      trackingNumber: row.tracking_number,
      subtotal: parseFloat(row.subtotal || 0),
      shippingCost: parseFloat(row.shipping_cost || 0),
      totalAmount: parseFloat(row.total_amount || 0),
      notes: row.notes,
      createdBy: row.created_by_name,
      approvedBy: row.approved_by_name,
      approvedAt: row.approved_at,
      createdAt: row.created_at
    };
  }

  // Get procurement statistics
  static async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft_orders,
        COUNT(CASE WHEN status IN ('Submitted', 'Confirmed') THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'Shipped' THEN 1 END) as in_transit,
        COUNT(CASE WHEN status IN ('Partially Received', 'Received') THEN 1 END) as received_orders,
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount END), 0) as total_value,
        COALESCE(SUM(CASE WHEN status IN ('Submitted', 'Confirmed', 'Shipped') THEN total_amount END), 0) as pending_value
      FROM purchase_orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
    `);
    return result.rows[0];
  }
}

module.exports = PurchaseOrder;
