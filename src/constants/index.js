// WHO Brand Colors
export const WHO_BLUE = '#009ADE';
export const WHO_NAVY = '#1A2B4A';
export const WHO_LIGHT = '#E8F4FC';

// Status configurations
export const STATUS_CONFIG = {
  'Draft': { color: '#6B7280', bg: '#F3F4F6' },
  'Submitted': { color: '#D97706', bg: '#FEF3C7' },
  'Under Review': { color: '#7C3AED', bg: '#EDE9FE' },
  'Forwarded to OSL': { color: '#2563EB', bg: '#DBEAFE' },
  'Approved': { color: '#059669', bg: '#D1FAE5' },
  'Rejected': { color: '#DC2626', bg: '#FEE2E2' },
  'Shipped': { color: '#0891B2', bg: '#CFFAFE' },
  'Completed': { color: '#166534', bg: '#BBF7D0' },
};

// Priority configurations
export const PRIORITY_CONFIG = {
  'EMERGENCY': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  'ROUTINE': { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
  'STUDY': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const DEV_UNLOCK_ROLES = import.meta.env.VITE_DEV_UNLOCK_ROLES === 'true';

// Navigation configuration with categories
export const NAV_CATEGORIES = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: '🏠',
    items: [
      { id: 'dashboard', label: 'Main Dashboard', icon: '📊' }
    ]
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: '🏷️',
    items: [
      { id: 'catalog', label: 'Product Catalog', icon: '🛍️' }
    ]
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '📋',
    items: [
      { id: 'orders', label: 'Orders Management', icon: '🧾' },
      { id: 'drafts', label: 'Draft Orders', icon: '📝' }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: '📦',
    items: [
      { id: 'inventory', label: 'Inventory Management', icon: '📦' }
    ]
  },
  {
    id: 'osl',
    label: 'OSL Operations',
    icon: '⚡',
    items: [
      { id: 'operations', label: 'OSL Operations', icon: '🧪' }
    ]
  },
  {
    id: 'warehouse',
    label: 'Warehouse',
    icon: '🏭',
    items: [
      { id: 'warehouses', label: 'Warehouse Management', icon: '🏭' }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '⚙️',
    items: [
      { id: 'admin', label: 'Admin Dashboard', icon: '🛡️' }
    ]
  }
];

export const getNavItems = (role) => {
  // Deep clone categories to filter items based on role
  const categories = JSON.parse(JSON.stringify(NAV_CATEGORIES));

  return categories.map(category => {
    category.items = category.items.filter(item => {
      // Role-based filtering logic
      if (role === 'Country Office') {
        return ['dashboard', 'catalog', 'orders', 'drafts'].includes(item.id);
      }
      if (role === 'Laboratory Team') {
        return ['dashboard', 'catalog', 'orders', 'drafts'].includes(item.id);
      }
      if (role === 'OSL Team') {
        return ['dashboard', 'catalog', 'orders', 'inventory', 'operations', 'warehouses'].includes(item.id);
      }
      if (role === 'Super Admin') {
        return true; // Access to everything
      }
      return false;
    });
    return category;
  }).filter(cat => cat.items.length > 0);
};

// Comprehensive African Currency Configuration
export const CURRENCY_CONFIG = {
  USD: { symbol: '$', rate: 1, label: 'US Dollar', region: 'Global' },
  ZAR: { symbol: 'R ', rate: 19.12, label: 'South African Rand', region: 'Southern Africa' },
  KES: { symbol: 'KSh ', rate: 132.50, label: 'Kenyan Shilling', region: 'East Africa' },
  NGN: { symbol: '₦', rate: 1450.00, label: 'Nigerian Naira', region: 'West Africa' },
  EGP: { symbol: 'E£', rate: 47.85, label: 'Egyptian Pound', region: 'North Africa' },
  GHS: { symbol: 'GH₵', rate: 14.20, label: 'Ghanaian Cedi', region: 'West Africa' },
  RWF: { symbol: 'FRw ', rate: 1295.00, label: 'Rwandan Franc', region: 'East Africa' },
  UGX: { symbol: 'USh ', rate: 3850.00, label: 'Ugandan Shilling', region: 'East Africa' },
  ETB: { symbol: 'Br ', rate: 56.80, label: 'Ethiopian Birr', region: 'East Africa' },
  XOF: { symbol: 'CFA ', rate: 608.50, label: 'West African CFA Franc', region: 'West Africa' },
  XAF: { symbol: 'FCFA ', rate: 608.50, label: 'Central African CFA Franc', region: 'Central Africa' }
};
