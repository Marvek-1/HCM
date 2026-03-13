const express = require('express');
const router = express.Router();
const oslController = require('../controllers/oslController');
const { authenticate, authorize, authorizeOSLLevel } = require('../middleware/auth');

// All routes require authentication and OSL Team role
router.use(authenticate);
router.use(authorize('OSL Team', 'Super Admin'));

// Dashboard - All levels can view
router.get('/dashboard', oslController.getOSLDashboard);

// Suppliers - Level 0-1 can manage
router.get('/suppliers', oslController.getSuppliers);
router.get('/suppliers/:id', oslController.getSupplier);
router.post('/suppliers', authorizeOSLLevel(1, 'create suppliers'), oslController.createSupplier);
router.put('/suppliers/:id', authorizeOSLLevel(1, 'update suppliers'), oslController.updateSupplier);

// Purchase Orders - Level 0-1 can manage
router.get('/purchase-orders', oslController.getPurchaseOrders);
router.get('/purchase-orders/:id', oslController.getPurchaseOrder);
router.post('/purchase-orders', authorizeOSLLevel(1, 'create purchase orders'), oslController.createPurchaseOrder);
router.put('/purchase-orders/:id/status', authorizeOSLLevel(1, 'update purchase order status'), oslController.updatePurchaseOrderStatus);
router.post('/purchase-orders/:id/receive', authorizeOSLLevel(1, 'receive purchase orders'), oslController.receivePurchaseOrder);

// Stock Movements - Level 0-1 can create, all can view
router.get('/stock-movements', oslController.getStockMovements);
router.post('/stock-movements', authorizeOSLLevel(1, 'create stock movements'), oslController.createStockMovement);

// Outbound / Shipments - Level 0-1 can update status, all can view
router.get('/outbound', oslController.getOutboundShipments);
router.put('/outbound/:id', authorizeOSLLevel(1, 'update shipment status'), oslController.updateShipmentStatus);

module.exports = router;
