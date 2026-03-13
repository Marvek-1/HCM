const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, authorize, authorizeOSLLevel } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array()
    });
  }
  next();
};

// Create order validation
const createOrderValidation = [
  body('priority')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High.'),
  body('pateoRef')
    .trim()
    .notEmpty()
    .withMessage('PATEO reference is required.')
    .isLength({ max: 100 })
    .withMessage('PATEO reference must not exceed 100 characters.'),
  body('pateoFile')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('PATEO file URL must not exceed 500 characters.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required.'),
  body('items.*.commodityId')
    .isInt({ min: 1 })
    .withMessage('Valid commodity ID is required for each item.'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1.'),
  body('interventionType')
    .trim()
    .notEmpty()
    .withMessage('Intervention type is required.')
    .isLength({ max: 100 }),
  body('situationStartDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format.')
];

// All routes require authentication
router.use(authenticate);

// ==================== DRAFT ORDER ROUTES (Country Office only) ====================

// Get all drafts for the user's country / created by user
router.get('/drafts',
  authorize('Country Office', 'Laboratory Team'),
  orderController.getDrafts
);

// Get a specific draft by ID
router.get('/drafts/:id',
  authorize('Country Office', 'Laboratory Team'),
  orderController.getDraftById
);

// Save draft (create new or update existing)
router.post('/drafts',
  authorize('Country Office', 'Laboratory Team'),
  orderController.saveDraft
);

// Update existing draft
router.put('/drafts/:id',
  authorize('Country Office', 'Laboratory Team'),
  orderController.saveDraft
);

// Delete a draft
router.delete('/drafts/:id',
  authorize('Country Office', 'Laboratory Team'),
  orderController.deleteDraft
);

// Submit a draft (convert to submitted order)
router.post('/drafts/:id/submit',
  authorize('Country Office', 'Laboratory Team'),
  body('pateoRef').trim().notEmpty().withMessage('PATEO reference is required.'),
  body('pateoFile').optional({ nullable: true, checkFalsy: true }).trim(),
  validate,
  orderController.submitDraft
);

// ==================== REGULAR ORDER ROUTES ====================

// Get orders (filtered by role) - All OSL levels can view
router.get('/', orderController.getOrders);

// Get order statistics
router.get('/statistics', orderController.getStatistics);

// Get intervention types
router.get('/intervention-types', orderController.getInterventionTypes);

// Get single order - All OSL levels can view
router.get('/:id', orderController.getById);

// Get quantity modification history
router.get('/:id/modifications', orderController.getModificationHistory);

// Create order (Country Office or Laboratory Team)
router.post('/',
  authorize('Country Office', 'Laboratory Team'),
  createOrderValidation,
  validate,
  orderController.create
);

// Update order item (Lab Team can edit submitted, OSL Level 0-1 can edit forwarded)
// OSL Level 2 cannot edit items
router.put('/:orderId/items/:itemId',
  authorize('Laboratory Team', 'OSL Team'),
  authorizeOSLLevel(1, 'modify order items'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  validate,
  orderController.updateItem
);

// Add item to order (Lab Team only)
router.post('/:orderId/items',
  authorize('Laboratory Team'),
  body('commodityId').isInt({ min: 1 }).withMessage('Valid commodity ID is required.'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  validate,
  orderController.addItem
);

// Remove item from order (Lab Team only)
router.delete('/:orderId/items/:itemId',
  authorize('Laboratory Team'),
  orderController.removeItem
);

// Delete item from order with justification (Lab Team or OSL Level 0)
router.post('/:orderId/items/:itemId/delete',
  authorize('Laboratory Team', 'OSL Team'),
  body('reason').trim().notEmpty().withMessage('Deletion reason is required.'),
  validate,
  orderController.deleteItem
);

// Forward order to OSL (Laboratory Team only)
router.post('/:id/forward',
  authorize('Laboratory Team'),
  orderController.forwardToOSL
);

// Request amendment - Lab returns order to Country for adjustments (Laboratory Team only)
router.post('/:id/request-amendment',
  authorize('Laboratory Team'),
  body('notes').trim().notEmpty().withMessage('Amendment notes are required.'),
  validate,
  orderController.requestAmendment
);

// Resubmit order after amendment (Country Office only)
router.post('/:id/resubmit',
  authorize('Country Office'),
  orderController.resubmitAfterAmendment
);

// Cancel order (Country Office only, before shipping booked)
router.post('/:id/cancel',
  authorize('Country Office'),
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required.'),
  validate,
  orderController.cancelOrder
);

// Validate items received (Country Office only)
router.post('/:id/validate-items',
  authorize('Country Office'),
  body('items').isArray({ min: 1 }).withMessage('Items data is required.'),
  validate,
  orderController.validateItemsReceived
);

// Reject order (Laboratory Team or OSL Level 0-1) - deprecated, use request-amendment
router.post('/:id/reject',
  authorize('Laboratory Team', 'OSL Team'),
  authorizeOSLLevel(1, 'reject orders'),
  orderController.reject
);

// Split fulfill item from multiple warehouses (OSL Level 0 only - adjusting fulfillment quantities)
router.post('/items/:itemId/split-fulfill',
  authorize('OSL Team'),
  authorizeOSLLevel(0, 'adjust warehouse fulfillment quantities'),
  body('fulfillments').isArray({ min: 1 }).withMessage('Fulfillment data is required.'),
  body('fulfillments.*.warehouseId').isInt({ min: 1 }).withMessage('Valid warehouse ID required.'),
  body('fulfillments.*.quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative.'),
  validate,
  orderController.splitFulfillItem
);

// Smart auto-fulfill order (OSL Level 0-1)
router.post('/:id/smart-fulfill',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'fulfill orders'),
  orderController.smartFulfillOrder
);

// Create shipment (OSL Level 0-1)
router.post('/:id/shipments',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'create shipments'),
  body('warehouseId').isInt({ min: 1 }).withMessage('Valid warehouse ID is required.'),
  body('shippingCompany').trim().notEmpty().withMessage('Shipping company is required.'),
  validate,
  orderController.createShipment
);

// Update shipment (OSL Level 0-1)
router.put('/shipments/:shipmentId',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'update shipments'),
  orderController.updateShipment
);

// Mark order as shipped (OSL Level 0-1)
router.post('/:id/ship',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'mark orders as shipped'),
  orderController.markShipped
);

// ==================== WORKFLOW STAGE ROUTES ====================

// Confirm PATEO verification (OSL Team)
router.post('/:id/confirm-pateo',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm PATEO'),
  orderController.confirmPateo
);

// Confirm payment (OSL Team)
router.post('/:id/confirm-payment',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm payment'),
  orderController.confirmPayment
);

// Confirm contact info (OSL Team)
router.post('/:id/confirm-contact',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm contact'),
  orderController.confirmContact
);

// Confirm fulfillment (OSL Team)
router.post('/:id/confirm-fulfillment',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm fulfillment'),
  orderController.confirmFulfillment
);

// Get packaging checklist
router.get('/:id/packaging',
  authorize('OSL Team'),
  orderController.getPackagingChecklist
);

// Update packaging checklist
router.put('/:id/packaging',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'update packaging'),
  orderController.updatePackaging
);

// Confirm packaging complete
router.post('/:id/confirm-packaging',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm packaging'),
  orderController.confirmPackaging
);

// Book shipping
router.post('/:id/book-shipping',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'book shipping'),
  orderController.bookShipping
);

// Confirm shipping (items dispatched)
router.post('/:id/confirm-shipping',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm shipping'),
  body('shippingCompany').trim().notEmpty().withMessage('Shipping company is required.'),
  body('trackingNumber').trim().notEmpty().withMessage('Tracking number is required.'),
  body('actualShipDate').notEmpty().withMessage('Ship date is required.'),
  body('estimatedDeliveryFrom').notEmpty().withMessage('ETA from date is required.'),
  body('estimatedDeliveryTo').notEmpty().withMessage('ETA to date is required.'),
  validate,
  orderController.confirmShipping
);

// Carrier confirms delivery
router.post('/:id/carrier-delivery',
  authorize('OSL Team'),
  authorizeOSLLevel(1, 'confirm carrier delivery'),
  orderController.confirmCarrierDelivery
);

// Country confirms receipt
router.post('/:id/confirm-receipt',
  authorize('Country Office'),
  orderController.confirmCountryReceipt
);

// Submit feedback (Country Office)
router.post('/:id/feedback',
  authorize('Country Office'),
  orderController.submitFeedback
);

// Get feedback
router.get('/:id/feedback',
  orderController.getFeedback
);

module.exports = router;
