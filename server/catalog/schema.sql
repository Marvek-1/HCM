-- =============================================
-- HCOMS Catalog Module - Database Schema
-- WHO AFRO Health Commodity Management System
-- =============================================
-- This schema is additive. It creates tables only if they don't exist.
-- Safe to run multiple times (idempotent).

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commodities table (catalog items)
CREATE TABLE IF NOT EXISTS commodities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category VARCHAR(100),
  category_id INTEGER REFERENCES categories(id),
  unit VARCHAR(50) NOT NULL DEFAULT 'Each',
  price DECIMAL(12, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  description TEXT,
  storage_requirements VARCHAR(255),
  shelf_life VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  code VARCHAR(10) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse inventory (stock per warehouse per commodity)
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id SERIAL PRIMARY KEY,
  commodity_id INTEGER NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
  warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(warehouse_id, commodity_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_commodities_category ON commodities(category);
CREATE INDEX IF NOT EXISTS idx_commodities_category_id ON commodities(category_id);
CREATE INDEX IF NOT EXISTS idx_commodities_name ON commodities(name);
CREATE INDEX IF NOT EXISTS idx_commodities_is_active ON commodities(is_active);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_commodity ON warehouse_inventory(commodity_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse ON warehouse_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
