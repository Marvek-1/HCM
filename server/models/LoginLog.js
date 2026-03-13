const db = require('../config/database');

class LoginLog {
  // Create login log entry - includes userName and userCountry
  static async create({ userId, email, userName, userCountry, ipAddress, userAgent, status, failureReason }) {
    const result = await db.query(
      `INSERT INTO login_logs (user_id, email, user_name, user_country, ip_address, user_agent, status, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId || null, email.toLowerCase(), userName || null, userCountry || null, ipAddress, userAgent, status, failureReason || null]
    );
    return result.rows[0];
  }

  // Get login history for a user
  static async findByUserId(userId, limit = 50) {
    const result = await db.query(
      `SELECT * FROM login_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  // Get login history by email
  static async findByEmail(email, limit = 50) {
    const result = await db.query(
      `SELECT * FROM login_logs WHERE email = $1 ORDER BY created_at DESC LIMIT $2`,
      [email.toLowerCase(), limit]
    );
    return result.rows;
  }

  // Get recent failed login attempts
  static async getRecentFailedAttempts(email, minutes = 15) {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM login_logs 
       WHERE email = $1 AND status = 'failed' 
       AND created_at > CURRENT_TIMESTAMP - INTERVAL '${minutes} minutes'`,
      [email.toLowerCase()]
    );
    return parseInt(result.rows[0].count);
  }

  // Get all login logs (for admin monitoring)
  static async findAll(limit = 100, offset = 0) {
    const result = await db.query(
      `SELECT l.*, u.name as user_name, u.role as user_role, u.country as user_country
       FROM login_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Get login statistics
  static async getStatistics(days = 7) {
    const result = await db.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) FILTER (WHERE status = 'success') as successful_logins,
         COUNT(*) FILTER (WHERE status = 'failed') as failed_logins,
         COUNT(*) FILTER (WHERE status = 'locked') as locked_attempts,
         COUNT(DISTINCT email) as unique_users
       FROM login_logs
       WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );
    return result.rows;
  }

  // Get suspicious activity
  static async getSuspiciousActivity(threshold = 5, hours = 24) {
    const result = await db.query(
      `SELECT ip_address, COUNT(*) as attempts, 
              ARRAY_AGG(DISTINCT email) as emails_attempted
       FROM login_logs
       WHERE status = 'failed' 
       AND created_at > CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
       GROUP BY ip_address
       HAVING COUNT(*) >= $1
       ORDER BY attempts DESC`,
      [threshold]
    );
    return result.rows;
  }
}

module.exports = LoginLog;
