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
  'High': { color: '#DC2626', bg: '#FEE2E2' },
  'Medium': { color: '#D97706', bg: '#FEF3C7' },
  'Low': { color: '#059669', bg: '#D1FAE5' },
};

const DEV_UNLOCK_ROLES = import.meta.env.VITE_DEV_UNLOCK_ROLES === 'true';

// Navigation items by role
export const getNavItems = (role) => {
  if (DEV_UNLOCK_ROLES) {
    return [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'orders', label: 'All Orders' },
      { id: 'drafts', label: '📝 Drafts' },
      { id: 'catalogue', label: '📦 Catalogue' },
      { id: 'inventory', label: 'Inventory Management' },
      { id: 'operations', label: '📊 Operations Center' },
      { id: 'admin', label: '⚙️ Administration' },
    ];
  }

  switch (role) {
    case 'Country Office':
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: 'My Orders' },
        { id: 'drafts', label: '📝 Drafts' },
        { id: 'catalogue', label: '📦 Catalogue' },
      ];
    case 'Laboratory Team':
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: 'All Country Orders' },
        { id: 'drafts', label: '📝 Drafts' },
        { id: 'catalogue', label: '📦 Catalogue' },
      ];
    case 'OSL Team':
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: 'Pending Approvals' },
        { id: 'catalogue', label: '📦 Catalogue' },
        { id: 'inventory', label: 'Inventory Management' },
        { id: 'operations', label: '📊 Operations Center' },
      ];
    case 'Super Admin':
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: 'All Orders' },
        { id: 'catalogue', label: '📦 Catalogue' },
        { id: 'inventory', label: 'Inventory Management' },
        { id: 'admin', label: '⚙️ Administration' },
      ];
    default:
      return [];
  }
};
