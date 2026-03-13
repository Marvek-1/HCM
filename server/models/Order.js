const db = require('../config/database');

class Order {
  // Generate order number
  static generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `ORD-${year}-${random}${timestamp}`;
  }

  // Create new order with items including intervention type and shipping details
  static async create({ 
    country, priority, pateoRef, pateoFile, notes, createdBy, createdByName, items, 
    interventionType, situationDate,
    deliveryContactName, deliveryContactPhone, deliveryContactEmail,
    deliveryAddress, deliveryCity, deliveryCountry, preferredShippingMethod
  }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const orderNumber = this.generateOrderNumber();

      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, country, priority, pateo_ref, pateo_file, notes, created_by, submitted_by_name,
          intervention_type, situation_date,
          delivery_contact_name, delivery_contact_phone, delivery_contact_email,
          delivery_address, delivery_city, delivery_country, preferred_shipping_method
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING *`,
        [
          orderNumber, country, priority, pateoRef, pateoFile, notes || null, createdBy, createdByName || null,
          interventionType || null, situationDate || null,
          deliveryContactName || null, deliveryContactPhone || null, deliveryContactEmail || null,
          deliveryAddress || null, deliveryCity || null, deliveryCountry || country, preferredShippingMethod || null
        ]
      );
      const order = orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, commodity_id, quantity, unit_price, fulfillment_status)
           VALUES ($1, $2, $3, $4, 'Pending')`,
          [order.id, item.commodityId, item.quantity, item.unitPrice]
        );
      }

      await client.query('COMMIT');
      return this.findById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find order by ID with full details
  static async findById(id) {
    const orderResult = await db.query(
      `SELECT o.*,
              u1.name as created_by_name,
              u2.name as lab_reviewed_by_name,
              u3.name as osl_approved_by_name,
              w.name as fulfillment_warehouse_name,
              w.code as fulfillment_warehouse_code
       FROM orders o
       LEFT JOIN users u1 ON o.created_by = u1.id
       LEFT JOIN users u2 ON o.lab_reviewed_by = u2.id
       LEFT JOIN users u3 ON o.osl_approved_by = u3.id
       LEFT JOIN warehouses w ON o.fulfillment_warehouse_id = w.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) return null;
    const order = orderResult.rows[0];

    // Get items with fulfillment details (excluding soft-deleted items)
    const itemsResult = await db.query(
      `SELECT oi.*, c.name, c.category, c.unit, c.stock as total_stock, c.description,
              s.name as supplier_name, s.code as supplier_code
       FROM order_items oi
       JOIN commodities c ON oi.commodity_id = c.id
       LEFT JOIN suppliers s ON c.supplier_id = s.id
       WHERE oi.order_id = $1 AND (oi.deleted IS NULL OR oi.deleted = FALSE)`,
      [id]
    );

    // Get item fulfillments (per-warehouse breakdown)
    const fulfillmentsResult = await db.query(
      `SELECT oif.*, w.name as warehouse_name, w.code as warehouse_code, u.name as fulfilled_by_name
       FROM order_item_fulfillments oif
       JOIN warehouses w ON oif.warehouse_id = w.id
       LEFT JOIN users u ON oif.fulfilled_by = u.id
       WHERE oif.order_item_id IN (SELECT id FROM order_items WHERE order_id = $1)`,
      [id]
    );

    // Map fulfillments to items
    const fulfillmentsByItem = {};
    for (const f of fulfillmentsResult.rows) {
      if (!fulfillmentsByItem[f.order_item_id]) {
        fulfillmentsByItem[f.order_item_id] = [];
      }
      fulfillmentsByItem[f.order_item_id].push({
        warehouseId: f.warehouse_id,
        warehouseName: f.warehouse_name,
        warehouseCode: f.warehouse_code,
        quantityFulfilled: f.quantity_fulfilled,
        fulfilledBy: f.fulfilled_by_name,
        fulfilledAt: f.fulfilled_at,
        notes: f.notes
      });
    }

    order.items = itemsResult.rows.map(item => ({
      id: item.id,
      quantity: item.quantity,
      fulfilledQuantity: item.fulfilled_quantity || 0,
      unitPrice: parseFloat(item.unit_price),
      fulfillmentStatus: item.fulfillment_status || 'Pending',
      fulfillmentNotes: item.fulfillment_notes,
      warehouseFulfillments: fulfillmentsByItem[item.id] || [],
      quantityReceived: item.quantity_received,
      receivedValidated: item.received_validated,
      receivedNotes: item.received_notes,
      commodity: {
        id: item.commodity_id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        price: parseFloat(item.unit_price),
        totalStock: item.total_stock,
        description: item.description,
        supplierName: item.supplier_name,
        supplierCode: item.supplier_code
      }
    }));

    // Get shipments
    const shipmentsResult = await db.query(
      `SELECT s.*, w.name as warehouse_name, w.code as warehouse_code, u.name as created_by_name
       FROM shipments s
       JOIN warehouses w ON s.warehouse_id = w.id
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.order_id = $1
       ORDER BY s.created_at`,
      [id]
    );

    // Get shipment items
    for (const shipment of shipmentsResult.rows) {
      const shipmentItemsResult = await db.query(
        `SELECT si.*, c.name as commodity_name, c.unit
         FROM shipment_items si
         JOIN order_items oi ON si.order_item_id = oi.id
         JOIN commodities c ON oi.commodity_id = c.id
         WHERE si.shipment_id = $1`,
        [shipment.id]
      );
      shipment.items = shipmentItemsResult.rows;
    }

    order.shipments = shipmentsResult.rows.map(s => ({
      id: s.id,
      warehouseId: s.warehouse_id,
      warehouseName: s.warehouse_name,
      warehouseCode: s.warehouse_code,
      shippingCompany: s.shipping_company,
      trackingNumber: s.tracking_number,
      deliveryContactName: s.delivery_contact_name,
      deliveryContactPhone: s.delivery_contact_phone,
      deliveryContactEmail: s.delivery_contact_email,
      deliveryAddress: s.delivery_address,
      estimatedDeliveryDateFrom: s.estimated_delivery_date_from,
      estimatedDeliveryDateTo: s.estimated_delivery_date_to,
      actualDeliveryDate: s.actual_delivery_date,
      shippingDocumentUrl: s.shipping_document_url,
      status: s.status,
      notes: s.notes,
      createdBy: s.created_by_name,
      createdAt: s.created_at,
      items: s.items
    }));

    // Calculate fulfillment summary
    order.fulfillmentSummary = {
      totalItems: order.items.length,
      fulfilledItems: order.items.filter(i => i.fulfillmentStatus === 'Fulfilled').length,
      partialItems: order.items.filter(i => i.fulfillmentStatus === 'Partial').length,
      pendingItems: order.items.filter(i => i.fulfillmentStatus === 'Pending').length,
      unavailableItems: order.items.filter(i => i.fulfillmentStatus === 'Unavailable').length,
      totalQuantityRequested: order.items.reduce((sum, i) => sum + i.quantity, 0),
      totalQuantityFulfilled: order.items.reduce((sum, i) => sum + i.fulfilledQuantity, 0)
    };

    // Detect if order is split across multiple warehouses
    const warehouseIds = new Set();
    for (const item of order.items) {
      if (item.warehouseFulfillments && item.warehouseFulfillments.length > 0) {
        for (const fulfillment of item.warehouseFulfillments) {
          warehouseIds.add(fulfillment.warehouseId);
        }
      }
    }
    order.isSplit = warehouseIds.size > 1;
    order.fulfillmentWarehouses = Array.from(warehouseIds);

    return order;
  }

  // Get orders by country
  static async findByCountry(country) {
    const result = await db.query(
      `SELECT o.id FROM orders o WHERE o.country = $1 ORDER BY o.created_at DESC`,
      [country]
    );
    const orders = [];
    for (const row of result.rows) {
      orders.push(await this.findById(row.id));
    }
    return orders;
  }

  // Get all submitted orders (for Laboratory Team)
  static async findAllSubmitted() {
    const result = await db.query(
      `SELECT o.id FROM orders o WHERE o.status != 'Draft' ORDER BY o.created_at DESC`
    );
    const orders = [];
    for (const row of result.rows) {
      orders.push(await this.findById(row.id));
    }
    return orders;
  }

  // Get all orders including drafts (Super Admin only)
  static async findAll() {
    const result = await db.query(
      `SELECT o.id FROM orders o ORDER BY o.created_at DESC`
    );
    const orders = [];
    for (const row of result.rows) {
      orders.push(await this.findById(row.id));
    }
    return orders;
  }

  // Get orders forwarded to OSL
  static async findForwardedToOSL() {
    const result = await db.query(
      `SELECT o.id FROM orders o 
       WHERE o.status IN ('Forwarded to OSL', 'Approved', 'Partially Fulfilled', 'Shipped', 'Completed')
       ORDER BY o.created_at DESC`
    );
    const orders = [];
    for (const row of result.rows) {
      orders.push(await this.findById(row.id));
    }
    return orders;
  }

  // Update order item with modification tracking
  static async updateItem(itemId, { quantity, notes }, userId, userRole, userName) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const currentResult = await client.query(
        'SELECT * FROM order_items WHERE id = $1',
        [itemId]
      );
      
      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const currentItem = currentResult.rows[0];

      // Log modification if quantity changed
      if (quantity !== undefined && quantity !== currentItem.quantity) {
        await client.query(
          `INSERT INTO order_modification_logs (order_id, order_item_id, modified_by, modifier_role, modifier_name, action, previous_value, new_value, reason)
           VALUES ($1, $2, $3, $4, $5, 'quantity_change', $6, $7, $8)`,
          [currentItem.order_id, itemId, userId, userRole, userName, currentItem.quantity.toString(), quantity.toString(), notes || null]
        );
      }

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (quantity !== undefined) {
        updates.push(`quantity = $${paramCount}`);
        values.push(quantity);
        paramCount++;
      }

      if (notes !== undefined) {
        updates.push(`fulfillment_notes = $${paramCount}`);
        values.push(notes);
        paramCount++;
      }

      if (updates.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(itemId);

      await client.query(
        `UPDATE order_items SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );

      await client.query('COMMIT');
      return this.findById(currentItem.order_id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Add item to order
  static async addItem(orderId, { commodityId, quantity, unitPrice }, userId, userRole, userName) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO order_items (order_id, commodity_id, quantity, unit_price, fulfillment_status)
         VALUES ($1, $2, $3, $4, 'Pending')
         RETURNING *`,
        [orderId, commodityId, quantity, unitPrice]
      );

      // Log the addition
      await client.query(
        `INSERT INTO order_modification_logs (order_id, order_item_id, modified_by, modifier_role, modifier_name, action, new_value)
         VALUES ($1, $2, $3, $4, $5, 'item_added', $6)`,
        [orderId, result.rows[0].id, userId, userRole, userName, `Commodity ${commodityId}, Qty: ${quantity}`]
      );

      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Remove item from order
  static async removeItem(orderId, itemId, userId, userRole, userName) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get item details before deleting
      const itemResult = await client.query(
        `SELECT oi.*, c.name as commodity_name FROM order_items oi
         JOIN commodities c ON oi.commodity_id = c.id
         WHERE oi.id = $1`,
        [itemId]
      );

      if (itemResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const item = itemResult.rows[0];

      // Log the removal
      await client.query(
        `INSERT INTO order_modification_logs (order_id, modified_by, modifier_role, modifier_name, action, previous_value)
         VALUES ($1, $2, $3, $4, 'item_removed', $5)`,
        [orderId, userId, userRole, userName, `${item.commodity_name}, Qty: ${item.quantity}`]
      );

      await client.query('DELETE FROM order_items WHERE id = $1', [itemId]);

      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Forward to OSL
  static async forwardToOSL(id, labReviewedBy, labReviewedByName, labNotes = null, warehouseId = null) {
    await db.query(
      `UPDATE orders
       SET status = 'Forwarded to OSL',
           lab_reviewed_by = $1,
           lab_review_date = CURRENT_TIMESTAMP,
           lab_notes = $2,
           forwarded_by = $1,
           forwarded_by_name = $3,
           forwarded_at = CURRENT_TIMESTAMP,
           fulfillment_warehouse_id = $5,
           amendment_requested = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [labReviewedBy, labNotes, labReviewedByName, id, warehouseId]
    );
    return this.findById(id);
  }

  // Request amendment (Lab returns order to Country for adjustments)
  static async requestAmendment(id, requestedBy, requestedByName, notes = null) {
    await db.query(
      `UPDATE orders 
       SET status = 'Submitted',
           amendment_requested = TRUE, 
           amendment_requested_by = $1, 
           amendment_requested_by_name = $2,
           amendment_requested_at = CURRENT_TIMESTAMP,
           amendment_notes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [requestedBy, requestedByName, notes, id]
    );
    return this.findById(id);
  }

  // Cancel order (Country can cancel before shipping booked)
  static async cancelOrder(id, cancelledBy, cancelledByName, reason) {
    await db.query(
      `UPDATE orders 
       SET status = 'Cancelled', 
           cancelled_by = $1, 
           cancelled_by_name = $2,
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [cancelledBy, cancelledByName, reason, id]
    );
    return this.findById(id);
  }

  // Reject order (deprecated - use requestAmendment instead)
  static async reject(id, rejectedBy, role, notes = null) {
    const updateField = role === 'Laboratory Team' ? 'lab_reviewed_by' : 'osl_approved_by';
    const dateField = role === 'Laboratory Team' ? 'lab_review_date' : 'osl_approve_date';
    const notesField = role === 'Laboratory Team' ? 'lab_notes' : 'osl_notes';

    await db.query(
      `UPDATE orders 
       SET status = 'Rejected', 
           ${updateField} = $1, 
           ${dateField} = CURRENT_TIMESTAMP,
           ${notesField} = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [rejectedBy, id, notes]
    );
    return this.findById(id);
  }

  // Request Amendment (Lab sends order back to Country for changes)
  static async requestAmendment(id, requestedBy, requestedByName, notes) {
    await db.query(
      `UPDATE orders 
       SET status = 'Amend Requested', 
           amendment_requested = TRUE,
           amendment_requested_by = $1,
           amendment_requested_by_name = $2,
           amendment_requested_at = CURRENT_TIMESTAMP,
           amendment_notes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [requestedBy, requestedByName, notes, id]
    );
    return this.findById(id);
  }

  // Resubmit order after amendment (Country resubmits amended order)
  static async resubmitAfterAmendment(id, submittedByName) {
    await db.query(
      `UPDATE orders 
       SET status = 'Submitted', 
           amendment_requested = FALSE,
           submitted_by_name = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [submittedByName, id]
    );
    return this.findById(id);
  }

  // Cancel order (Country can cancel before shipping is booked)
  static async cancelOrder(id, cancelledBy, cancelledByName, reason) {
    // Check if order can be cancelled (before shipping booked)
    const orderResult = await db.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    const order = orderResult.rows[0];
    
    // Cannot cancel if shipping is already booked or beyond
    if (order.shipping_booked) {
      throw new Error('Cannot cancel order after shipping has been booked');
    }
    
    if (['Shipped', 'Delivered', 'Completed'].includes(order.status)) {
      throw new Error('Cannot cancel order that has already been shipped');
    }
    
    await db.query(
      `UPDATE orders 
       SET status = 'Cancelled', 
           cancelled_by = $1,
           cancelled_by_name = $2,
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [cancelledBy, cancelledByName, reason, id]
    );
    return this.findById(id);
  }

  // Delete order item (soft delete with justification)
  static async deleteItem(orderId, itemId, deletedBy, deletedByName, reason) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Soft delete the item
      await client.query(
        `UPDATE order_items 
         SET deleted = TRUE,
             deleted_by = $1,
             deleted_by_name = $2,
             deleted_at = CURRENT_TIMESTAMP,
             deletion_reason = $3
         WHERE id = $4 AND order_id = $5`,
        [deletedBy, deletedByName, reason, itemId, orderId]
      );
      
      // Log the modification
      const itemResult = await client.query(
        `SELECT oi.*, c.name as commodity_name FROM order_items oi
         JOIN commodities c ON oi.commodity_id = c.id
         WHERE oi.id = $1`,
        [itemId]
      );
      
      if (itemResult.rows.length > 0) {
        const item = itemResult.rows[0];
        await client.query(
          `INSERT INTO order_modification_logs 
           (order_id, order_item_id, modified_by, modifier_role, modifier_name, action, previous_value, new_value, reason)
           VALUES ($1, $2, $3, $4, $5, 'item_removed', $6, 'deleted', $7)`,
          [orderId, itemId, deletedBy, 'System', deletedByName, `${item.commodity_name} x${item.quantity}`, reason]
        );
      }
      
      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Split fulfill item from multiple warehouses
  static async splitFulfillItem(itemId, fulfillments, userId, userName) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const itemResult = await client.query(
        'SELECT * FROM order_items WHERE id = $1',
        [itemId]
      );
      const item = itemResult.rows[0];
      
      if (!item) {
        throw new Error('Item not found');
      }

      let totalFulfilled = item.fulfilled_quantity || 0;
      const fulfillmentDetails = [];

      for (const f of fulfillments) {
        if (f.quantity <= 0) continue;

        // Check warehouse stock
        const stockResult = await client.query(
          'SELECT quantity FROM warehouse_inventory WHERE commodity_id = $1 AND warehouse_id = $2',
          [item.commodity_id, f.warehouseId]
        );
        const availableStock = stockResult.rows[0]?.quantity || 0;
        const fulfillQty = Math.min(f.quantity, availableStock);
        
        if (fulfillQty <= 0) continue;

        // Record fulfillment
        await client.query(
          `INSERT INTO order_item_fulfillments (order_item_id, warehouse_id, quantity_fulfilled, fulfilled_by, notes)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (order_item_id, warehouse_id) 
           DO UPDATE SET quantity_fulfilled = order_item_fulfillments.quantity_fulfilled + $3,
                         fulfilled_by = $4,
                         fulfilled_at = CURRENT_TIMESTAMP`,
          [itemId, f.warehouseId, fulfillQty, userId, f.notes || null]
        );

        // Decrease warehouse stock
        await client.query(
          `UPDATE warehouse_inventory 
           SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
           WHERE commodity_id = $2 AND warehouse_id = $3`,
          [fulfillQty, item.commodity_id, f.warehouseId]
        );

        totalFulfilled += fulfillQty;
        
        const warehouseResult = await client.query('SELECT code FROM warehouses WHERE id = $1', [f.warehouseId]);
        fulfillmentDetails.push(`${warehouseResult.rows[0].code}: ${fulfillQty}`);
      }

      // Update item fulfillment status
      let newStatus = 'Pending';
      if (totalFulfilled >= item.quantity) {
        newStatus = 'Fulfilled';
      } else if (totalFulfilled > 0) {
        newStatus = 'Partial';
      }

      await client.query(
        `UPDATE order_items 
         SET fulfilled_quantity = $1, fulfillment_status = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [totalFulfilled, newStatus, itemId]
      );

      // Log the split fulfillment
      await client.query(
        `INSERT INTO order_modification_logs (order_id, order_item_id, modified_by, modifier_role, modifier_name, action, new_value)
         VALUES ($1, $2, $3, 'OSL Team', $4, 'split_fulfillment', $5)`,
        [item.order_id, itemId, userId, userName, fulfillmentDetails.join(', ')]
      );

      // Update order status based on all items
      await this.updateOrderFulfillmentStatus(client, item.order_id, userId);

      await client.query('COMMIT');
      return this.findById(item.order_id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Smart auto-fulfill based on country proximity and stock
  static async smartFulfillOrder(orderId, country, userId, userName) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get warehouse priorities for this country
      const proximityResult = await client.query(
        `SELECT cwp.warehouse_id, cwp.priority, w.code 
         FROM country_warehouse_proximity cwp
         JOIN warehouses w ON cwp.warehouse_id = w.id
         WHERE cwp.country = $1 
         ORDER BY cwp.priority`,
        [country]
      );

      let warehousePriorities = proximityResult.rows;
      if (warehousePriorities.length === 0) {
        // Fallback: use all warehouses
        const warehousesResult = await client.query(
          'SELECT id as warehouse_id, code, 1 as priority FROM warehouses WHERE is_active = true'
        );
        warehousePriorities = warehousesResult.rows;
      }

      // Get all pending/partial items
      const itemsResult = await client.query(
        `SELECT oi.*, c.name FROM order_items oi 
         JOIN commodities c ON oi.commodity_id = c.id
         WHERE oi.order_id = $1 AND oi.fulfillment_status IN ('Pending', 'Partial')`,
        [orderId]
      );

      for (const item of itemsResult.rows) {
        const remainingQty = item.quantity - (item.fulfilled_quantity || 0);
        if (remainingQty <= 0) continue;

        let leftToFulfill = remainingQty;

        // Try each warehouse in priority order (closest first, then by stock)
        for (const wp of warehousePriorities) {
          if (leftToFulfill <= 0) break;

          const stockResult = await client.query(
            'SELECT quantity FROM warehouse_inventory WHERE commodity_id = $1 AND warehouse_id = $2',
            [item.commodity_id, wp.warehouse_id]
          );
          const availableStock = stockResult.rows[0]?.quantity || 0;
          
          if (availableStock <= 0) continue;

          const fulfillQty = Math.min(leftToFulfill, availableStock);

          // Record fulfillment
          await client.query(
            `INSERT INTO order_item_fulfillments (order_item_id, warehouse_id, quantity_fulfilled, fulfilled_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (order_item_id, warehouse_id) 
             DO UPDATE SET quantity_fulfilled = order_item_fulfillments.quantity_fulfilled + $3,
                           fulfilled_by = $4,
                           fulfilled_at = CURRENT_TIMESTAMP`,
            [item.id, wp.warehouse_id, fulfillQty, userId]
          );

          // Decrease stock
          await client.query(
            `UPDATE warehouse_inventory 
             SET quantity = quantity - $1, last_updated = CURRENT_TIMESTAMP
             WHERE commodity_id = $2 AND warehouse_id = $3`,
            [fulfillQty, item.commodity_id, wp.warehouse_id]
          );

          leftToFulfill -= fulfillQty;
        }

        // Update item status
        const totalFulfilled = remainingQty - leftToFulfill + (item.fulfilled_quantity || 0);
        let newStatus = totalFulfilled >= item.quantity ? 'Fulfilled' 
                      : totalFulfilled > 0 ? 'Partial' 
                      : 'Unavailable';

        await client.query(
          `UPDATE order_items 
           SET fulfilled_quantity = $1, fulfillment_status = $2, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [totalFulfilled, newStatus, item.id]
        );
      }

      // Update order status
      await this.updateOrderFulfillmentStatus(client, orderId, userId);

      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Helper to update order status based on item fulfillment
  static async updateOrderFulfillmentStatus(client, orderId, userId) {
    const itemsResult = await client.query(
      'SELECT fulfillment_status FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const items = itemsResult.rows;
    const allFulfilled = items.every(i => i.fulfillment_status === 'Fulfilled');
    const anyFulfilled = items.some(i => i.fulfillment_status === 'Fulfilled' || i.fulfillment_status === 'Partial');

    let newStatus;
    if (allFulfilled) {
      newStatus = 'Approved';
    } else if (anyFulfilled) {
      newStatus = 'Partially Fulfilled';
    } else {
      return; // Keep current status
    }

    await client.query(
      `UPDATE orders SET status = $1, osl_approved_by = $2, osl_approve_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [newStatus, userId, orderId]
    );
  }

  // Create shipment
  static async createShipment(orderId, shipmentData, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const shipmentResult = await client.query(
        `INSERT INTO shipments 
         (order_id, warehouse_id, shipping_company, tracking_number, delivery_contact_name, 
          delivery_contact_phone, delivery_contact_email, delivery_address, 
          estimated_delivery_date_from, estimated_delivery_date_to,
          shipping_document_url, notes, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'Pending')
         RETURNING *`,
        [
          orderId, shipmentData.warehouseId, shipmentData.shippingCompany,
          shipmentData.trackingNumber || null, shipmentData.deliveryContactName || null,
          shipmentData.deliveryContactPhone || null, shipmentData.deliveryContactEmail || null,
          shipmentData.deliveryAddress || null, 
          shipmentData.estimatedDeliveryDateFrom || null,
          shipmentData.estimatedDeliveryDateTo || null,
          shipmentData.shippingDocumentUrl || null, shipmentData.notes || null, userId
        ]
      );
      const shipment = shipmentResult.rows[0];

      // Add items to shipment
      if (shipmentData.items && shipmentData.items.length > 0) {
        for (const item of shipmentData.items) {
          await client.query(
            `INSERT INTO shipment_items (shipment_id, order_item_id, quantity)
             VALUES ($1, $2, $3)`,
            [shipment.id, item.orderItemId, item.quantity]
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Update shipment
  static async updateShipment(shipmentId, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      shippingCompany: 'shipping_company', trackingNumber: 'tracking_number',
      deliveryContactName: 'delivery_contact_name', deliveryContactPhone: 'delivery_contact_phone',
      deliveryContactEmail: 'delivery_contact_email', deliveryAddress: 'delivery_address',
      estimatedDeliveryDateFrom: 'estimated_delivery_date_from', 
      estimatedDeliveryDateTo: 'estimated_delivery_date_to',
      actualDeliveryDate: 'actual_delivery_date',
      shippingDocumentUrl: 'shipping_document_url', status: 'status', notes: 'notes'
    };

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(shipmentId);

    const result = await db.query(
      `UPDATE shipments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Mark order as shipped
  static async markShipped(id) {
    await db.query(
      `UPDATE orders SET status = 'Shipped', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    return this.findById(id);
  }

  // Get modification history for an order
  static async getModificationHistory(orderId) {
    const result = await db.query(
      `SELECT oml.*, c.name as commodity_name
       FROM order_modification_logs oml
       LEFT JOIN order_items oi ON oml.order_item_id = oi.id
       LEFT JOIN commodities c ON oi.commodity_id = c.id
       WHERE oml.order_id = $1
       ORDER BY oml.created_at DESC`,
      [orderId]
    );
    return result.rows;
  }

  // Get order statistics
  static async getStatistics(country = null) {
    let query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Submitted') as submitted,
        COUNT(*) FILTER (WHERE status = 'Forwarded to OSL') as forwarded,
        COUNT(*) FILTER (WHERE status = 'Approved') as approved,
        COUNT(*) FILTER (WHERE status = 'Partially Fulfilled') as partial,
        COUNT(*) FILTER (WHERE status = 'Shipped') as shipped,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed,
        COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
        COUNT(*) as total
      FROM orders
    `;

    if (country) {
      query += ` WHERE country = $1`;
      const result = await db.query(query, [country]);
      return result.rows[0];
    }

    const result = await db.query(query);
    return result.rows[0];
  }

  // Get intervention types
  static async getInterventionTypes() {
    const result = await db.query(
      'SELECT * FROM intervention_types WHERE is_active = true ORDER BY name'
    );
    return result.rows;
  }

  // ==================== DRAFT ORDER METHODS ====================

  // Save order as draft (create new or update existing)
  static async saveDraft({ 
    id, // null for new draft, existing ID to update
    country, 
    priority, 
    pateoRef, 
    pateoFile, 
    notes, 
    createdBy, 
    items = [],
    interventionType, 
    situationDate,
    deliveryContactName, 
    deliveryContactPhone, 
    deliveryContactEmail,
    deliveryAddress, 
    deliveryCity, 
    deliveryCountry, 
    preferredShippingMethod
  }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      let order;

      if (id) {
        // Update existing draft
        const existing = await client.query(
          'SELECT * FROM orders WHERE id = $1 AND status = $2',
          [id, 'Draft']
        );

        if (existing.rows.length === 0) {
          throw new Error('Draft not found or already submitted');
        }

        // Update the draft
        const updateResult = await client.query(
          `UPDATE orders SET 
            priority = $1,
            pateo_ref = $2,
            pateo_file = $3,
            notes = $4,
            intervention_type = $5,
            situation_date = $6,
            delivery_contact_name = $7,
            delivery_contact_phone = $8,
            delivery_contact_email = $9,
            delivery_address = $10,
            delivery_city = $11,
            delivery_country = $12,
            preferred_shipping_method = $13,
            draft_updated_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $14
          RETURNING *`,
          [
            priority || 'Medium',
            pateoRef || null,
            pateoFile || null,
            notes || null,
            interventionType || null,
            situationDate || null,
            deliveryContactName || null,
            deliveryContactPhone || null,
            deliveryContactEmail || null,
            deliveryAddress || null,
            deliveryCity || null,
            deliveryCountry || country,
            preferredShippingMethod || null,
            id
          ]
        );
        order = updateResult.rows[0];

        // Delete existing items and re-add
        await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
      } else {
        // Create new draft
        const orderNumber = this.generateOrderNumber();

        const orderResult = await client.query(
          `INSERT INTO orders (
            order_number, country, priority, pateo_ref, pateo_file, notes, created_by, status,
            intervention_type, situation_date,
            delivery_contact_name, delivery_contact_phone, delivery_contact_email,
            delivery_address, delivery_city, delivery_country, preferred_shipping_method,
            draft_updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draft', $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            orderNumber,
            country,
            priority || 'Medium',
            pateoRef || null,
            pateoFile || null,
            notes || null,
            createdBy,
            interventionType || null,
            situationDate || null,
            deliveryContactName || null,
            deliveryContactPhone || null,
            deliveryContactEmail || null,
            deliveryAddress || null,
            deliveryCity || null,
            deliveryCountry || country,
            preferredShippingMethod || null
          ]
        );
        order = orderResult.rows[0];
      }

      // Add items to draft
      for (const item of items) {
        if (item.commodityId && item.quantity > 0) {
          await client.query(
            `INSERT INTO order_items (order_id, commodity_id, quantity, unit_price, fulfillment_status)
             VALUES ($1, $2, $3, $4, 'Pending')`,
            [order.id, item.commodityId, item.quantity, item.unitPrice || 0]
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all drafts for a user/country
  static async getDrafts(country, userId) {
    const result = await db.query(
      `SELECT o.*, 
              u.name as created_by_name,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
              (SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) FROM order_items oi WHERE oi.order_id = o.id) as total_value
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.country = $1 AND o.status = 'Draft'
       ORDER BY COALESCE(o.draft_updated_at, o.created_at) DESC`,
      [country]
    );

    return result.rows.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      country: row.country,
      priority: row.priority,
      status: row.status,
      pateoRef: row.pateo_ref,
      pateoFile: row.pateo_file,
      notes: row.notes,
      interventionType: row.intervention_type,
      situationDate: row.situation_date,
      deliveryContactName: row.delivery_contact_name,
      deliveryContactPhone: row.delivery_contact_phone,
      deliveryContactEmail: row.delivery_contact_email,
      deliveryAddress: row.delivery_address,
      deliveryCity: row.delivery_city,
      deliveryCountry: row.delivery_country,
      preferredShippingMethod: row.preferred_shipping_method,
      itemCount: parseInt(row.item_count),
      totalValue: parseFloat(row.total_value),
      createdBy: row.created_by_name,
      createdAt: row.created_at,
      draftUpdatedAt: row.draft_updated_at,
      updatedAt: row.updated_at
    }));
  }

  // Get all drafts created by a specific user (for Lab team)
  static async getDraftsByUser(userId) {
    const result = await db.query(
      `SELECT o.*,
              u.name as created_by_name,
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
              (SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) FROM order_items oi WHERE oi.order_id = o.id) as total_value
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.created_by = $1 AND o.status = 'Draft'
       ORDER BY COALESCE(o.draft_updated_at, o.created_at) DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      country: row.country,
      priority: row.priority,
      status: row.status,
      pateoRef: row.pateo_ref,
      pateoFile: row.pateo_file,
      notes: row.notes,
      interventionType: row.intervention_type,
      situationDate: row.situation_date,
      deliveryContactName: row.delivery_contact_name,
      deliveryContactPhone: row.delivery_contact_phone,
      deliveryContactEmail: row.delivery_contact_email,
      deliveryAddress: row.delivery_address,
      deliveryCity: row.delivery_city,
      deliveryCountry: row.delivery_country,
      preferredShippingMethod: row.preferred_shipping_method,
      itemCount: parseInt(row.item_count),
      totalValue: parseFloat(row.total_value),
      createdBy: row.created_by_name,
      createdAt: row.created_at,
      draftUpdatedAt: row.draft_updated_at,
      updatedAt: row.updated_at
    }));
  }

  // Delete a draft order
  static async deleteDraft(id, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Verify it's a draft and belongs to user's country
      const draft = await client.query(
        `SELECT o.* FROM orders o 
         JOIN users u ON o.created_by = u.id
         WHERE o.id = $1 AND o.status = 'Draft'`,
        [id]
      );

      if (draft.rows.length === 0) {
        throw new Error('Draft not found or already submitted');
      }

      // Delete order items first (due to foreign key)
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
      
      // Delete the draft order
      await client.query('DELETE FROM orders WHERE id = $1', [id]);

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Submit a draft order (change status from Draft to Submitted)
  static async submitDraft(id, { pateoRef, pateoFile, submittedByName }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Verify it's a draft
      const draft = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND status = $2',
        [id, 'Draft']
      );

      if (draft.rows.length === 0) {
        throw new Error('Draft not found or already submitted');
      }

      const draftOrder = draft.rows[0];

      // Verify intervention type is set
      if (!draftOrder.intervention_type) {
        throw new Error('Intervention type is required to submit the order');
      }

      // Verify required fields for submission (pateoFile is optional)
      if (!pateoRef) {
        throw new Error('PATEO reference is required to submit the order');
      }

      // Verify there are items
      const itemsCount = await client.query(
        'SELECT COUNT(*) as count FROM order_items WHERE order_id = $1',
        [id]
      );

      if (parseInt(itemsCount.rows[0].count) === 0) {
        throw new Error('Cannot submit an order without items');
      }

      // Update the order status to Submitted with submitted_by_name
      await client.query(
        `UPDATE orders SET 
          status = 'Submitted',
          pateo_ref = $1,
          pateo_file = $2,
          submitted_by_name = $3,
          draft_updated_at = NULL,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [pateoRef, pateoFile || null, submittedByName || null, id]
      );

      await client.query('COMMIT');
      return this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get draft by ID (for editing)
  static async getDraftById(id) {
    const draft = await this.findById(id);
    if (!draft || draft.status !== 'Draft') {
      return null;
    }
    return draft;
  }

  // ==================== WORKFLOW STAGE METHODS ====================

  // Confirm payment
  // Confirm PATEO verification
  static async confirmPateo(orderId, { confirmedBy, confirmedByName, verificationNotes, budgetVerified }) {
    await db.query(
      `UPDATE orders SET 
        pateo_confirmed = true,
        pateo_confirmed_at = CURRENT_TIMESTAMP,
        pateo_confirmed_by = $2,
        pateo_confirmed_by_name = $3,
        pateo_verification_notes = $4,
        pateo_budget_verified = $5,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, confirmedBy, confirmedByName || null, verificationNotes || null, budgetVerified || false]
    );
    return this.findById(orderId);
  }

  // Confirm payment
  static async confirmPayment(orderId, { confirmedBy, paymentReference, paymentNotes }) {
    await db.query(
      `UPDATE orders SET 
        payment_confirmed = true,
        payment_confirmed_at = CURRENT_TIMESTAMP,
        payment_confirmed_by = $2,
        payment_reference = $3,
        payment_notes = $4,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, confirmedBy, paymentReference || null, paymentNotes || null]
    );
    return this.findById(orderId);
  }

  // Confirm contact info
  static async confirmContact(orderId, confirmedBy, confirmedByName) {
    await db.query(
      `UPDATE orders SET 
        contact_confirmed = true,
        contact_confirmed_at = CURRENT_TIMESTAMP,
        contact_confirmed_by = $2,
        contact_confirmed_by_name = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, confirmedBy, confirmedByName || null]
    );
    return this.findById(orderId);
  }

  // Confirm fulfillment
  static async confirmFulfillment(orderId, confirmedBy, confirmedByName) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Update order
      await client.query(
        `UPDATE orders SET 
          fulfillment_confirmed = true,
          fulfillment_confirmed_at = CURRENT_TIMESTAMP,
          fulfillment_confirmed_by = $2,
          fulfillment_confirmed_by_name = $3,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId, confirmedBy, confirmedByName || null]
      );
      
      // Initialize packaging checklist from order items
      const itemsResult = await client.query(
        `SELECT id, quantity, fulfilled_quantity FROM order_items WHERE order_id = $1 AND (deleted IS NULL OR deleted = FALSE)`,
        [orderId]
      );
      
      for (const item of itemsResult.rows) {
        await client.query(
          `INSERT INTO order_item_packaging (order_id, order_item_id, quantity_packed, quantity_found)
           VALUES ($1, $2, 0, 0)
           ON CONFLICT (order_id, order_item_id) DO NOTHING`,
          [orderId, item.id]
        );
      }
      
      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get packaging checklist
  static async getPackagingChecklist(orderId) {
    const result = await db.query(
      `SELECT 
        oip.id,
        oip.order_item_id,
        oip.quantity_packed,
        oip.quantity_found,
        oip.is_verified,
        oip.verified_at,
        oip.notes,
        oi.quantity as quantity_requested,
        oi.fulfilled_quantity,
        c.name as commodity_name,
        c.unit as commodity_unit
       FROM order_item_packaging oip
       JOIN order_items oi ON oip.order_item_id = oi.id
       JOIN commodities c ON oi.commodity_id = c.id
       WHERE oip.order_id = $1
       ORDER BY c.name`,
      [orderId]
    );
    return result.rows;
  }

  // Update packaging checklist
  static async updatePackaging(orderId, items, userId) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      for (const item of items) {
        await client.query(
          `UPDATE order_item_packaging SET
            quantity_packed = $3,
            quantity_found = $4,
            is_verified = $5,
            verified_at = CASE WHEN $5 = true THEN CURRENT_TIMESTAMP ELSE verified_at END,
            verified_by = CASE WHEN $5 = true THEN $6 ELSE verified_by END,
            notes = $7,
            updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $1 AND order_item_id = $2`,
          [orderId, item.orderItemId, item.quantityPacked || 0, item.quantityFound || 0, 
           item.isVerified || false, userId, item.notes || null]
        );
      }
      
      await client.query('COMMIT');
      return this.getPackagingChecklist(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Confirm packaging complete
  static async confirmPackaging(orderId, confirmedBy, confirmedByName) {
    // Check all items are verified
    const result = await db.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified
       FROM order_item_packaging WHERE order_id = $1`,
      [orderId]
    );
    
    const { total, verified } = result.rows[0];
    if (parseInt(total) > 0 && parseInt(verified) < parseInt(total)) {
      throw new Error('All items must be verified before confirming packaging');
    }
    
    await db.query(
      `UPDATE orders SET 
        packaging_confirmed = true,
        packaging_confirmed_at = CURRENT_TIMESTAMP,
        packaging_confirmed_by = $2,
        packaging_confirmed_by_name = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, confirmedBy, confirmedByName || null]
    );
    return this.findById(orderId);
  }

  // Book shipping
  static async bookShipping(orderId, bookedBy, bookedByName) {
    await db.query(
      `UPDATE orders SET 
        shipping_booked = true,
        shipping_booked_at = CURRENT_TIMESTAMP,
        shipping_booked_by = $2,
        shipping_booked_by_name = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, bookedBy, bookedByName || null]
    );
    return this.findById(orderId);
  }

  // Confirm shipping (items dispatched)
  static async confirmShipping(orderId, { 
    confirmedBy,
    confirmedByName,
    actualShipDate, 
    shippingCompany, 
    trackingNumber, 
    carrierContact,
    carrierPhone,
    estimatedDeliveryFrom,
    estimatedDeliveryTo,
    shippingNotes,
    shippingCost,
    shippingWeight,
    shippingPackages
  }) {
    await db.query(
      `UPDATE orders SET 
        shipping_confirmed = true,
        shipping_confirmed_at = CURRENT_TIMESTAMP,
        shipping_confirmed_by = $2,
        shipping_confirmed_by_name = $3,
        actual_ship_date = $4,
        shipping_company = $5,
        shipping_tracking_number = $6,
        shipping_carrier_contact = $7,
        shipping_carrier_phone = $8,
        estimated_delivery_from = $9,
        estimated_delivery_to = $10,
        shipping_notes = $11,
        shipping_cost = $12,
        shipping_weight_kg = $13,
        shipping_packages = $14,
        status = 'Shipped',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        orderId, 
        confirmedBy || null,
        confirmedByName || null,
        actualShipDate || new Date(),
        shippingCompany || null,
        trackingNumber || null,
        carrierContact || null,
        carrierPhone || null,
        estimatedDeliveryFrom || null,
        estimatedDeliveryTo || null,
        shippingNotes || null,
        shippingCost || null,
        shippingWeight || null,
        shippingPackages || 1
      ]
    );
    return this.findById(orderId);
  }

  // Carrier confirms delivery
  static async confirmCarrierDelivery(orderId, { confirmedBy, confirmedByName, notes }) {
    await db.query(
      `UPDATE orders SET 
        carrier_delivery_confirmed = true,
        carrier_delivery_confirmed_at = CURRENT_TIMESTAMP,
        carrier_delivery_confirmed_by = $2,
        carrier_delivery_confirmed_by_name = $3,
        carrier_delivery_notes = $4,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, confirmedBy || null, confirmedByName || null, notes || null]
    );
    return this.findById(orderId);
  }

  // Country confirms receipt
  static async confirmCountryReceipt(orderId, { confirmedBy, confirmedByName, notes }) {
    await db.query(
      `UPDATE orders SET 
        country_receipt_confirmed = true,
        country_receipt_confirmed_at = CURRENT_TIMESTAMP,
        country_receipt_confirmed_by = $2,
        country_receipt_confirmed_by_name = $3,
        country_receipt_notes = $4,
        status = 'Completed',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, confirmedBy, confirmedByName || null, notes || null]
    );
    return this.findById(orderId);
  }

  // Validate items received by country
  static async validateItemsReceived(orderId, items, validatedBy, validatedByName) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      for (const item of items) {
        await client.query(
          `UPDATE order_items SET 
            quantity_received = $1,
            received_validated = TRUE,
            received_notes = $2
           WHERE id = $3 AND order_id = $4`,
          [item.quantityReceived, item.notes || null, item.itemId, orderId]
        );
      }
      
      await client.query(
        `UPDATE orders SET 
          items_validated_by_country = TRUE,
          items_validated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );
      
      await client.query('COMMIT');
      return this.findById(orderId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Submit feedback
  static async submitFeedback(orderId, data) {
    const result = await db.query(
      `INSERT INTO order_feedback (
        order_id, submitted_by, order_accuracy, timeliness, 
        condition_quality, communication, customer_effort, 
        overall_satisfaction, comments
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (order_id) DO UPDATE SET
        order_accuracy = $3,
        timeliness = $4,
        condition_quality = $5,
        communication = $6,
        customer_effort = $7,
        overall_satisfaction = $8,
        comments = $9
       RETURNING *`,
      [
        orderId, data.submittedBy, data.orderAccuracy, data.timeliness,
        data.conditionQuality, data.communication, data.customerEffort,
        data.overallSatisfaction, data.comments
      ]
    );
    return result.rows[0];
  }

  // Get feedback
  static async getFeedback(orderId) {
    const result = await db.query(
      `SELECT f.*, u.name as submitted_by_name
       FROM order_feedback f
       JOIN users u ON f.submitted_by = u.id
       WHERE f.order_id = $1`,
      [orderId]
    );
    return result.rows[0] || null;
  }

  // Find orders for deletion (preview)
  static async findOrdersForDeletion(country, dateFrom, dateTo, status) {
    let query = `
      SELECT id, order_number, status, created_at, country
      FROM orders
      WHERE country = $1
    `;
    const params = [country];

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND created_at >= $${params.length}`;
    }

    if (dateTo) {
      params.push(dateTo);
      query += ` AND created_at <= $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  // Delete orders by country (and optional date range and status)
  static async deleteOrdersByCountry(country, dateFrom, dateTo, status) {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Build WHERE clause
      let whereClause = 'WHERE country = $1';
      const params = [country];

      if (dateFrom) {
        params.push(dateFrom);
        whereClause += ` AND created_at >= $${params.length}`;
      }

      if (dateTo) {
        params.push(dateTo);
        whereClause += ` AND created_at <= $${params.length}`;
      }

      if (status) {
        params.push(status);
        whereClause += ` AND status = $${params.length}`;
      }

      // Get order IDs first
      const orderIdsResult = await client.query(
        `SELECT id FROM orders ${whereClause}`,
        params
      );
      const orderIds = orderIdsResult.rows.map(row => row.id);

      if (orderIds.length === 0) {
        await client.query('ROLLBACK');
        return 0;
      }

      // Delete related data in correct order
      // 1. Delete order feedback
      await client.query(
        `DELETE FROM order_feedback WHERE order_id = ANY($1)`,
        [orderIds]
      );

      // 2. Delete order messages
      await client.query(
        `DELETE FROM order_messages WHERE order_id = ANY($1)`,
        [orderIds]
      );

      // 3. Delete order item fulfillments
      await client.query(
        `DELETE FROM order_item_fulfillments WHERE order_item_id IN (
          SELECT id FROM order_items WHERE order_id = ANY($1)
        )`,
        [orderIds]
      );

      // 4. Delete order modification logs
      await client.query(
        `DELETE FROM order_modification_logs WHERE order_id = ANY($1)`,
        [orderIds]
      );

      // 5. Delete order items
      await client.query(
        `DELETE FROM order_items WHERE order_id = ANY($1)`,
        [orderIds]
      );

      // 6. Finally, delete orders
      const deleteResult = await client.query(
        `DELETE FROM orders ${whereClause}`,
        params
      );

      await client.query('COMMIT');
      return deleteResult.rowCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find all orders for deletion (preview all)
  static async findAllOrdersForDeletion() {
    const result = await db.query(`
      SELECT id, order_number, status, created_at, country
      FROM orders
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // Delete all orders (complete database clear)
  static async deleteAllOrders() {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get all order IDs first
      const orderIdsResult = await client.query('SELECT id FROM orders');
      const orderIds = orderIdsResult.rows.map(row => row.id);

      if (orderIds.length === 0) {
        await client.query('ROLLBACK');
        return 0;
      }

      // Delete related data in correct order
      // 1. Delete order feedback
      await client.query('DELETE FROM order_feedback WHERE order_id = ANY($1)', [orderIds]);

      // 2. Delete order messages
      await client.query('DELETE FROM order_messages WHERE order_id = ANY($1)', [orderIds]);

      // 3. Delete shipment items (must delete before shipments)
      await client.query(`
        DELETE FROM shipment_items WHERE shipment_id IN (
          SELECT id FROM shipments WHERE order_id = ANY($1)
        )
      `, [orderIds]);

      // 4. Delete shipments
      await client.query('DELETE FROM shipments WHERE order_id = ANY($1)', [orderIds]);

      // 5. Delete order item packaging
      await client.query('DELETE FROM order_item_packaging WHERE order_id = ANY($1)', [orderIds]);

      // 6. Delete order item fulfillments
      await client.query(`
        DELETE FROM order_item_fulfillments WHERE order_item_id IN (
          SELECT id FROM order_items WHERE order_id = ANY($1)
        )
      `, [orderIds]);

      // 7. Delete order modification logs
      await client.query('DELETE FROM order_modification_logs WHERE order_id = ANY($1)', [orderIds]);

      // 8. Delete order items
      await client.query('DELETE FROM order_items WHERE order_id = ANY($1)', [orderIds]);

      // 9. Finally, delete all orders
      const deleteResult = await client.query('DELETE FROM orders');

      await client.query('COMMIT');
      return deleteResult.rowCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Order;
