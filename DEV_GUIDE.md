# HCM Next.js - Developer Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
# This runs both:
#   - Express backend on http://localhost:5000
#   - Next.js frontend on http://localhost:3000
```

## Project Structure

### `/app` - Next.js Pages
- `app/layout.tsx` - Root layout with metadata and Toaster
- `app/page.tsx` - Home/login page
- `app/dashboard/page.tsx` - Main dashboard with charts

### `/components` - React Components
- `MetricCard.tsx` - Stat cards with trend indicators
- `ChartCard.tsx` - Wrapper for charts
- `Loading.tsx` - Loading spinner component
- `/charts` - Recharts-based visualizations
  - `AreaChart.tsx` - Area charts
  - `PieChart.tsx` - Pie/donut charts
  - `LineChart.tsx` - Line charts
  - `BarChart.tsx` - Bar charts

### `/lib` - Utilities & API
- `api.ts` - TypeScript API client with all endpoints

### `/types` - TypeScript Types
- `api.ts` - All API request/response types

### `/styles` - Stylesheets
- `globals.css` - Global styles + Tailwind import
- `hcoms-neu.css` - Neumorphic design system

### `/server` - Express Backend
- Runs on port 5000
- PostgreSQL database
- All API endpoints
- Authentication
- No changes needed!

## API Usage

### Import API Client
```typescript
import { ordersAPI, commoditiesAPI, dashboardAPI } from "@/lib/api";
```

### Making API Calls
```typescript
// In a client component
"use client";

import { useEffect, useState } from "react";
import { ordersAPI } from "@/lib/api";
import type { Order } from "@/types/api";

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await ordersAPI.list({ page: 1, limit: 10 });
        if (response.success && response.data) {
          setOrders(response.data.data);
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Rest of component...
}
```

## Creating Components

### TypeScript Client Component
```typescript
"use client";

import React from "react";

interface MyComponentProps {
  title: string;
  count: number;
}

export function MyComponent({ title, count }: MyComponentProps) {
  return (
    <div className="neu-flat p-4">
      <h2>{title}</h2>
      <p>{count}</p>
    </div>
  );
}

export default MyComponent;
```

### Using Charts
```typescript
import { AreaChart, PieChart } from "@/components/charts";

export function MyDashboard() {
  const data = [
    { name: "Jan", value: 100 },
    { name: "Feb", value: 120 },
  ];

  return (
    <div>
      <AreaChart data={data} dataKey="value" height={300} />
      <PieChart data={data} height={300} />
    </div>
  );
}
```

## Styling

### Using Neumorphic Classes
```html
<div class="neu-flat p-4">Elevated card</div>
<div class="neu-pressed p-4">Pressed/inset card</div>
<button class="neu-btn">Normal button</button>
<button class="neu-primary">Primary button</button>
```

### Using Tailwind Classes
```html
<div class="bg-hc-blue text-white p-4 rounded-lg">Blue card</div>
<div class="text-hc-green font-bold">Green text</div>
```

### CSS Variables
```css
.custom-element {
  background: var(--neu-bg);
  color: var(--neu-t1);
  box-shadow: 2px 2px 5px var(--neu-sd), -2px -2px 5px var(--neu-sl);
}
```

## Type Safety

### Adding Types
All types go in `/types/api.ts`:

```typescript
export interface MyNewType {
  id: string;
  name: string;
  createdAt: string;
}

export interface MyRequest {
  name: string;
  description?: string;
}
```

### Component Props
```typescript
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title: string;
  className?: string;
}

export function Card({ children, title, className }: CardProps) {
  // Component
}
```

## Common Patterns

### Loading State
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.list();
      if (response.success) {
        // Handle data
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### Toast Notifications
```typescript
import toast from "react-hot-toast";

// Success
toast.success("Order created successfully!");

// Error
toast.error("Failed to create order");

// Loading
const id = toast.loading("Processing...");
toast.success("Done!", { id });
```

## API Modules

### Auth API
```typescript
authAPI.login(credentials)
authAPI.logout()
authAPI.getCurrentUser()
authAPI.resetPassword(email)
```

### Orders API
```typescript
ordersAPI.list(params)
ordersAPI.getById(id)
ordersAPI.create(data)
ordersAPI.update(id, data)
ordersAPI.delete(id)
ordersAPI.updateStatus(id, status)
ordersAPI.getAnalytics()
```

### Commodities API
```typescript
commoditiesAPI.list(params)
commoditiesAPI.getById(id)
commoditiesAPI.create(data)
commoditiesAPI.update(id, data)
commoditiesAPI.delete(id)
commoditiesAPI.getLowStock()
```

### Chat API
```typescript
chatAPI.getMessages(orderId)
chatAPI.sendMessage(orderId, data)
chatAPI.attachFile(orderId, file)
```

### Dashboard API
```typescript
dashboardAPI.getStats()
dashboardAPI.getOrderTrend()
dashboardAPI.getCommodityDistribution()
```

### OSL API
```typescript
oslAPI.list(params)
oslAPI.getById(id)
oslAPI.updateStatus(id, status)
oslAPI.allocate(id, allocations)
```

### Warehouse API
```typescript
warehouseAPI.list(params)
warehouseAPI.createOperation(data)
```

### Admin API
```typescript
adminAPI.getUsers()
adminAPI.updateUser(id, data)
adminAPI.deleteUser(id)
adminAPI.getLogs()
```

## Color Reference

### WHO Brand
- `--who-blue: #009ADE`
- `--who-navy: #1A2B4A`

### Primary
- `--hc-blue: #1259b8`
- `--hc-blue2: #2578e8`
- `--hc-blue-bg: #ebf3ff`

### Status
- `--hc-green: #00a896` (success)
- `--hc-green-bg: #e6faf7`
- `--hc-red: #e84855` (error)
- `--hc-red-bg: #fff0f1`
- `--hc-amber: #f4a227` (warning)
- `--hc-amber-bg: #fff8ec`
- `--hc-purple: #6c5ce7` (info)
- `--hc-purple-bg: #f0eeff`

### Neutral
- `--neu-bg: #f0f4f8`
- `--neu-t1: #2d3748` (text primary)
- `--neu-t2: #4a5568` (text secondary)
- `--neu-t3: #8fa3b8` (text tertiary)

## Performance Tips

1. Use `"use client"` only when needed (interactivity, hooks)
2. Lazy load components: `const Heavy = lazy(() => import('./Heavy'))`
3. Use `next/image` for optimized images
4. Memoize expensive computations: `useMemo`, `useCallback`
5. Paginate large lists: use `page` and `limit` params
6. Optimize bundle: check build output

## Debugging

### Console Logs
```typescript
console.log("[API] Fetching orders:", params);
console.error("[ERROR] Failed to load:", error);
console.warn("[WARN] Deprecation notice");
```

### Type Checking
```bash
npm run type-check
```

### Build for Production
```bash
npm run next:build
```

## Common Issues

### API Connection Failed
- Check Express backend is running: `npm run server:dev`
- Verify `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`
- Check CORS settings in Express middleware

### TypeScript Errors
- Run `npm run type-check` to see all errors
- Check if interfaces match API responses
- Import types from `/types/api.ts`

### Styles Not Loading
- Ensure `globals.css` is imported in `app/layout.tsx`
- Check CSS classes use correct neumorphic classes
- Verify CSS variables are defined in `:root`

### Component Not Rendering
- Check `"use client"` directive if using hooks
- Verify all imports are correct
- Check component is exported from index file

## Next Steps

1. Convert more components to TypeScript
2. Create remaining page routes (/orders, /inventory, etc.)
3. Implement authentication context
4. Add more interactive features and animations
5. Test all API integrations thoroughly
6. Optimize performance and bundle size
7. Deploy to Vercel

---

For more details, see `NEXTJS_MIGRATION.md`
