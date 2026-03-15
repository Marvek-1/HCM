# HCM App Layout Update

## Overview
The HCM app has been updated with a new unified layout based on the activate-page.tsx design, while maintaining the existing color scheme and hcoms-neu theme.

## Changes Made

### 1. **New Components Created**

#### UnifiedLayout.jsx
- New wrapper component that manages the overall page layout
- Includes enhanced sidebar with improved navigation
- Displays stats/KPIs automatically if available
- Supports responsive design
- Props:
  - `activeTab`: Current active tab
  - `setActiveTab`: Function to change tabs
  - `stats`: Optional stats object to display KPIs
  - `currentUser`: Current user object
  - `children`: Content to display in main area

### 2. **New Styles Created**

#### UnifiedLayout.css
- Grid-based layout (250px sidebar + content area)
- WHO color scheme integration (Navy #1A2B4A → Cyan #009ADE)
- Neumorphic-inspired styling with modern shadows
- Responsive design for tablets and mobile
- Key features:
  - Gradient sidebar background
  - Active menu item with curved "bleeding" effect
  - KPI stat cards with WHO blue accents
  - Clean typography and spacing

### 3. **Updates to Existing Files**

#### App.jsx
- Added import for UnifiedLayout component
- Replaced traditional sidebar + content structure with UnifiedLayout wrapper
- Header component maintained as-is at the top
- All child content routes pass through UnifiedLayout
- Stats automatically displayed in KPI row

#### components/index.js
- Added export for UnifiedLayout component

## Design Features

### Color System
- **Primary**: WHO Blue (#009ADE) and Navy (#1A2B4A)
- **Background**: Soft blue gradient (#eef3fb to #f8faff)
- **Sidebar**: Navy to Cyan gradient
- **Text**: Dark gray (#1c2333) on light backgrounds, white on dark

### Layout Structure
```
┌─────────────────────────────┐
│  Header (Maintained)        │
├─────────┬───────────────────┤
│ Sidebar │  Main Content     │
│ (Fixed) │  - Topbar         │
│         │  - KPI Stats      │
│         │  - Content Area   │
│         │                   │
└─────────┴───────────────────┘
```

### Key Components
- **Sidebar**: Fixed left navigation with active state styling
- **Topbar**: Page title and user avatar
- **KPI Cards**: Auto-displays stats if provided
- **Content Area**: Flexible space for child components

## Usage Example

```jsx
<UnifiedLayout 
  activeTab={activeTab} 
  setActiveTab={setActiveTab}
  stats={{
    totalOrders: 42,
    pendingOrders: 8,
    totalCommodities: 256,
    activeWarehouses: 5
  }}
  currentUser={currentUser}
>
  {/* Your content here */}
</UnifiedLayout>
```

## Responsive Behavior

### Desktop (1380px+)
- Sidebar: Fixed left column (250px)
- Main: Full width content area
- KPIs: Full width grid

### Tablet (768px-1380px)
- Sidebar: Horizontal navigation bar
- Main: Full width
- KPIs: 2-column grid

### Mobile (<768px)
- Sidebar: Horizontal stacked buttons
- Main: Full width
- KPIs: Single column

## Maintained Features
- ✅ Header component (unchanged)
- ✅ All existing routes and navigation
- ✅ Modal systems
- ✅ User permissions and role-based UI
- ✅ HCOMS neumorphic theme colors
- ✅ All child component functionality

## Next Steps
- Test all navigation paths
- Verify responsive behavior on different screen sizes
- Ensure stats display correctly for each user role
- Monitor console for any theme-related warnings
