# CSS Variables Guide

## Complete Reference of All CSS Variables

This guide provides a comprehensive list of all CSS variables defined in the styling system, making it easy to customize colors, spacing, sizing, and animations.

## Color Variables

### Primary Colors
```css
--accent-primary: #0f5bff;        /* Main action color - blue */
--accent-primary-dark: #0b49cc;   /* Darker shade for hover states */
--accent-primary-light: #eaf1ff;  /* Light background shade */
```

**Usage:**
```css
background: var(--accent-primary);        /* Use for main buttons */
color: var(--accent-primary);             /* Use for links */
background: var(--accent-primary-light);  /* Use for hover backgrounds */
```

### Semantic Colors
```css
--accent-secondary: #17b26a;    /* Success/positive actions - green */
--accent-warning: #f79009;      /* Warnings/cautions - orange */
--accent-error: #f04438;        /* Errors/destructive - red */
--info: #0093D5;                /* Information - light blue */
```

**Usage:**
```css
/* Success state */
.status-badge.success {
  background: var(--accent-secondary);
}

/* Warning state */
.alert.warning {
  border-left-color: var(--accent-warning);
}

/* Error state */
.form-input.error {
  border-color: var(--accent-error);
}
```

### Neutral Surface Colors
```css
--surface-primary: #ffffff;      /* Card backgrounds, modals */
--surface-secondary: #f5f7fb;    /* Page/section backgrounds */
--surface-tertiary: #fbfdff;     /* Light backgrounds, form sections */
```

**Usage:**
```css
/* Cards and modals */
.card {
  background: var(--surface-primary);
  border: 1px solid var(--border-primary);
}

/* Page background */
body {
  background: var(--surface-secondary);
}

/* Light form sections */
.order-form-section {
  background: var(--surface-tertiary);
}
```

### Text Colors
```css
--text-primary: #1c2333;      /* Main text - dark gray */
--text-secondary: #7c879b;    /* Secondary text - medium gray */
--text-tertiary: #a5adb8;     /* Tertiary text - light gray */
```

**Usage:**
```css
/* Headings and main content */
h1, h2, h3, p {
  color: var(--text-primary);
}

/* Labels and secondary info */
label, .subtitle {
  color: var(--text-secondary);
}

/* Placeholder text */
::placeholder {
  color: var(--text-tertiary);
}
```

### Border Colors
```css
--border-primary: #e8edf5;    /* Standard borders, dividers */
--border-secondary: #d9e7fb;  /* Stronger borders, special tables */
```

**Usage:**
```css
/* Standard borders */
.card {
  border: 1px solid var(--border-primary);
}

/* Table borders */
.who-form {
  border: 2px solid var(--border-secondary);
}
```

## Spacing Variables

### Spacing Scale
```css
/* Micro spacing */
8px   - Gap between small elements
12px  - Form input height offset, small gaps
14px  - Border lines, small paddings

/* Standard spacing */
16px  - Default padding, standard gaps
18px  - Card padding, medium spacing
20px  - Section padding, list gaps

/* Large spacing */
24px  - Page margins, section spacing
28px  - Page section gaps
32px  - Featured section spacing
```

**Usage in CSS:**
```css
.dashboard {
  padding: 26px;        /* Section padding */
  gap: 22px;            /* Section gaps */
}

.card {
  padding: 18px;        /* Card padding */
  gap: 16px;            /* Internal gaps */
}

.form-field {
  gap: 8px;             /* Label to input */
  margin-bottom: 16px;  /* Field spacing */
}
```

**Helper Classes:**
```css
.p-4   { padding: 16px; }
.p-5   { padding: 20px; }
.m-4   { margin: 16px; }
.gap-4 { gap: 16px; }
```

## Size Variables

### Border Radius
```css
--radius-xs: 6px;    /* Minimal rounding - small elements */
--radius-sm: 10px;   /* Small rounding - form inputs */
--radius-md: 14px;   /* Standard rounding - cards, buttons */
--radius-lg: 20px;   /* Large rounding - sections */
--radius-xl: 28px;   /* Extra large - full height buttons */
```

**Usage:**
```css
input, select {
  border-radius: var(--radius-md);  /* Form controls */
}

.card {
  border-radius: var(--radius-lg);  /* Cards */
}

button {
  border-radius: var(--radius-md);
  height: 42px;
}

.pill {
  border-radius: 999px;  /* Fully rounded */
}
```

### Height Constants
```css
/* Standard heights */
32px  - Small elements, pills
34px  - Button options
40px  - Form inputs (regular)
42px  - Standard buttons
46px  - Large form inputs
48px  - Header cells, large buttons
```

### Width Constants
```css
/* Sidebar and sidebars */
250px  - Sidebar width (desktop)
280px  - Filter panel width
```

## Shadow Variables

### Shadow Elevation System
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 6px rgba(15, 91, 255, 0.05);
--shadow-md: 0 6px 18px rgba(15, 91, 255, 0.08);
--shadow-lg: 0 10px 25px rgba(15, 91, 255, 0.1);
--shadow-xl: 0 14px 40px rgba(16, 24, 40, 0.08);
```

**Usage:**
```css
/* Light shadow - default state */
.card {
  box-shadow: var(--shadow-sm);
}

/* Elevated shadow - hover state */
.card:hover {
  box-shadow: var(--shadow-md);
}

/* Strong shadow - modal or overlay */
.modal {
  box-shadow: var(--shadow-xl);
}
```

### Shadow Application Rules
- **Default state**: Use `--shadow-sm` or none
- **Hover state**: Use `--shadow-md`
- **Active state**: Use `--shadow-lg`
- **Modal/Overlay**: Use `--shadow-xl`

## Animation Variables

### Transition Timings
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage:**
```css
/* Quick feedback (hover, small changes) */
button:hover {
  transition: all var(--transition-fast);
}

/* Standard transitions (most interactions) */
.card {
  transition: all var(--transition-base);
}

/* Large movements (expand, collapse) */
.modal {
  transition: all var(--transition-slow);
}
```

### Easing Functions
```css
/* cubic-bezier(0.4, 0, 0.2, 1) */
/* Recommended for all animations */
/* Fast start, smooth deceleration */
/* Used in all transition variables */
```

## Customization Examples

### Changing the Primary Color
To use a different primary color throughout the app:

```css
:root {
  --accent-primary: #5b21b6;        /* Purple instead of blue */
  --accent-primary-dark: #4c1d95;
  --accent-primary-light: #f3e8ff;
}
```

### Changing Spacing Scale
To make the app more compact:

```css
:root {
  /* Reduce all spacing by 25% */
  --spacing-xs: 6px;   /* was 8px */
  --spacing-sm: 9px;   /* was 12px */
  --spacing-md: 12px;  /* was 16px */
  --spacing-lg: 15px;  /* was 20px */
  --spacing-xl: 18px;  /* was 24px */
}
```

### Changing Border Radius
For a more modern (smaller radius) look:

```css
:root {
  --radius-xs: 4px;    /* was 6px */
  --radius-sm: 6px;    /* was 10px */
  --radius-md: 8px;    /* was 14px */
  --radius-lg: 12px;   /* was 20px */
  --radius-xl: 16px;   /* was 28px */
}
```

### Creating a Dark Theme
Add to your CSS:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --surface-primary: #1a1f2e;
    --surface-secondary: #131820;
    --surface-tertiary: #0f1419;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --text-tertiary: #6b7280;
    --border-primary: #374151;
    --border-secondary: #4b5563;
  }
}
```

## Responsive Breakpoints

### Media Query Breakpoints
```css
/* Mobile first approach */
/* No media query for mobile (< 768px) */

/* Tablets and above */
@media (min-width: 768px) { }

/* Desktops and above */
@media (min-width: 1200px) { }

/* Large desktops */
@media (min-width: 1920px) { }
```

### Responsive Variable Adjustments
```css
@media (max-width: 768px) {
  :root {
    /* Smaller spacing on mobile */
    --spacing-md: 12px;  /* was 16px */
    --spacing-lg: 16px;  /* was 20px */
    
    /* Smaller radius on mobile */
    --radius-lg: 12px;   /* was 20px */
    
    /* Slightly smaller font */
    --font-size-base: 14px;
  }
}
```

## Advanced Usage

### Creating New Component Variants
Using CSS variables, you can create component variants:

```css
.btn-primary {
  background: var(--accent-primary);
  color: white;
  border: 1px solid var(--accent-primary);
  transition: all var(--transition-base);
}

.btn-primary:hover {
  background: var(--accent-primary-dark);
  border-color: var(--accent-primary-dark);
  box-shadow: 0 0 0 3px var(--accent-primary-light);
}
```

### Conditional Styling
Using CSS variables for conditions:

```css
.status-badge {
  padding: 0 10px;
  border-radius: 999px;
  height: 28px;
}

.status-badge.success {
  background: rgba(23, 178, 106, 0.1);
  color: var(--accent-secondary);
}

.status-badge.error {
  background: rgba(240, 68, 56, 0.1);
  color: var(--accent-error);
}
```

### Dynamic Theme Switching
JavaScript to switch themes:

```javascript
// Light theme
document.documentElement.style.setProperty('--text-primary', '#1c2333');
document.documentElement.style.setProperty('--surface-primary', '#ffffff');

// Dark theme
document.documentElement.style.setProperty('--text-primary', '#f3f4f6');
document.documentElement.style.setProperty('--surface-primary', '#1a1f2e');
```

## Best Practices

1. **Always use variables** - Never hardcode colors or spacing
2. **Use semantic naming** - Use --accent-primary not --blue-500
3. **Maintain hierarchy** - Primary > secondary > tertiary
4. **Consistent spacing** - Use the scale, don't create new values
5. **Document changes** - If you modify variables, update this guide
6. **Test themes** - Test with custom variable values
7. **Performance** - Variables are efficient for theming

## Quick Copy-Paste Reference

```css
/* Colors */
color: var(--text-primary);
background: var(--accent-primary);
border: 1px solid var(--border-primary);

/* Spacing */
padding: 16px;         /* var(--spacing-md) */
margin: 20px;          /* var(--spacing-lg) */
gap: 12px;             /* var(--spacing-sm) */

/* Sizing */
border-radius: 14px;   /* var(--radius-md) */
height: 42px;          /* Standard button height */

/* Transitions */
transition: all var(--transition-base);

/* Shadows */
box-shadow: var(--shadow-sm);
```

## Version History

- **v1.0** - Initial CSS variable system (March 15, 2026)

---

For implementation examples, see COMPONENT_STYLES.md
For design details, see UI_IMPROVEMENTS.md
