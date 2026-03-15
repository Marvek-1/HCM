# HCM Next.js Migration - Progress Checklist

## Project Completion: ~40%

Track your progress converting from Vite + JSX to Next.js + TypeScript

---

## Phase 1: Project Setup ✅ 100%

- [x] Initialize Next.js 15 project
- [x] Setup TypeScript with strict mode
- [x] Configure Tailwind CSS 4
- [x] Create next.config.ts with API proxy
- [x] Setup path aliases (@/components, @/lib, etc.)
- [x] Create environment variables (.env.local)
- [x] Install all dependencies

**Status**: Ready for development

---

## Phase 2: Styling & Theme ✅ 100%

- [x] Copy hcoms-neu.css (complete neumorphic system)
- [x] Create globals.css with Tailwind import
- [x] Setup WHO brand colors in Tailwind
- [x] Configure custom CSS variables
- [x] Test neumorphic classes (neu-flat, neu-btn, etc.)
- [x] Create custom scrollbar styles
- [x] Setup animations and keyframes

**Status**: Theme fully integrated, all styles working

---

## Phase 3: API & Types ✅ 100%

- [x] Create types/api.ts (252 lines)
  - [x] User types (User, UserRole, AuthResponse)
  - [x] Order types (Order, OrderStatus, OrderPriority)
  - [x] Commodity types (Commodity, CommodityCategory)
  - [x] Chat types (ChatMessage)
  - [x] OSL types (OSLOperation, OSLStatus)
  - [x] Warehouse types (WarehouseOperation)
  - [x] Analytics types (DashboardStats, OrderAnalytics)
  - [x] Query types (QueryParams, PaginatedResponse)

- [x] Create lib/api.ts (311 lines)
  - [x] authAPI (login, logout, getCurrentUser, resetPassword)
  - [x] ordersAPI (CRUD, status, analytics)
  - [x] commoditiesAPI (CRUD, low stock)
  - [x] chatAPI (messages, file uploads)
  - [x] oslAPI (operations, allocate)
  - [x] warehouseAPI (operations)
  - [x] dashboardAPI (stats, trends, distribution)
  - [x] adminAPI (users, logs)

**Status**: All APIs typed and ready to use

---

## Phase 4: Core Components ⏳ 60%

### Completed
- [x] MetricCard.tsx (stat cards with trends)
- [x] ChartCard.tsx (chart wrapper)
- [x] Loading.tsx (spinner component)
- [x] AreaChart.tsx (Recharts area)
- [x] PieChart.tsx (Recharts pie/donut)
- [x] LineChart.tsx (Recharts line)
- [x] BarChart.tsx (Recharts bar)
- [x] components/index.ts (exports)

### To Convert (Copy from JSX)
- [ ] Header.tsx - Navigation header with user menu
- [ ] Sidebar.tsx - Left sidebar navigation
- [ ] Topbar.tsx - Top bar with breadcrumbs
- [ ] Modal wrapper components
  - [ ] NewOrderModal.tsx
  - [ ] OrderDetailModal.tsx
  - [ ] AddCommodityModal.tsx
  - [ ] ForgotPasswordModal.tsx
  - [ ] ClearOrdersModal.tsx

### View Components (Complex)
- [ ] OrdersView.tsx - Orders table and filters
- [ ] InventoryView.tsx - Commodity list
- [ ] AdminView.tsx - Admin dashboard
- [ ] OSLOperations.tsx - OSL management
- [ ] WarehouseManagement.tsx - Warehouse ops
- [ ] CatalogView.tsx - Product catalog
- [ ] DraftsView.tsx - Draft orders
- [ ] ItemDetailView.tsx - Item details

### Utility Components
- [ ] SessionTimeoutWarning.tsx
- [ ] NotificationBell.tsx
- [ ] ProfileSettings.tsx
- [ ] ResetPassword.tsx
- [ ] TimelineItem.tsx
- [ ] StatCard.tsx (enhanced)

**Status**: Core chart components done, need to convert view components

---

## Phase 5: Page Routes ⏳ 17%

### Completed
- [x] app/layout.tsx (root layout with theme)
- [x] app/page.tsx (home/login placeholder)
- [x] app/dashboard/page.tsx (dashboard with 4 charts)

### To Create
- [ ] app/login/page.tsx - Login form
- [ ] app/orders/page.tsx - Orders management
- [ ] app/orders/[id]/page.tsx - Order detail view
- [ ] app/inventory/page.tsx - Commodity/inventory view
- [ ] app/admin/page.tsx - Admin dashboard
- [ ] app/admin/users/page.tsx - User management
- [ ] app/osl/page.tsx - OSL operations
- [ ] app/warehouse/page.tsx - Warehouse operations
- [ ] app/catalog/page.tsx - Product catalog
- [ ] app/drafts/page.tsx - Draft orders
- [ ] app/settings/page.tsx - User settings

**Status**: Foundation layout done, need 10 more pages

---

## Phase 6: Features ⏳ 0%

### Authentication
- [ ] Create lib/auth-context.tsx (user state)
- [ ] Create hooks/useAuth.ts (auth hook)
- [ ] Create ProtectedRoute component
- [ ] Implement login flow
- [ ] Implement logout flow
- [ ] Session management
- [ ] Token storage (cookies/localStorage)

### State Management
- [ ] useAuth hook (user state)
- [ ] useOrders hook (orders state)
- [ ] useCommodities hook (commodity state)
- [ ] useNotification hook (toast wrapper)
- [ ] useFilter hook (table filtering)
- [ ] usePagination hook (pagination)

### Interactive Features
- [ ] Form components (Input, Select, Textarea)
- [ ] Table component with sorting
- [ ] Filter bar with date ranges
- [ ] Search functionality
- [ ] Modal system (open/close)
- [ ] Confirm dialogs
- [ ] Inline editing

**Status**: Not started, need design/implementation

---

## Phase 7: Polish & Optimization ⏳ 0%

### Performance
- [ ] Code splitting (dynamic imports)
- [ ] Image optimization (next/image)
- [ ] Bundle analysis
- [ ] Lazy loading of modals
- [ ] Memoization of heavy components
- [ ] Pagination for large lists

### Accessibility
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Focus management

### User Experience
- [ ] Loading states for all pages
- [ ] Error boundaries
- [ ] Error messages (user-friendly)
- [ ] Success notifications
- [ ] Confirmation dialogs for destructive actions
- [ ] Empty states

### Dark Mode
- [ ] Setup theme context
- [ ] Create dark color variants
- [ ] Toggle button in header
- [ ] Persist theme preference
- [ ] Test all components in dark mode

**Status**: Not started

---

## Phase 8: Testing ⏳ 0%

### Functionality Testing
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test form submissions
- [ ] Test table sorting/filtering
- [ ] Test modal open/close
- [ ] Test notifications

### Component Testing
- [ ] Test MetricCard with different props
- [ ] Test charts with sample data
- [ ] Test form components
- [ ] Test responsive behavior

### Integration Testing
- [ ] Full user flow: login → view dashboard → create order
- [ ] Cross-browser testing
- [ ] Mobile responsive testing

**Status**: Not started

---

## Phase 9: Deployment ⏳ 0%

### Build & Optimization
- [ ] Run production build
- [ ] Check build size
- [ ] Optimize large bundles
- [ ] Create deployment config

### Deploy to Vercel
- [ ] Connect GitHub repo
- [ ] Deploy to Vercel
- [ ] Setup environment variables
- [ ] Test in production
- [ ] Setup domain

### Documentation
- [ ] Update README
- [ ] Add deployment guide
- [ ] Add troubleshooting guide

**Status**: Not started

---

## Summary by Category

### Completed: 22 tasks (40%)
- Setup & configuration
- Styling & theme
- TypeScript types
- API client
- Core components (charts)
- 1 dashboard page

### In Progress: 2 tasks (4%)
- Component conversion
- Chart components

### Todo: 33 tasks (56%)
- View components
- Page routes
- Auth & features
- UI/UX polish
- Testing
- Deployment

---

## Next Immediate Actions (This Session)

Pick 1-2 tasks to complete:

### Easy (30 min each)
- [ ] Convert Header.tsx to TypeScript
- [ ] Convert Sidebar.tsx to TypeScript
- [ ] Create app/login/page.tsx with form
- [ ] Create simple form components

### Medium (1-2 hours each)
- [ ] Create app/orders/page.tsx with table
- [ ] Create OrdersView component with filtering
- [ ] Implement useAuth hook and context
- [ ] Create login/logout flow

### Complex (2-3 hours each)
- [ ] Full auth system with JWT
- [ ] All 11 page routes
- [ ] Complete admin dashboard
- [ ] Dark mode implementation

---

## Tips for Conversion

### Converting from JSX to TSX
1. Copy component from `/src/components/*.jsx`
2. Rename to `.tsx`
3. Add interface for props at top
4. Import types from `@/types/api`
5. Replace `className` strings with Tailwind classes
6. Use neumorphic classes from `hcoms-neu.css`
7. Test in browser

### Creating New Pages
1. Create folder in `/app` (e.g., `/app/orders`)
2. Add `page.tsx` file
3. Mark as client component with `"use client"` if using hooks
4. Use API client to fetch data
5. Render components using TypeScript types
6. Test with `npm run dev`

### Best Practices
- Always type props with interfaces
- Import types from `@/types/api`
- Use `const loading = useState(false)` pattern
- Keep components focused on single responsibility
- Reuse components (MetricCard, ChartCard, etc.)
- Test API calls before building UI

---

## Success Metrics

- [ ] All 30 JSX components converted to TypeScript
- [ ] All 11 pages created and working
- [ ] Full auth flow implemented
- [ ] Charts interactive on every page
- [ ] Type checking passes: `npm run type-check`
- [ ] Build succeeds: `npm run next:build`
- [ ] No runtime errors in console
- [ ] Deployed to Vercel

---

## Resource Links

- **Dev Guide**: `DEV_GUIDE.md` - Complete reference
- **Migration Doc**: `NEXTJS_MIGRATION.md` - Technical details
- **Quick Start**: `QUICKSTART.md` - 60 second guide
- **Summary**: `MIGRATION_SUMMARY.md` - Overview

---

## Notes

- Backend (Express) unchanged - no database work needed
- All CSS/styles already in place - focus on components
- TypeScript will catch errors at compile time
- Hot reload works - changes reflect instantly
- Recharts handles all chart rendering
- Tailwind handles all responsive design

---

**Updated**: 2024
**Progress**: 40% Complete
**Estimated Time to 100%**: 4-6 more focused sessions

Keep track of this checklist and celebrate each completed task!
