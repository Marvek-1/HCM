const OrderMessage = require('../models/OrderMessage');
const Order = require('../models/Order');
const emailService = require('../services/emailService');

// Get message counts for multiple orders (batch)
exports.getMessageCountsBatch = async (req, res) => {
  try {
    const { orderIds } = req.query;
    
    if (!orderIds) {
      return res.json({ success: true, data: { counts: {} } });
    }
    
    const ids = orderIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      return res.json({ success: true, data: { counts: {} } });
    }
    
    const counts = await OrderMessage.getCountsForOrders(ids);
    
    res.json({ success: true, data: { counts } });
  } catch (error) {
    console.error('Get message counts batch error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get all messages for an order
exports.getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check access - Country Office can only see their own orders
    if (req.user.role === 'Country Office' && order.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const messages = await OrderMessage.findByOrderId(orderId);
    
    // Mark messages as read for this user
    await OrderMessage.markAsRead(req.user.id, orderId);
    
    // Also mark order notifications as read
    await OrderMessage.markOrderNotificationsRead(req.user.id, orderId);

    res.json({ success: true, data: { messages } });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check access - Country Office can only message on their own orders
    if (req.user.role === 'Country Office' && order.country !== req.user.country) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const newMessage = await OrderMessage.create({
      orderId: parseInt(orderId),
      userId: req.user.id,
      message: message.trim()
    });

    // Send email notifications to relevant users (async, don't await)
    setImmediate(async () => {
      try {
        const usersToNotify = await OrderMessage.getUsersToNotify(orderId, req.user.id);
        for (const user of usersToNotify) {
          await emailService.sendOrderMessageNotification(user, order, newMessage, req.user);
        }
      } catch (emailError) {
        console.error('Failed to send message notifications:', emailError);
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully.',
      data: { message: newMessage } 
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Update a message (user can only edit their own)
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Verify message exists and belongs to user
    const existingMessage = await OrderMessage.findById(messageId);
    if (!existingMessage) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (existingMessage.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own messages.' });
    }

    if (existingMessage.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted message.' });
    }

    const updatedMessage = await OrderMessage.update(messageId, req.user.id, message.trim());

    if (!updatedMessage) {
      return res.status(400).json({ success: false, message: 'Failed to update message.' });
    }

    res.json({ 
      success: true, 
      message: 'Message updated successfully.',
      data: { message: updatedMessage } 
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Delete a message (user can delete their own, Super Admin can delete any)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const existingMessage = await OrderMessage.findById(messageId);
    if (!existingMessage) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    if (existingMessage.isDeleted) {
      return res.status(400).json({ success: false, message: 'Message already deleted.' });
    }

    let deleted = false;
    
    if (req.user.role === 'Super Admin') {
      // Super Admin can delete any message
      deleted = await OrderMessage.adminDelete(messageId, req.user.id);
    } else if (existingMessage.userId === req.user.id) {
      // Users can delete their own messages
      deleted = await OrderMessage.delete(messageId, req.user.id);
    } else {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages.' });
    }

    if (!deleted) {
      return res.status(400).json({ success: false, message: 'Failed to delete message.' });
    }

    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Delete entire conversation (Super Admin only)
exports.deleteConversation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { hardDelete } = req.query;

    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only Super Admin can delete entire conversations.' });
    }

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    let deletedCount;
    if (hardDelete === 'true') {
      // Permanently delete all messages
      deletedCount = await OrderMessage.hardDeleteAllForOrder(orderId);
    } else {
      // Soft delete all messages
      deletedCount = await OrderMessage.deleteAllForOrder(orderId, req.user.id);
    }

    res.json({ 
      success: true, 
      message: `${deletedCount} message(s) deleted successfully.`,
      data: { deletedCount }
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get unread message count for current user
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await OrderMessage.getUnreadCount(req.user.id);
    const ordersWithUnread = await OrderMessage.getOrdersWithUnread(req.user.id);

    res.json({ 
      success: true, 
      data: { 
        unreadCount: count,
        ordersWithUnread
      } 
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Mark messages as read for an order
exports.markAsRead = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    await OrderMessage.markAsRead(req.user.id, orderId);
    
    res.json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get message count for an order
exports.getMessageCount = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const count = await OrderMessage.getCountForOrder(orderId);
    const unreadCount = await OrderMessage.getUnreadCountForOrder(req.user.id, orderId);
    
    res.json({ 
      success: true, 
      data: { 
        totalCount: count,
        unreadCount
      } 
    });
  } catch (error) {
    console.error('Get message count error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// ==================== NOTIFICATION ENDPOINTS ====================

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    
    const notifications = await OrderMessage.getNotifications(
      req.user.id, 
      parseInt(limit), 
      unreadOnly === 'true'
    );
    const unreadCount = await OrderMessage.getNotificationCount(req.user.id);
    
    res.json({ 
      success: true, 
      data: { 
        notifications,
        unreadCount
      } 
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Get notification count for current user
exports.getNotificationCount = async (req, res) => {
  try {
    const count = await OrderMessage.getNotificationCount(req.user.id);
    
    res.json({ 
      success: true, 
      data: { unreadCount: count } 
    });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Mark a notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const success = await OrderMessage.markNotificationRead(notificationId, req.user.id);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const count = await OrderMessage.markAllNotificationsRead(req.user.id);
    
    res.json({ 
      success: true, 
      message: `${count} notification(s) marked as read.`,
      data: { count }
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};
