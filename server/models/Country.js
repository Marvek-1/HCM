const db = require('../config/database');

class Country {
  // Get all active countries
  static async findAll() {
    const result = await db.query(
      `SELECT id, name, code, region, is_active 
       FROM countries 
       WHERE is_active = true 
       ORDER BY name ASC`
    );
    return result.rows;
  }

  // Get countries by region
  static async findByRegion(region) {
    const result = await db.query(
      `SELECT id, name, code, region, is_active 
       FROM countries 
       WHERE region = $1 AND is_active = true 
       ORDER BY name ASC`,
      [region]
    );
    return result.rows;
  }

  // Get single country by ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM countries WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get country by name
  static async findByName(name) {
    const result = await db.query(
      'SELECT * FROM countries WHERE name = $1',
      [name]
    );
    return result.rows[0];
  }

  // Get country by code
  static async findByCode(code) {
    const result = await db.query(
      'SELECT * FROM countries WHERE code = $1',
      [code.toUpperCase()]
    );
    return result.rows[0];
  }

  // Create new country (admin only)
  static async create({ name, code, region }) {
    const result = await db.query(
      `INSERT INTO countries (name, code, region) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, code.toUpperCase(), region || null]
    );
    return result.rows[0];
  }

  // Update country (admin only)
  static async update(id, { name, code, region, isActive }) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (code !== undefined) {
      fields.push(`code = $${paramCount}`);
      values.push(code.toUpperCase());
      paramCount++;
    }
    if (region !== undefined) {
      fields.push(`region = $${paramCount}`);
      values.push(region);
      paramCount++;
    }
    if (isActive !== undefined) {
      fields.push(`is_active = $${paramCount}`);
      values.push(isActive);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await db.query(
      `UPDATE countries SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  // Get all regions
  static async getRegions() {
    const result = await db.query(
      `SELECT DISTINCT region FROM countries WHERE region IS NOT NULL ORDER BY region`
    );
    return result.rows.map(r => r.region);
  }
}

module.exports = Country;
