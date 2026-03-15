/**
 * moscript://codex/v1
 * id:       mo-osl-idempotencymw-001
 * name:     Idempotency Middleware — Duplicate Submission Guard
 * element:  🜄
 * trigger:  HTTP_POST
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Every action is idempotent.
 *  Duplicate submissions must be safe."
 */

const { query } = require('../config/database');

// Ensure idempotency_keys table exists
async function initIdempotencyTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key VARCHAR(255) PRIMARY KEY,
        response JSONB NOT NULL,
        status_code INTEGER DEFAULT 200,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys (expires_at)`);
  } catch (err) {
    console.error('[Idempotency] Failed to init table:', err.message);
  }
}

function idempotencyMiddleware(req, res, next) {
  const key = req.headers['x-idempotency-key'];

  // If no key provided, proceed normally
  if (!key) return next();

  // Check for existing key
  query('SELECT response, status_code FROM idempotency_keys WHERE key = $1 AND expires_at > NOW()', [key])
    .then(result => {
      if (result.rows.length > 0) {
        // Duplicate — return cached response
        const cached = result.rows[0];
        return res.status(cached.status_code === 200 ? 200 : 409).json({
          ...cached.response,
          idempotent: true,
          message: cached.status_code === 200
            ? 'Request already processed successfully.'
            : 'Duplicate request detected.',
        });
      }

      // First time — intercept response to cache it
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        // Store response for future dedup
        query(
          `INSERT INTO idempotency_keys (key, response, status_code) VALUES ($1, $2, $3) ON CONFLICT (key) DO NOTHING`,
          [key, JSON.stringify(data), res.statusCode]
        ).catch(err => {
          console.error('[Idempotency] Failed to store key:', err.message);
        });
        return originalJson(data);
      };

      next();
    })
    .catch(err => {
      console.error('[Idempotency] Lookup error:', err.message);
      // On error, proceed without idempotency check — never block
      next();
    });
}

// Cleanup expired keys (run periodically)
async function cleanupExpiredKeys() {
  try {
    const result = await query('DELETE FROM idempotency_keys WHERE expires_at < NOW()');
    if (result.rowCount > 0) {
      console.log(`[Idempotency] Cleaned up ${result.rowCount} expired key(s)`);
    }
  } catch (err) {
    console.error('[Idempotency] Cleanup error:', err.message);
  }
}

module.exports = { idempotencyMiddleware, initIdempotencyTable, cleanupExpiredKeys };
