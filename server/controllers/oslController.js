const { Supplier, PurchaseOrder, StockMovement, Order, Warehouse } = require('../models');

// ==================== SUPPLIERS ====================

exports.getSuppliers = async (req, res) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await Supplier.findAll({
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers.' });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    const stats = await Supplier.getStats(supplier.id);
    res.json({ success: true, data: { supplier, stats } });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier.' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, code, contactName, contactEmail, contactPhone, address, country, leadTimeDays, paymentTerms, notes } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required.' });
    }

    const existing = await Supplier.findByCode(code);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Supplier code already exists.' });
    }

    const supplier = await Supplier.create(
      { name, code, contactName, contactEmail, contactPhone, address, country, leadTimeDays, paymentTerms, notes },
      req.user.id
    );
    res.status(201).json({ success: true, message: 'Supplier created.', data: { supplier } });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier.' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.update(req.params.id, req.body);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    res.json({ success: true, message: 'Supplier updated.', data: { supplier } });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: 'Failed to update supplier.' });
  }
};

// ==================== PURCHASE ORDERS ====================

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { supplierId, warehouseId, status, page, limit } = req.query;
    const result = await PurchaseOrder.findAll({
      supplierId: supplierId ? parseInt(supplierId) : undefined,
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase orders.' });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }
    res.json({ success: true, data: { purchaseOrder: po } });
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase order.' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, warehouseId, orderDate, expectedDeliveryDate, shippingMethod, notes, items } = req.body;
    
    if (!supplierId || !warehouseId || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Supplier, warehouse, and at least one item are required.' 
      });
    }

    const po = await PurchaseOrder.create(
      { supplierId, warehouseId, orderDate, expectedDeliveryDate, shippingMethod, notes, items },
      req.user.id
    );
    res.status(201).json({ success: true, message: 'Purchase order created.', data: { purchaseOrder: po } });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order.' });
  }
};

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Draft', 'Submitted', 'Confirmed', 'Shipped', 'Partially Received', 'Received', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const po = await PurchaseOrder.updateStatus(req.params.id, status, req.user.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }
    res.json({ success: true, message: 'Status updated.', data: { purchaseOrder: po } });
  } catch (error) {
    console.error('Update PO status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { items, warehouseId } = req.body;
    
    if (!items || items.length === 0 || !warehouseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Items and warehouse are required.' 
      });
    }

    const po = await PurchaseOrder.receiveItems(req.params.id, items, warehouseId, req.user.id);
    res.json({ success: true, message: 'Items received.', data: { purchaseOrder: po } });
  } catch (error) {
    console.error('Receive PO items error:', error);
    res.status(500).json({ success: false, message: 'Failed to receive items.' });
  }
};

// ==================== STOCK MOVEMENTS ====================

exports.getStockMovements = async (req, res) => {
  try {
    const { warehouseId, commodityId, movementType, startDate, endDate, page, limit } = req.query;
    const result = await StockMovement.findAll({
      warehouseId: warehouseId ? parseInt(warehouseId) : undefined,
      commodityId: commodityId ? parseInt(commodityId) : undefined,
      movementType,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stock movements.' });
  }
};

exports.createStockMovement = async (req, res) => {
  try {
    const { movementType, warehouseId, toWarehouseId, commodityId, quantity, reason, notes, batchNumber } = req.body;
    
    if (!movementType || !warehouseId || !commodityId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movement type, warehouse, commodity, and quantity are required.' 
      });
    }

    if (movementType === 'Transfer' && !toWarehouseId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Destination warehouse is required for transfers.' 
      });
    }

    const movement = await StockMovement.create(
      { movementType, warehouseId, toWarehouseId, commodityId, quantity, reason, notes, batchNumber },
      req.user.id
    );
    res.status(201).json({ success: true, message: 'Stock movement recorded.', data: { movement } });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ success: false, message: 'Failed to record stock movement.' });
  }
};

// ==================== OUTBOUND / SHIPMENTS ====================

exports.getOutboundShipments = async (req, res) => {
  try {
    const { status, warehouseId, page, limit } = req.query;
    
    // Get shipments with order details
    const db = require('../config/database');
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      whereClause += ` AND s.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (warehouseId) {
      whereClause += ` AND s.warehouse_id = $${paramCount}`;
      params.push(warehouseId);
      paramCount++;
    }

    const offset = ((parseInt(page) || 1) - 1) * (parseInt(limit) || 20);
    
    const countResult = await db.query(`SELECT COUNT(*) FROM shipments s ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT s.*, 
              w.name as warehouse_name, w.code as warehouse_code,
              o.order_number, o.country as destination_country,
              u.name as created_by_name
       FROM shipments s
       LEFT JOIN warehouses w ON s.warehouse_id = w.id
       LEFT JOIN orders o ON s.order_id = o.id
       LEFT JOIN users u ON s.created_by = u.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit) || 20, offset]
    );

    res.json({
      success: true,
      data: {
        shipments: result.rows.map(s => ({
          id: s.id,
          warehouseId: s.warehouse_id,
          warehouseName: s.warehouse_name,
          warehouseCode: s.warehouse_code,
          orderId: s.order_id,
          orderNumber: s.order_number,
          destinationCountry: s.destination_country,
          shippingCompany: s.shipping_company,
          trackingNumber: s.tracking_number,
          status: s.status,
          estimatedDeliveryDateFrom: s.estimated_delivery_date_from,
          estimatedDeliveryDateTo: s.estimated_delivery_date_to,
          actualDeliveryDate: s.actual_delivery_date,
          deliveryContactName: s.delivery_contact_name,
          deliveryAddress: s.delivery_address,
          createdBy: s.created_by_name,
          createdAt: s.created_at
        })),
        pagination: {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          total,
          totalPages: Math.ceil(total / (parseInt(limit) || 20))
        }
      }
    });
  } catch (error) {
    console.error('Get outbound shipments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shipments.' });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    const { status, actualDeliveryDate, trackingNumber } = req.body;
    const order = await Order.updateShipment(req.params.id, { status, actualDeliveryDate, trackingNumber });
    res.json({ success: true, message: 'Shipment updated.', data: { shipment: order } });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update shipment.' });
  }
};

// ==================== DASHBOARD STATS ====================

exports.getOSLDashboard = async (req, res) => {
  try {
    const [procurementStats, lowStockAlerts, outboundSummary, movementSummary] = await Promise.all([
      PurchaseOrder.getStats(),
      StockMovement.getLowStockAlerts(100),
      StockMovement.getOutboundSummary({ startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }),
      StockMovement.getSummary(null, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    ]);

    // Get warehouse inventory summary
    const db = require('../config/database');
    const inventorySummary = await db.query(`
      SELECT 
        w.id, w.name, w.code,
        COUNT(DISTINCT wi.commodity_id) as total_products,
        COALESCE(SUM(wi.quantity), 0) as total_stock,
        COUNT(CASE WHEN wi.quantity < 100 THEN 1 END) as low_stock_items
      FROM warehouses w
      LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id
      WHERE w.is_active = true
      GROUP BY w.id, w.name, w.code
    `);

    res.json({
      success: true,
      data: {
        procurement: procurementStats,
        lowStockAlerts,
        outbound: outboundSummary,
        movements: movementSummary,
        warehouses: inventorySummary.rows
      }
    });
  } catch (error) {
    console.error('Get OSL dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
};
