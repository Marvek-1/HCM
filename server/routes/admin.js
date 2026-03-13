const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
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

// All routes require authentication
router.use(authenticate);

// ============================================
// USER PROFILE ROUTES (Available to all users)
// ============================================

// Get own profile
router.get('/profile', adminController.getProfile);

// Update own profile (name only)
router.put('/profile',
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters.'),
  validate,
  adminController.updateProfile
);

// Change own password
router.post('/profile/change-password',
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),
  validate,
  adminController.changePassword
);

// ============================================
// ADMIN ROUTES (Super Admin only)
// ============================================

// Get all users
router.get('/users',
  authorize('Super Admin'),
  adminController.getUsers
);

// Get user statistics
router.get('/stats',
  authorize('Super Admin'),
  adminController.getStats
);

// Get activity logs
router.get('/activity-logs',
  authorize('Super Admin'),
  adminController.getActivityLogs
);

// Get single user
router.get('/users/:id',
  authorize('Super Admin'),
  adminController.getUser
);

// Create new user
router.post('/users',
  authorize('Super Admin'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required.'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters.'),
  body('role')
    .isIn(['Country Office', 'Laboratory Team', 'OSL Team', 'Super Admin'])
    .withMessage('Invalid role.'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  validate,
  adminController.createUser
);

// Update user
router.put('/users/:id',
  authorize('Super Admin'),
  adminController.updateUser
);

// Reset user password
router.post('/users/:id/reset-password',
  authorize('Super Admin'),
  adminController.resetPassword
);

// Deactivate user
router.post('/users/:id/deactivate',
  authorize('Super Admin'),
  adminController.deactivateUser
);

// Activate user
router.post('/users/:id/activate',
  authorize('Super Admin'),
  adminController.activateUser
);

// Delete user (permanent deletion - requires password confirmation)
router.delete('/users/:id',
  authorize('Super Admin'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required.'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters.'),
  validate,
  adminController.deleteUser
);

// Preview order deletion
router.get('/orders/preview-deletion',
  authorize('Super Admin'),
  adminController.previewOrderDeletion
);

// Clear orders (delete order history)
router.post('/orders/clear',
  authorize('Super Admin'),
  body('country')
    .notEmpty()
    .withMessage('Country is required.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required for confirmation.'),
  body('reason')
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters.'),
  body('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom.'),
  body('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo.'),
  validate,
  adminController.clearOrders
);

module.exports = router;
