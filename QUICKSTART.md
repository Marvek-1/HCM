# HCM Next.js - Quick Start Guide

## 60 Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Start everything
npm run dev

# 3. Open browser
open http://localhost:3000/dashboard
```

Done! You now have:
- ✅ Next.js 15 frontend (port 3000)
- ✅ Express backend (port 5000)
- ✅ Interactive dashboard with charts
- ✅ Full TypeScript support
- ✅ hcoms-neu theme intact

## What You See

### Dashboard Page
`http://localhost:3000/dashboard`

Shows:
- 4 metric cards (Orders, Pending, Commodities, Low Stock)
- 4 interactive Recharts:
  - Area chart: Order trends over 6 weeks
  - Pie chart: Commodity distribution by category
  - Pie chart: Order status breakdown
  - Line chart: Order value trends

All data comes from your Express backend via the new TypeScript API client.

## Your Tech Stack Now

```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript (full type safety)
├── Tailwind CSS 4
├── Recharts (interactive charts)
├── Framer Motion (animations ready)
├── Lucide React (icons)
└── React Hot Toast (notifications)

Backend:
├── Express.js (unchanged)
├── PostgreSQL (unchanged)
├── JWT Auth (unchanged)
└── All 30+ endpoints (working)
```

## File You Need to Know

### For Development
- `DEV_GUIDE.md` - Complete reference for everything
- `NEXTJS_MIGRATION.md` - Technical architecture & API list
- `next.config.ts` - Configuration (includes API proxy)
- `app/layout.tsx` - Root layout with theme setup

### For Styling
- `styles/hcoms-neu.css` - All neumorphic primitives
- `tailwind.config.ts` - Color system and custom utilities
- Use class names: `neu-flat`, `neu-btn`, `neu-primary`, etc.

### For Components
- `components/MetricCard.tsx` - Copy this for stat cards
- `components/ChartCard.tsx` - Wrapper for any chart
- `components/charts/` - Import AreaChart, PieChart, LineChart, BarChart

### For APIs
- `lib/api.ts` - All 8 API modules, fully typed
- `types/api.ts` - All TypeScript interfaces

## Common Tasks

### Add a New Page
```bash
mkdir -p app/orders
cat > app/orders/page.tsx << 'EOF'
"use client";

export default function OrdersPage() {
  return <main className="p-8">Orders Page</main>;
}
EOF
```

### Use an API
```typescript
import { ordersAPI } from "@/lib/api";

const response = await ordersAPI.list({ page: 1, limit: 10 });
if (response.success) {
  console.log(response.data.data); // Your orders
}
```

### Create a Chart
```typescript
import { AreaChart } from "@/components/charts";

const data = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 150 },
];

<AreaChart data={data} dataKey="value" height={300} />
```

### Add a Stat Card
```typescript
import { MetricCard } from "@/components";
import { Package } from "lucide-react";

<MetricCard
  label="Total Orders"
  value={123}
  icon={Package}
  color="blue"
  trend={{ direction: "up", percentage: 12, label: "vs last month" }}
/>
```

### Show a Loading State
```typescript
import { Loading } from "@/components";

if (loading) return <Loading message="Loading orders..." />;
```

### Show a Notification
```typescript
import toast from "react-hot-toast";

toast.success("Order created!");
toast.error("Something went wrong");
const id = toast.loading("Processing...");
toast.success("Done!", { id });
```

## Color Palette

### Use These Colors
```css
/* Background */
background: var(--neu-bg);  /* #f0f4f8 */

/* Text */
color: var(--neu-t1);       /* Primary text - #2d3748 */
color: var(--neu-t2);       /* Secondary text - #4a5568 */
color: var(--neu-t3);       /* Tertiary text - #8fa3b8 */

/* Brand */
color: var(--hc-blue);      /* Primary blue - #1259b8 */
color: var(--hc-blue2);     /* Secondary blue - #2578e8 */
color: var(--who-blue);     /* WHO blue - #009ADE */
color: var(--who-navy);     /* WHO navy - #1A2B4A */

/* Status */
color: var(--hc-green);     /* Success - #00a896 */
color: var(--hc-red);       /* Error - #e84855 */
color: var(--hc-amber);     /* Warning - #f4a227 */
color: var(--hc-purple);    /* Info - #6c5ce7 */
```

## Neumorphic Classes

```html
<!-- Elevated card -->
<div class="neu-flat p-4">Content</div>

<!-- Pressed/inset card -->
<div class="neu-pressed p-4">Content</div>

<!-- Circular button -->
<button class="neu-circle w-10 h-10">Icon</button>

<!-- Normal button -->
<button class="neu-btn px-6 py-2">Click me</button>

<!-- Primary button (blue) -->
<button class="neu-primary px-6 py-2">Submit</button>

<!-- Status pills -->
<span class="hcoms-spill hcoms-sp-s">Submitted</span>
<span class="hcoms-spill hcoms-sp-r">Ready</span>
<span class="hcoms-spill hcoms-sp-a">Active</span>
<span class="hcoms-spill hcoms-sp-t">In Transit</span>
<span class="hcoms-spill hcoms-sp-d">Delivered</span>
```

## Type Safety Examples

### Properly Typed Component
```typescript
"use client";

import { useState } from "react";
import { ordersAPI } from "@/lib/api";
import type { Order } from "@/types/api";

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    const response = await ordersAPI.list();
    if (response.success && response.data) {
      // TypeScript knows response.data has structure PaginatedResponse<Order>
      setOrders(response.data.data); // data is Order[]
      setError(null);
    } else {
      setError(response.error || "Failed to load");
    }
  };

  // Component returns JSX...
}
```

## Debugging

### Check TypeScript
```bash
npm run type-check
```

### View Build Output
```bash
npm run next:build
```

### Test Production Build
```bash
npm run next:build
npm run next:start
```

## Need Help?

1. **Development reference** → Read `DEV_GUIDE.md`
2. **API details** → Check `NEXTJS_MIGRATION.md`
3. **Architecture** → See `MIGRATION_SUMMARY.md`
4. **Type definitions** → Look at `types/api.ts`
5. **API client methods** → Check `lib/api.ts`

## Quick Wins (Next Steps)

Pick any of these to add to your dashboard:

1. **Convert Sidebar component** to TypeScript
   - Copy from `/src/components/Sidebar.jsx`
   - Add proper types
   - Update imports

2. **Create /orders page** with interactive table
   - Copy orders list from existing JSX
   - Make fully typed with Order interface
   - Add sorting and filtering

3. **Add auth context** for user state
   - Create `lib/auth-context.tsx`
   - Add useAuth hook
   - Wrap app in AuthProvider

4. **Build orders table component**
   - Display orders in hcoms-neu styled table
   - Add status badges and priority indicators
   - Make sortable and filterable

5. **Add more chart types**
   - Check Recharts documentation
   - Create ScatterChart, RadarChart, etc.
   - Add to dashboard

All of these are easier now with TypeScript autocomplete and type safety!

## Performance Notes

- Next.js automatically code-splits your pages
- Charts are lazy-loaded only when needed
- Tailwind CSS is tree-shaken (only used classes included)
- React Compiler automatically optimizes re-renders
- All builds include source maps for debugging

## Deployment Ready

When you're ready to deploy:

```bash
# Build production version
npm run next:build

# Test it locally
npm run next:start

# Deploy to Vercel (one command)
vercel
```

---

**You're all set!** Start with the dashboard at `/dashboard` and explore the interactive charts. When ready, convert components and create new pages following the patterns in `DEV_GUIDE.md`.

Happy coding with TypeScript! 🚀
