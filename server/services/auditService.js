/**
 * moscript://codex/v1
 * id:       mo-osl-auditsvc-001
 * name:     Audit Service — Immutable Compliance Log
 * element:  🜃
 * trigger:  AUDIT_LOG
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Every action is recorded. Every record is immutable.
 *  WHO compliance is not optional."
 */

const { query } = require('../config/database');

// Ensure audit_log table exists
async function initAuditTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_role VARCHAR(50),
        country VARCHAR(10),
        action VARCHAR(200) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(100),
        previous_state JSONB,
        new_state JSONB,
        ip_address VARCHAR(45),
        moscript_id VARCHAR(100),
        justification TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // Index for fast lookups
    await query(`CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log (entity_type, entity_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log (user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at)`);
  } catch (err) {
    console.error('[AuditService] Failed to init audit table:', err.message);
  }
}

async function logAction({
  userId, userRole, country, action,
  entityType, entityId,
  previousState, newState,
  ipAddress, moScriptId, justification
}) {
  if (process.env.AUDIT_LOG_ENABLED === 'false') return;

  try {
    await query(
      `INSERT INTO audit_log
        (user_id, user_role, country, action, entity_type, entity_id,
         previous_state, new_state, ip_address, moscript_id, justification)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        userId, userRole, country, action,
        entityType, entityId,
        previousState ? JSON.stringify(previousState) : null,
        newState ? JSON.stringify(newState) : null,
        ipAddress, moScriptId, justification,
      ]
    );
  } catch (err) {
    // Audit failures must not break the application flow
    console.error('[AuditService] Failed to write audit log:', err.message);
  }
}

async function getAuditLog({ entityType, entityId, userId, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (entityType) {
    conditions.push(`entity_type = $${paramIndex++}`);
    params.push(entityType);
  }
  if (entityId) {
    conditions.push(`entity_id = $${paramIndex++}`);
    params.push(entityId);
  }
  if (userId) {
    conditions.push(`user_id = $${paramIndex++}`);
    params.push(userId);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT * FROM audit_log ${where}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  return result.rows;
}

module.exports = { initAuditTable, logAction, getAuditLog };
