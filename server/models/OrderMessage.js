const db = require('../config/database');

class OrderMessage {
  // Create a new message and generate notifications
  static async create({ orderId, userId, message }) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert the message
      const result = await client.query(
        `INSERT INTO order_messages (order_id, user_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [orderId, userId, message]
      );
      
      const newMessage = result.rows[0];
      
      // Get order details for notification
      const orderResult = await client.query(
        'SELECT order_number, created_by FROM orders WHERE id = $1',
        [orderId]
      );
      const order = orderResult.rows[0];
      
      // Get sender name
      const senderResult = await client.query(
        'SELECT name FROM users WHERE id = $1',
        [userId]
      );
      const senderName = senderResult.rows[0]?.name || 'Someone';
      
      // Get users to notify (within transaction)
      const usersResult = await client.query(
        `SELECT DISTINCT u.id, u.email, u.name, u.role
         FROM users u
         WHERE u.is_active = true
           AND u.id != $2
           AND (
             u.id IN (SELECT user_id FROM order_messages WHERE order_id = $1)
             OR u.role IN ('Laboratory Team', 'OSL Team', 'Super Admin')
             OR u.id = (SELECT created_by FROM orders WHERE id = $1)
           )`,
        [orderId, userId]
      );
      const usersToNotify = usersResult.rows;
      
      // Create notifications for relevant users
      for (const user of usersToNotify) {
        await client.query(
          `INSERT INTO user_notifications (user_id, type, reference_id, reference_type, title, message)
           VALUES ($1, 'order_message', $2, 'order', $3, $4)`,
          [
            user.id, 
            orderId, 
            `New message on ${order.order_number}`,
            `${senderName}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
          ]
        );
      }
      
      await client.query('COMMIT');
      return this.findById(newMessage.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find message by ID with user details
  static async findById(id) {
    const result = await db.query(
      `SELECT om.*, 
              u.name as user_name, 
              u.email as user_email, 
              u.role as user_role,
              del_u.name as deleted_by_name
       FROM order_messages om
       JOIN users u ON om.user_id = u.id
       LEFT JOIN users del_u ON om.deleted_by = del_u.id
       WHERE om.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userRole: row.user_role,
      message: row.is_deleted ? '[Message deleted]' : row.message,
      isEdited: row.is_edited,
      editedAt: row.edited_at,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
      deletedByName: row.deleted_by_name,
      createdAt: row.created_at
    };
  }

  // Get all messages for an order
  static async findByOrderId(orderId, includeDeleted = true) {
    const result = await db.query(
      `SELECT om.*, 
              u.name as user_name, 
              u.email as user_email, 
              u.role as user_role,
              del_u.name as deleted_by_name
       FROM order_messages om
       JOIN users u ON om.user_id = u.id
       LEFT JOIN users del_u ON om.deleted_by = del_u.id
       WHERE om.order_id = $1
       ORDER BY om.created_at ASC`,
      [orderId]
    );

    return result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      userRole: row.user_role,
      message: row.is_deleted ? '[Message deleted]' : row.message,
      isEdited: row.is_edited,
      editedAt: row.edited_at,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
      deletedByName: row.deleted_by_name,
      createdAt: row.created_at
    }));
  }

  // Update a message (user can only edit their own)
  static async update(id, userId, newMessage) {
    const result = await db.query(
      `UPDATE order_messages 
       SET message = $1, is_edited = true, edited_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND is_deleted = false
       RETURNING *`,
      [newMessage, id, userId]
    );
    
    if (result.rows.length === 0) return null;
    return this.findById(id);
  }

  // Soft delete a message (user can delete their own)
  static async delete(id, userId) {
    const result = await db.query(
      `UPDATE order_messages 
       SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, deleted_by = $2
       WHERE id = $1 AND user_id = $2 AND is_deleted = false
       RETURNING *`,
      [id, userId]
    );
    
    return result.rows.length > 0;
  }

  // Super Admin can delete any message
  static async adminDelete(id, adminUserId) {
    const result = await db.query(
      `UPDATE order_messages 
       SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, deleted_by = $2
       WHERE id = $1 AND is_deleted = false
       RETURNING *`,
      [id, adminUserId]
    );
    
    return result.rows.length > 0;
  }

  // Super Admin can delete entire conversation
  static async deleteAllForOrder(orderId, adminUserId) {
    const result = await db.query(
      `UPDATE order_messages 
       SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, deleted_by = $2
       WHERE order_id = $1 AND is_deleted = false
       RETURNING id`,
      [orderId, adminUserId]
    );
    
    return result.rows.length;
  }

  // Hard delete entire conversation (Super Admin only)
  static async hardDeleteAllForOrder(orderId) {
    const result = await db.query(
      `DELETE FROM order_messages WHERE order_id = $1 RETURNING id`,
      [orderId]
    );
    return result.rows.length;
  }

  // Get message count for an order
  static async getCountForOrder(orderId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM order_messages 
       WHERE order_id = $1 AND is_deleted = false`,
      [orderId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get message counts for multiple orders (batch)
  static async getCountsForOrders(orderIds) {
    if (!orderIds || orderIds.length === 0) {
      return {};
    }
    
    const result = await db.query(
      `SELECT order_id, COUNT(*) as count 
       FROM order_messages 
       WHERE order_id = ANY($1) AND is_deleted = false
       GROUP BY order_id`,
      [orderIds]
    );
    
    // Convert to object { orderId: count }
    const counts = {};
    result.rows.forEach(row => {
      counts[row.order_id] = parseInt(row.count);
    });
    
    return counts;
  }

  // Mark messages as read for a user on an order
  static async markAsRead(userId, orderId) {
    await db.query(
      `INSERT INTO message_read_status (user_id, order_id, last_read_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, order_id) 
       DO UPDATE SET last_read_at = CURRENT_TIMESTAMP`,
      [userId, orderId]
    );
  }

  // Get unread message count for a user across all orders
  static async getUnreadCount(userId) {
    const result = await db.query(
      `SELECT COUNT(DISTINCT om.id) as count
       FROM order_messages om
       LEFT JOIN message_read_status mrs ON om.order_id = mrs.order_id AND mrs.user_id = $1
       WHERE om.is_deleted = false
         AND om.user_id != $1
         AND (mrs.last_read_at IS NULL OR om.created_at > mrs.last_read_at)`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get unread count for a specific order
  static async getUnreadCountForOrder(userId, orderId) {
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM order_messages om
       LEFT JOIN message_read_status mrs ON om.order_id = mrs.order_id AND mrs.user_id = $1
       WHERE om.order_id = $2
         AND om.is_deleted = false
         AND om.user_id != $1
         AND (mrs.last_read_at IS NULL OR om.created_at > mrs.last_read_at)`,
      [userId, orderId]
    );
    return parseInt(result.rows[0].count);
  }

  // Get orders with unread messages for a user
  static async getOrdersWithUnread(userId) {
    const result = await db.query(
      `SELECT om.order_id, o.order_number, COUNT(*) as unread_count
       FROM order_messages om
       JOIN orders o ON om.order_id = o.id
       LEFT JOIN message_read_status mrs ON om.order_id = mrs.order_id AND mrs.user_id = $1
       WHERE om.is_deleted = false
         AND om.user_id != $1
         AND (mrs.last_read_at IS NULL OR om.created_at > mrs.last_read_at)
       GROUP BY om.order_id, o.order_number
       ORDER BY MAX(om.created_at) DESC`,
      [userId]
    );
    return result.rows;
  }

  // Get users who should be notified about a new message
  static async getUsersToNotify(orderId, excludeUserId) {
    // Get all users who have participated in the conversation or have relevant roles
    const result = await db.query(
      `SELECT DISTINCT u.id, u.email, u.name, u.role
       FROM users u
       WHERE u.is_active = true
         AND u.id != $2
         AND (
           -- Users who have sent messages on this order
           u.id IN (SELECT user_id FROM order_messages WHERE order_id = $1)
           -- Or users with Lab/OSL/Super Admin roles
           OR u.role IN ('Laboratory Team', 'OSL Team', 'Super Admin')
           -- Or the Country Office user who created the order
           OR u.id = (SELECT created_by FROM orders WHERE id = $1)
         )`,
      [orderId, excludeUserId]
    );
    return result.rows;
  }

  // ==================== NOTIFICATION METHODS ====================

  // Get all notifications for a user
  static async getNotifications(userId, limit = 20, unreadOnly = false) {
    const whereClause = unreadOnly ? 'AND is_read = false' : '';
    const result = await db.query(
      `SELECT * FROM user_notifications 
       WHERE user_id = $1 ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at
    }));
  }

  // Get unread notification count for a user
  static async getNotificationCount(userId) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM user_notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Mark a notification as read
  static async markNotificationRead(notificationId, userId) {
    const result = await db.query(
      `UPDATE user_notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return result.rows.length > 0;
  }

  // Mark all notifications as read for a user
  static async markAllNotificationsRead(userId) {
    const result = await db.query(
      `UPDATE user_notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );
    return result.rows.length;
  }

  // Mark notifications for a specific order as read
  static async markOrderNotificationsRead(userId, orderId) {
    const result = await db.query(
      `UPDATE user_notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND reference_id = $2 AND reference_type = 'order' AND is_read = false
       RETURNING id`,
      [userId, orderId]
    );
    return result.rows.length;
  }

  // Delete old read notifications (cleanup)
  static async cleanupOldNotifications(daysOld = 30) {
    const result = await db.query(
      `DELETE FROM user_notifications 
       WHERE is_read = true AND created_at < NOW() - INTERVAL '${daysOld} days'
       RETURNING id`
    );
    return result.rows.length;
  }
}

module.exports = OrderMessage;
