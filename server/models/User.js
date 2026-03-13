const db = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  // Find user by email
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await db.query(
      `SELECT id, email, name, username, role, country, osl_admin_level, warehouse_id, is_active, must_change_password,
              password_changed_at, last_login, created_at, created_by
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    return result.rows[0];
  }

  // Create new user (by admin)
  static async create({ email, password, name, role, country, oslAdminLevel, warehouseId, createdBy }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    // Only set osl_admin_level for OSL Team users
    const oslLevel = role === 'OSL Team' ? (oslAdminLevel !== undefined ? oslAdminLevel : 0) : null;
    // Only set warehouse_id for OSL Team users
    const warehouseIdValue = role === 'OSL Team' ? (warehouseId || null) : null;
    const result = await db.query(
      `INSERT INTO users (email, password, name, role, country, osl_admin_level, warehouse_id, created_by, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING id, email, name, role, country, osl_admin_level, warehouse_id, is_active, must_change_password, created_at`,
      [email.toLowerCase(), hashedPassword, name, role, country || null, oslLevel, warehouseIdValue, createdBy || null]
    );
    return result.rows[0];
  }

  // Update user (general)
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'is_active', 'role', 'country', 'osl_admin_level', 'warehouse_id'];

    Object.keys(data).forEach(key => {
      // Convert camelCase to snake_case
      let dbKey = key;
      if (key === 'oslAdminLevel') dbKey = 'osl_admin_level';
      if (key === 'warehouseId') dbKey = 'warehouse_id';
      const value = data[key];

      if (value !== undefined && allowedFields.includes(dbKey)) {
        fields.push(`${dbKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, name, role, country, osl_admin_level, warehouse_id, is_active`,
      values
    );
    return result.rows[0];
  }

  // Update user's own profile (name and username only - not email/country)
  static async updateProfile(id, { name, username }) {
    // Build update fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    
    if (username !== undefined) {
      updates.push(`username = $${paramCount}`);
      values.push(username ? username.toLowerCase() : null);
      paramCount++;
    }
    
    if (updates.length === 0) return null;
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, email, name, username, role, country, osl_admin_level, is_active`,
      values
    );
    return result.rows[0];
  }

  // Change password (by user)
  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await db.query(
      `UPDATE users 
       SET password = $1, must_change_password = false, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING id, email, name, must_change_password`,
      [hashedPassword, id]
    );
    return result.rows[0];
  }

  // Reset password (by admin) - generates temp password
  static async resetPassword(id) {
    const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char temp password
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    
    await db.query(
      `UPDATE users 
       SET password = $1, must_change_password = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hashedPassword, id]
    );
    
    return tempPassword;
  }

  // Set password reset token
  static async setResetToken(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    const result = await db.query(
      `UPDATE users 
       SET password_reset_token = $1, password_reset_expires = $2
       WHERE email = $3
       RETURNING id, email, name`,
      [token, expires, email.toLowerCase()]
    );
    
    return result.rows[0] ? { ...result.rows[0], token } : null;
  }

  // Verify reset token and reset password
  static async resetPasswordWithToken(token, newPassword) {
    const user = await db.query(
      `SELECT id FROM users 
       WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP`,
      [token]
    );
    
    if (user.rows.length === 0) return null;
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await db.query(
      `UPDATE users 
       SET password = $1, password_reset_token = NULL, password_reset_expires = NULL,
           must_change_password = false, password_changed_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name`,
      [hashedPassword, user.rows[0].id]
    );
    
    return result.rows[0];
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(id) {
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, login_attempts = 0 WHERE id = $1',
      [id]
    );
  }

  // Increment login attempts
  static async incrementLoginAttempts(email) {
    const result = await db.query(
      `UPDATE users 
       SET login_attempts = login_attempts + 1,
           locked_until = CASE 
             WHEN login_attempts >= 4 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
             ELSE locked_until 
           END
       WHERE email = $1
       RETURNING login_attempts, locked_until`,
      [email.toLowerCase()]
    );
    return result.rows[0];
  }

  // Check if account is locked
  static async isLocked(email) {
    const result = await db.query(
      'SELECT locked_until FROM users WHERE email = $1 AND locked_until > CURRENT_TIMESTAMP',
      [email.toLowerCase()]
    );
    return result.rows.length > 0 ? result.rows[0].locked_until : null;
  }

  // Reset login attempts
  static async resetLoginAttempts(email) {
    await db.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = $1',
      [email.toLowerCase()]
    );
  }

  // Get all users with pagination and search (for admin)
  static async findAll({ search, role, isActive, page = 1, limit = 20 } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (LOWER(name) LIKE LOWER($${paramCount}) OR LOWER(email) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(isActive);
      paramCount++;
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT id, email, name, role, country, osl_admin_level, warehouse_id, is_active, must_change_password,
              last_login, created_at, created_by
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get users by role
  static async findByRole(role) {
    const result = await db.query(
      'SELECT id, email, name, role, country, is_active, last_login FROM users WHERE role = $1',
      [role]
    );
    return result.rows;
  }

  // Deactivate user
  static async deactivate(id) {
    const result = await db.query(
      `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING id, email, name, is_active`,
      [id]
    );
    return result.rows[0];
  }

  // Activate user
  static async activate(id) {
    const result = await db.query(
      `UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 RETURNING id, email, name, is_active`,
      [id]
    );
    return result.rows[0];
  }

  // Delete user (hard delete - use with caution)
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email',
      [id]
    );
    return result.rows[0];
  }

  // Count users by role
  static async countByRole(role) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1 AND is_active = true',
      [role]
    );
    return parseInt(result.rows[0].count);
  }

  // Log activity
  static async logActivity({ userId, userEmail, userName, action, entityType, entityId, details, ipAddress, userAgent }) {
    const result = await db.query(
      `INSERT INTO activity_logs (user_id, user_email, user_name, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, userEmail, userName, action, entityType || null, entityId || null, details ? JSON.stringify(details) : null, ipAddress || null, userAgent || null]
    );
    return result.rows[0];
  }

  // Get activity logs with pagination and filters
  static async getActivityLogs({ userId, action, entityType, startDate, endDate, page = 1, limit = 50 } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (userId) {
      whereClause += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (action) {
      whereClause += ` AND action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (entityType) {
      whereClause += ` AND entity_type = $${paramCount}`;
      params.push(entityType);
      paramCount++;
    }

    if (startDate) {
      whereClause += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM activity_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT * FROM activity_logs 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      logs: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get login history for a user
  static async getLoginHistory(userId, limit = 10) {
    const result = await db.query(
      `SELECT * FROM login_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // Get user statistics
  static async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'Country Office' THEN 1 END) as country_office_users,
        COUNT(CASE WHEN role = 'Laboratory Team' THEN 1 END) as lab_users,
        COUNT(CASE WHEN role = 'OSL Team' THEN 1 END) as osl_users,
        COUNT(CASE WHEN role = 'Super Admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN last_login > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN 1 END) as active_last_week
      FROM users
    `);
    return result.rows[0];
  }
}

module.exports = User;
