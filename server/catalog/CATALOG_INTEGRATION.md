# HCOMS Catalog Module — Integration Guide

## Overview

Self-contained catalog module for the WHO AFRO Health Commodity Management System.  
**160 real operational items** across **12 categories**, with warehouse stock distribution, search, filtering, pagination, and analytics.

---

## Module Structure

### Backend (`server/catalog/`)

```
server/catalog/
  schema.sql                    # Idempotent DDL — safe to run repeatedly
  seed.js                       # Standalone seeder (160 items, 12 categories, 2 warehouses)
  models/
    CatalogItem.js              # DB queries (read-only, no mutations)
  services/
    catalogService.js           # Business logic, enrichment, analytics
  controllers/
    catalogController.js        # Express request handlers
  routes/
    index.js                    # Route definitions (mounted at /api/catalog)
  CATALOG_INTEGRATION.md        # This file
```

### Frontend (`src/catalog-page/`)

```
src/catalog-page/
  index.js                      # Barrel export
  api/
    catalogApi.js               # Fetch client for /api/catalog/*
  components/
    CatalogItemCard.jsx         # Grid card with availability badge
    CatalogFilters.jsx          # Search + category + unit filters
    CatalogItemDetail.jsx       # Detail modal with warehouse breakdown
    CatalogDashboard.jsx        # Analytics: totals, categories, warehouses, critical stock
  views/
    CatalogView.jsx             # Main orchestrator (browse + dashboard tabs)
```

---

## Database Schema

The catalog uses **4 tables** (created by `schema.sql`):

| Table                | Purpose                              |
|----------------------|--------------------------------------|
| `categories`         | 12 commodity categories              |
| `commodities`        | 160 catalog items                    |
| `warehouses`         | 2 warehouses (Nairobi, Dakar)        |
| `warehouse_inventory`| Stock per item per warehouse         |

All tables use `CREATE TABLE IF NOT EXISTS` — safe to run on existing databases.

### Key columns on `commodities`

| Column                 | Type           | Notes                        |
|------------------------|----------------|------------------------------|
| `id`                   | SERIAL PK      |                              |
| `name`                 | TEXT NOT NULL   | Full item description        |
| `category`             | VARCHAR(100)   | Category name (denormalized) |
| `category_id`          | INTEGER FK     | References `categories(id)`  |
| `unit`                 | VARCHAR(50)    | Box, Case, Each, Kit, etc.   |
| `price`                | DECIMAL(12,2)  | Unit price USD               |
| `stock`                | INTEGER        | Total stock count            |
| `description`          | TEXT           | Human-readable description   |
| `storage_requirements` | VARCHAR(255)   | e.g. "2-8°C", "Store dry"   |
| `shelf_life`           | VARCHAR(100)   | e.g. "36 months"             |
| `is_active`            | BOOLEAN        | Soft delete flag             |

---

## API Endpoints

All mounted under **`/api/catalog`**.

| Method | Path                  | Description                                      | Auth Required |
|--------|-----------------------|--------------------------------------------------|---------------|
| GET    | `/`                   | Browse items (paginated, searchable, filterable)  | No*           |
| GET    | `/simple`             | Flat list for dropdowns                          | No*           |
| GET    | `/categories`         | Categories with item counts                      | No*           |
| GET    | `/low-stock`          | Items below threshold (`?threshold=100`)         | No*           |
| GET    | `/warehouses`         | All active warehouses                            | No*           |
| GET    | `/dashboard`          | Aggregate analytics                              | No*           |
| GET    | `/item/:id`           | Single item with warehouse stock                 | No*           |
| GET    | `/item/:id/stock`     | Per-warehouse stock for one item                 | No*           |

> \*Auth is **not required by default**. To add it, uncomment the `authenticate` middleware import in `server/catalog/routes/index.js` and add it to any route.

### Query Parameters for Browse (`GET /`)

| Param      | Type   | Default | Description              |
|------------|--------|---------|--------------------------|
| `search`   | string |         | Search name/description  |
| `category` | string |         | Filter by category name  |
| `unit`     | string |         | Filter by unit type      |
| `page`     | int    | 1       | Page number              |
| `limit`    | int    | 20      | Items per page           |

### Response Format

All responses follow:
```json
{
  "success": true,
  "data": { ... }
}
```

Browse response includes pagination:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 160,
      "totalPages": 8
    }
  }
}
```

---

## Environment Variables

The catalog module uses the **same DB connection** as the rest of the server (`server/config/database.js`).

| Variable       | Required | Description                    |
|----------------|----------|--------------------------------|
| `PGHOST`       | Yes      | PostgreSQL hostname            |
| `PGPORT`       | No       | PostgreSQL port (default 5432) |
| `PGDATABASE`   | Yes      | Database name                  |
| `PGUSER`       | Yes      | Database username              |
| `PGPASSWORD`   | Yes      | Database password              |

For local development:
```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=hcoms_db
PGUSER=postgres
PGPASSWORD=postgres
```

---

## How to Integrate

### 1. Seed the database

```bash
node server/catalog/seed.js
```

This creates tables (if needed) and inserts 160 items, 12 categories, 2 warehouses, and stock distribution. Idempotent — skips existing rows.

### 2. Backend is already wired

The catalog routes are registered in `server/index.js`:
```js
const catalogRoutes = require('./catalog/routes');
app.use('/api/catalog', catalogRoutes);
```

### 3. Frontend usage

Import the view into any page:
```jsx
import { CatalogView } from './catalog-page';

// Then render it:
<CatalogView />
```

Or use individual components:
```jsx
import { CatalogItemCard, catalogApi } from './catalog-page';
```

### 4. Add authentication (optional)

In `server/catalog/routes/index.js`, uncomment and add:
```js
const { authenticate } = require('../../middleware/auth');
router.get('/', authenticate, catalog.browse);
```

---

## Data Summary

- **160 items** across **12 categories**
- **Unit types**: Box, Case, Each, Kit, Pair, Unit
- **2 warehouses**: Nairobi (NBO, 60% stock), Dakar (DKR, 40% stock)
- **Categories**: Biomedical Consumables, Biomedical Equipment, Cold Chain Equipment, Emergency Health Kits, IT & Communications, Lab & Diagnostics, PPE, Pharmaceuticals, Shelter & Field, Visibility Materials, WASH & Water, Wellbeing

---

## Design Decisions

1. **Read-only model** — The catalog module only reads from the database. All writes (CRUD) remain in the existing `commodityController.js` / `Commodity.js`. This prevents conflicts.

2. **Shared DB pool** — Uses the existing `server/config/database.js` pool. No separate connection.

3. **Idempotent schema** — `CREATE TABLE IF NOT EXISTS` + `ON CONFLICT DO NOTHING` in seeder. Safe alongside existing migrations.

4. **No new dependencies** — Uses only `express`, `pg`, and React (already in the project).

5. **Computed fields** — `availability` status and `total_value` are computed in the service layer, not stored in DB.
