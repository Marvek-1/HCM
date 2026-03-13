const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
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

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
];

// Registration validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('role')
    .isIn(['Country Office', 'Laboratory Team', 'OSL Team'])
    .withMessage('Invalid role specified.'),
  body('country')
    .if(body('role').equals('Country Office'))
    .notEmpty()
    .withMessage('Country is required for Country Office role.')
];

// Public routes
router.post('/login', loginValidation, validate, authController.login);
router.post('/register', registerValidation, validate, authController.register);
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail()
], validate, authController.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.')
], validate, authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.getCurrentUser);
router.get('/sessions', authenticate, authController.getActiveSessions);
router.get('/login-history', authenticate, authController.getLoginHistory);
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.')
], validate, authController.changePassword);

// Admin routes (OSL can view login monitoring)
router.get('/monitoring', 
  authenticate, 
  authorize('OSL Team'), 
  authController.getLoginMonitoring
);

// OSL Admin Levels:
// Level 0: Super OSL Admin - Full privileges
// Level 1: OSL Admin - All privileges EXCEPT adjusting warehouse order fulfillment quantities
// Level 2: OSL Viewer - View-only access to approved orders for packaging and distribution

// Check if OSL user has required level for an action
const authorizeOSLLevel = (maxAllowedLevel, action = 'perform this action') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated.' 
      });
    }

    // Only applies to OSL Team users
    if (req.user.role !== 'OSL Team') {
      return next();
    }

    const userLevel = req.user.osl_admin_level ?? 0; // Default to 0 (full access) if not set

    if (userLevel > maxAllowedLevel) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Your OSL access level (${getOSLLevelName(userLevel)}) cannot ${action}.`
      });
    }

    next();
  };
};

// Helper to get human-readable level name
const getOSLLevelName = (level) => {
  switch (level) {
    case 0: return 'Super Admin';
    case 1: return 'Admin';
    case 2: return 'Viewer';
    default: return 'Unknown';
  }
};

module.exports = router;
