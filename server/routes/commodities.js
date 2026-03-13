const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const commodityController = require('../controllers/commodityController');
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

// Create/Update commodity validation
const commodityValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Commodity name is required.')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters.'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required.'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number.'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer.')
];

// All routes require authentication
router.use(authenticate);

// Get all commodities (all roles) - with pagination and search
router.get('/', commodityController.getAll);

// Get categories (all roles)
router.get('/categories', commodityController.getCategories);

// Create category (OSL only)
router.post('/categories', 
  authorize('OSL Team'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required.')
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters.'),
  validate,
  commodityController.createCategory
);

// Update category (OSL only)
router.put('/categories/:id', 
  authorize('OSL Team'),
  commodityController.updateCategory
);

// Delete category (OSL only)
router.delete('/categories/:id', 
  authorize('OSL Team'),
  commodityController.deleteCategory
);

// Get warehouses (all roles - for display purposes)
router.get('/warehouses', commodityController.getWarehouses);

// Get low stock commodities (OSL only)
router.get('/low-stock', 
  authorize('OSL Team'), 
  commodityController.getLowStock
);

// Get single commodity (all roles)
router.get('/:id', commodityController.getById);

// Create commodity (OSL only)
router.post('/', 
  authorize('OSL Team'),
  commodityValidation,
  validate,
  commodityController.create
);

// Update commodity (OSL only)
router.put('/:id', 
  authorize('OSL Team'),
  commodityController.update
);

// Update stock only (OSL only) - backward compatibility
router.patch('/:id/stock', 
  authorize('OSL Team'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer.'),
  validate,
  commodityController.updateStock
);

// Update warehouse stock (OSL only)
router.patch('/:id/warehouse-stock', 
  authorize('OSL Team'),
  body('warehouseId')
    .isInt({ min: 1 })
    .withMessage('Valid warehouse ID is required.'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer.'),
  validate,
  commodityController.updateWarehouseStock
);

// Delete commodity (OSL only)
router.delete('/:id', 
  authorize('OSL Team'),
  commodityController.delete
);

module.exports = router;
