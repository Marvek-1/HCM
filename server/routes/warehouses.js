const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const warehouseController = require('../controllers/warehouseController');
const { authenticate, authorize } = require('../middleware/auth');

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

// Warehouse validation
const warehouseValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Warehouse name is required.')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters.'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Warehouse code is required.')
    .isLength({ min: 2, max: 10 })
    .withMessage('Code must be between 2-10 characters.')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must contain only uppercase letters and numbers.'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Location must not exceed 500 characters.'),
  body('capacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Capacity must be a positive number.'),
  body('contactName')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Contact name must not exceed 255 characters.'),
  body('contactPhone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Contact phone must not exceed 50 characters.'),
  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format.')
];

// All routes require authentication and Super Admin role
router.use(authenticate);
router.use(authorize('Super Admin'));

// Get all warehouses
router.get('/', warehouseController.getAll);

// Get warehouse by ID with inventory
router.get('/:id', warehouseController.getById);

// Create warehouse
router.post('/',
  warehouseValidation,
  validate,
  warehouseController.create
);

// Update warehouse
router.put('/:id',
  warehouseValidation,
  validate,
  warehouseController.update
);

// Toggle warehouse active status
router.patch('/:id/toggle-status',
  warehouseController.toggleStatus
);

// Get warehouse stock/inventory
router.get('/:id/stock',
  warehouseController.getStock
);

// Update stock for a commodity in warehouse
router.patch('/:id/stock',
  body('commodityId')
    .isInt({ min: 1 })
    .withMessage('Valid commodity ID is required.'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer.'),
  validate,
  warehouseController.updateStock
);

module.exports = router;
