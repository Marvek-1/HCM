const db = require('../config/database');

class Supplier {
  // Get all suppliers
  static async findAll({ search, isActive, page = 1, limit = 20 } = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      whereClause += ` AND (LOWER(name) LIKE LOWER($${paramCount}) OR LOWER(code) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (isActive !== undefined) {
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(isActive);
      paramCount++;
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM suppliers ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT * FROM suppliers 
       ${whereClause}
       ORDER BY name ASC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      suppliers: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  // Get supplier by ID
  static async findById(id) {
    const result = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Get supplier by code
  static async findByCode(code) {
    const result = await db.query('SELECT * FROM suppliers WHERE code = $1', [code.toUpperCase()]);
    return result.rows[0];
  }

  // Create supplier
  static async create(data, userId) {
    const result = await db.query(
      `INSERT INTO suppliers 
       (name, code, contact_name, contact_email, contact_phone, address, country, lead_time_days, payment_terms, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name, data.code.toUpperCase(), data.contactName || null, data.contactEmail || null,
        data.contactPhone || null, data.address || null, data.country || null,
        data.leadTimeDays || 30, data.paymentTerms || null, data.notes || null, userId
      ]
    );
    return result.rows[0];
  }

  // Update supplier
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      name: 'name', code: 'code', contactName: 'contact_name', contactEmail: 'contact_email',
      contactPhone: 'contact_phone', address: 'address', country: 'country',
      leadTimeDays: 'lead_time_days', paymentTerms: 'payment_terms', notes: 'notes', isActive: 'is_active'
    };

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && fieldMap[key]) {
        fields.push(`${fieldMap[key]} = $${paramCount}`);
        values.push(key === 'code' ? data[key].toUpperCase() : data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query(
      `UPDATE suppliers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // Get supplier statistics
  static async getStats(supplierId) {
    const result = await db.query(
      `SELECT 
         COUNT(DISTINCT po.id) as total_orders,
         COUNT(DISTINCT CASE WHEN po.status = 'Received' THEN po.id END) as completed_orders,
         COALESCE(SUM(po.total_amount), 0) as total_spend,
         AVG(EXTRACT(DAY FROM (po.actual_delivery_date - po.order_date))) as avg_delivery_days
       FROM purchase_orders po
       WHERE po.supplier_id = $1`,
      [supplierId]
    );
    return result.rows[0];
  }
}

module.exports = Supplier;
