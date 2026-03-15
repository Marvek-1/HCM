# Component Styling Guide

## Overview
This guide shows how to apply the new UI styles to individual components throughout the application.

## Core Components

### 1. Dashboard Component

#### Header Section
```jsx
// Page header with consistent styling
<div className="page-header">
  <div className="page-title-group">
    <h1>Dashboard Overview</h1>
    <p>Welcome back, you have X pending orders</p>
  </div>
  <div className="page-actions">
    <button className="btn btn-secondary">Export</button>
    <button className="btn btn-primary">+ New Order</button>
  </div>
</div>
```

**Styling Applied:**
- Modern typography with `letter-spacing: -0.02em`
- Flex layout with proper spacing
- Responsive button arrangement
- Subtle text colors for secondary content

#### Filter Panel
```jsx
// Enhanced filter section
<div className="dashboard-filters">
  <div className="filter-row">
    <div className="filter-group">
      <label className="filter-label">Status</label>
      <select className="filter-select">
        <option>All Status</option>
        <option>Submitted</option>
      </select>
    </div>
  </div>
  <div className="filter-summary">
    Showing <strong>X</strong> of <strong>Y</strong> orders
  </div>
</div>
```

**Styling Applied:**
- Grid layout for responsive columns
- Uppercase, tracked labels
- Input focus states with blue shadow
- Clear result summary

#### Stat Cards
```jsx
// Modern KPI cards
<div className="dashboard-stats">
  <div className="card kpi-card">
    <div>
      <div className="card-label">Orders Processed</div>
      <div className="card-value">2,634</div>
      <div className="trend">↗ 8.4% vs last week</div>
    </div>
    <div className="sparkline">
      <!-- Mini chart -->
    </div>
  </div>
</div>
```

**Styling Applied:**
- Gradient backgrounds on hover
- Typography hierarchy
- Trend indicators with color coding
- Sparkline animations

### 2. Order Components

#### Order Table
```jsx
// Styled order table
<table>
  <thead>
    <tr>
      <th>Order ID</th>
      <th>Customer</th>
      <th>Status</th>
      <th>Amount</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    <tr className="selected">
      <td>#2633</td>
      <td>John McCormick</td>
      <td>
        <span className="status">
          <span className="dot"></span>
          Dispatch
        </span>
      </td>
      <td>$35.00</td>
      <td>
        <button className="link-btn primary">View</button>
      </td>
    </tr>
  </tbody>
</table>
```

**Styling Applied:**
- Clear header styling with background gradient
- Row hover effects with subtle background
- Selected row highlighting with gradient
- Status dots with color coding
- Button sizing consistent with design

#### Order Detail Modal
```jsx
// Order information display
<div className="order-form-section">
  <h3 className="card-title">Order Summary</h3>
  <div className="summary-list">
    <div className="summary-row">
      <span className="summary-label">Cart Items</span>
      <strong>1 line</strong>
    </div>
    <div className="summary-row divider">
      <span className="summary-label">Estimated Value</span>
      <strong>$310</strong>
    </div>
    <div className="summary-row total">
      <span>Total</span>
      <strong>$310.00</strong>
    </div>
  </div>
</div>
```

**Styling Applied:**
- Rounded section backgrounds
- Consistent padding and spacing
- Visual separators between items
- Bold total row for emphasis

### 3. Product Components

#### Product Card
```jsx
// Product display card
<div className="card product-card">
  <div className="product-image">
    <span className="product-badge">Emergency kit</span>
    <!-- Product image/visual -->
  </div>
  <div className="product-info">
    <h4 className="product-name">Emergency Response Kit</h4>
    <div className="product-sku">SKU ERK-204 • Sealed case</div>
    <div className="product-specs">
      <div className="product-spec">
        Category
        <strong>Emergency Health Kits</strong>
      </div>
      <div className="product-spec">
        Stock
        <strong>124 Units</strong>
      </div>
    </div>
    <div className="product-price">$149</div>
    <div className="product-price-meta">per kit</div>
    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button className="btn btn-secondary">Summary</button>
      <button className="btn btn-primary">View Details</button>
    </div>
  </div>
</div>
```

**Styling Applied:**
- Hover scale with shadow increase
- Badge positioning and styling
- Price emphasis with large font
- Button pair with consistent sizing
- Responsive grid for multiple cards

### 4. Form Components

#### Form Field
```jsx
// Standard form input
<div className="form-field">
  <label className="form-label">Consignee Address</label>
  <textarea 
    className="form-textarea"
    placeholder="Enter full address..."
  />
  {error && <div className="form-error">This field is required</div>}
</div>
```

**Styling Applied:**
- Small, uppercase labels
- Input focus states with blue shadow
- Error color on invalid state
- Consistent padding and sizing
- Placeholder text styling

#### Multi-Column Form Layout
```jsx
// Side-by-side form fields
<div className="grid-2col">
  <div className="form-field">
    <label className="form-label">From Date</label>
    <input type="date" className="form-input" />
  </div>
  <div className="form-field">
    <label className="form-label">To Date</label>
    <input type="date" className="form-input" />
  </div>
</div>
```

**Styling Applied:**
- Responsive grid (2-col on desktop, 1-col on mobile)
- Consistent field spacing
- Aligned labels and inputs

### 5. Timeline Component

#### Timeline Steps
```jsx
// Multi-step timeline
<div className="timeline">
  <div className="timeline-step done">
    <h4>Requester sent validated order</h4>
    <p>OR_24-001_Kenya entered the OSL lane</p>
  </div>
  <div className="timeline-step active">
    <h4>OSL review in progress</h4>
    <p>Operations confirms all required data</p>
  </div>
  <div className="timeline-step">
    <h4>Stock release</h4>
    <p>Pending approval from operations</p>
  </div>
</div>
```

**Styling Applied:**
- Colored dots based on state (done=green, active=blue, pending=gray)
- Grid layout for responsive columns
- Clear visual hierarchy with dots on left
- Connected line effect between steps

### 6. Alert/Notification Components

#### Alert Box
```jsx
// Status notifications
<div className="alert alert-info">
  <div className="alert-icon">ℹ️</div>
  <div className="alert-content">
    <div className="alert-title">Workflow guardrail</div>
    <div className="alert-message">
      Mandatory fields must validate before submit.
      After submission, the request stays editable for 1 hour.
    </div>
  </div>
</div>

<div className="alert alert-warning">
  <div className="alert-icon">⚠️</div>
  <div className="alert-content">
    <div className="alert-title">Low Stock</div>
    <div className="alert-message">
      5 items are below minimum stock levels
    </div>
  </div>
</div>

<div className="alert alert-success">
  <div className="alert-icon">✓</div>
  <div className="alert-content">
    <div className="alert-title">Order Approved</div>
    <div className="alert-message">
      Your order has been successfully approved
    </div>
  </div>
</div>

<div className="alert alert-error">
  <div className="alert-icon">✕</div>
  <div className="alert-content">
    <div className="alert-title">Validation Error</div>
    <div className="alert-message">
      Please correct the highlighted fields
    </div>
  </div>
</div>
```

**Styling Applied:**
- Left border for visual indicator
- Gradient backgrounds for each type
- Icon positioning and sizing
- Clear title and message hierarchy
- Semantic color coding

### 7. Badge/Status Components

#### Status Pills
```jsx
// Status indicators
<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <span className="status-badge submitted">Draft validated</span>
  <span className="status-badge approved">Approved</span>
  <span className="status-badge pending">Awaiting Review</span>
  <span className="status-badge rejected">Rejected</span>
  <span className="status-badge draft">Draft</span>
</div>
```

**Styling Applied:**
- Semantic background colors
- White text on dark, dark text on light
- Uppercase text with letter-spacing
- Inline-flex for proper alignment

### 8. Button Variants

#### Button Styles
```jsx
// Different button states
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <button className="btn btn-primary">Primary Action</button>
  <button className="btn btn-secondary">Secondary Action</button>
  <button className="btn btn-ghost">Ghost Button</button>
  <button className="btn btn-danger">Delete</button>
  <button className="btn" disabled>Disabled</button>
</div>
```

**Styling Applied:**
- Primary: Solid blue background
- Secondary: White with border
- Ghost: Transparent with border
- Danger: Red background
- Hover states with shadow and color change
- Active state with scale transform
- Disabled state with opacity

## Spacing System

All components use a consistent spacing scale:

```css
8px   = xs   (gaps, small padding)
12px  = sm   (form inputs, small margins)
14px  = sm+  (borders, lines)
16px  = md   (padding, standard gap)
18px  = md+  (card padding, section gaps)
20px  = lg   (section padding)
24px  = xl   (page margins)
```

## Color Reference

### Semantic Colors
- **Primary Blue** - Main actions, focus states: `#0f5bff`
- **Success Green** - Positive states: `#17b26a`
- **Warning Orange** - Cautions: `#f79009`
- **Error Red** - Errors, destructive actions: `#f04438`

### Neutral Colors
- **Text Dark** - Primary text: `#1c2333`
- **Text Secondary** - Secondary info: `#7c879b`
- **Text Tertiary** - Tertiary info: `#a5adb8`
- **Border Light** - Subtle borders: `#e8edf5`
- **Surface Primary** - Cards, modals: `#ffffff`
- **Surface Secondary** - Page background: `#f5f7fb`

## Responsive Behavior

### All components adapt to:
- **Desktop** (1200px+): Full layouts with 2-3 columns
- **Tablet** (768px-1200px): Adjusted columns, some stacking
- **Mobile** (<768px): Single column, full-width buttons, compact spacing

## Animation Timings

```css
--transition-fast: 150ms  /* hover, small changes */
--transition-base: 200ms  /* standard transitions */
--transition-slow: 300ms  /* large movements */
```

## Integration Checklist

When adding a new component:
- [ ] Use CSS variables for colors
- [ ] Apply proper spacing using the scale
- [ ] Add hover states
- [ ] Add focus states (for inputs/buttons)
- [ ] Make responsive with breakpoints
- [ ] Test keyboard navigation
- [ ] Ensure color contrast
- [ ] Add loading/disabled states
- [ ] Test on mobile

## Common Patterns

### Card with Header
```jsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Title</h3>
    <span className="card-subtitle">Subtitle</span>
  </div>
  <!-- Content -->
</div>
```

### Grid Layout
```jsx
<div className="grid-2col">  <!-- or 3col, 4col, responsive -->
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
</div>
```

### Form Section
```jsx
<div className="order-form-section">
  <div className="form-field">
    <label className="form-label">Field Label</label>
    <input className="form-input" />
  </div>
</div>
```

---

For more examples, see the `src/reference-activate.jsx` file which contains the complete HTML reference design.
