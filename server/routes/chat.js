const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

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

// ==================== NOTIFICATION ROUTES ====================

// Get notifications for current user
router.get('/notifications', chatController.getNotifications);

// Get notification count for current user
router.get('/notifications/count', chatController.getNotificationCount);

// Mark all notifications as read
router.post('/notifications/read-all', chatController.markAllNotificationsRead);

// Mark a notification as read
router.post('/notifications/:notificationId/read', chatController.markNotificationRead);

// ==================== MESSAGE ROUTES ====================

// Get unread message count for current user
router.get('/unread', chatController.getUnreadCount);

// Get message counts for multiple orders (batch)
router.get('/counts/batch', chatController.getMessageCountsBatch);

// Get all messages for an order
router.get('/orders/:orderId', chatController.getMessages);

// Get message count for an order
router.get('/orders/:orderId/count', chatController.getMessageCount);

// Create a new message
router.post('/orders/:orderId',
  body('message').trim().notEmpty().withMessage('Message is required.'),
  validate,
  chatController.createMessage
);

// Mark messages as read for an order
router.post('/orders/:orderId/read', chatController.markAsRead);

// Update a message (user can only edit their own)
router.put('/messages/:messageId',
  body('message').trim().notEmpty().withMessage('Message is required.'),
  validate,
  chatController.updateMessage
);

// Delete a message
router.delete('/messages/:messageId', chatController.deleteMessage);

// Delete entire conversation (Super Admin only)
router.delete('/orders/:orderId/conversation', chatController.deleteConversation);

module.exports = router;
