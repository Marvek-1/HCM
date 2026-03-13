const db = require('../config/database');
const crypto = require('crypto');

class Session {
  // Create a new session
  static async create({ userId, token, ipAddress, userAgent, expiresAt }) {
    // Hash the token for storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const result = await db.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, created_at, expires_at`,
      [userId, tokenHash, ipAddress, userAgent, expiresAt]
    );
    return result.rows[0];
  }

  // Verify session token
  static async verify(token, userId) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const result = await db.query(
      `SELECT * FROM sessions 
       WHERE token_hash = $1 AND user_id = $2 AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash, userId]
    );
    return result.rows[0];
  }

  // Delete session (logout)
  static async delete(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    await db.query(
      'DELETE FROM sessions WHERE token_hash = $1',
      [tokenHash]
    );
  }

  // Delete all sessions for a user (force logout from all devices)
  static async deleteAllForUser(userId) {
    await db.query(
      'DELETE FROM sessions WHERE user_id = $1',
      [userId]
    );
  }

  // Get active sessions for a user
  static async getActiveSessions(userId) {
    const result = await db.query(
      `SELECT id, ip_address, user_agent, created_at, expires_at
       FROM sessions 
       WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // Clean up expired sessions
  static async cleanupExpired() {
    const result = await db.query(
      'DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP RETURNING id'
    );
    return result.rowCount;
  }
}

module.exports = Session;
