# Running the HCM Next.js Application

## Quick Start (Preview)

The app is ready to preview! Click the **Preview** button in v0 to see it running on `http://localhost:3000`.

## What's Included

### ✅ Next.js 15 Setup
- TypeScript strict mode enabled
- App Router with proper directory structure
- API client configured to proxy to Express backend on port 5000

### ✅ Interactive Dashboard
- Visit `http://localhost:3000/dashboard` to see:
  - 4 metric cards (Total Orders, Pending, Commodities, Low Stock)
  - 4 interactive Recharts (Area, Pie, Line charts)
  - Real-time data fetching with error handling

### ✅ Theme & Styling
- hcoms-neu neumorphic design system loaded globally
- WHO brand colors (Navy #1A2B4A, Cyan #009ADE)
- Responsive design with Tailwind CSS
- Custom scrollbars and animations

### ✅ TypeScript API Client
- 8 API modules fully typed (Auth, Orders, Commodities, Chat, OSL, Warehouse, Dashboard, Admin)
- 30+ endpoints ready to use
- Proper error handling and request/response typing

## Running Both Frontend & Backend

```bash
npm run dev
```

This runs:
- Next.js frontend on `http://localhost:3000`
- Express backend on `http://localhost:5000`
- Both with hot reload enabled

## Running Just the Frontend

```bash
npm run next:dev
```

## Building for Production

```bash
npm run build
npm run next:start
```

## File Structure

```
├── app/                          # Next.js pages & layouts
│   ├── layout.tsx               # Root layout with toast provider
│   ├── page.tsx                 # Home page
│   └── dashboard/
│       └── page.tsx             # Dashboard with charts
├── components/                   # React components
│   ├── MetricCard.tsx          # KPI cards
│   ├── ChartCard.tsx           # Chart wrapper
│   ├── Loading.tsx             # Loading spinner
│   └── charts/
│       ├── AreaChart.tsx
│       ├── BarChart.tsx
│       ├── LineChart.tsx
│       └── PieChart.tsx
├── lib/
│   └── api.ts                  # TypeScript API client
├── types/
│   └── api.ts                  # Type definitions (252 lines)
├── styles/
│   ├── globals.css             # Global styles
│   └── hcoms-neu.css          # Neumorphic theme
└── server/                     # Express backend (unchanged)
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The app will use this to proxy API calls to your Express backend.

## What's Next

The foundation is solid. To extend the app:

1. **Add Auth Flow** - Convert LoginScreen to TypeScript
2. **Create Page Routes** - Add /orders, /inventory, /admin pages
3. **Form Components** - TypeScript forms with validation
4. **More Charts** - Add more Recharts visualizations
5. **User Context** - Global auth state management

All infrastructure is in place. Just start building!

## Troubleshooting

### Port Already in Use
If port 3000 is taken:
```bash
PORT=3001 npm run next:dev
```

### Express Backend Not Connecting
Make sure the backend is running:
```bash
npm run server:dev
```

### TypeScript Errors
Run type check:
```bash
npm run type-check
```

## Support Files

Refer to these documents for detailed information:
- **QUICKSTART.md** - 60-second setup guide
- **DEV_GUIDE.md** - Complete developer reference
- **NEXTJS_MIGRATION.md** - Architecture details
- **PROGRESS.md** - Feature checklist
