import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';

// Get status style
export const getStatusStyle = (status) => {
  const config = STATUS_CONFIG[status] || { color: '#64748B', bg: '#F1F5F9' };
  return { color: config.color, background: config.bg };
};

// Get priority style
export const getPriorityStyle = (priority) => {
  const config = PRIORITY_CONFIG[priority] || { color: '#64748B', bg: '#F1F5F9' };
  return { color: config.color, background: config.bg };
};

// Get visible orders based on role
export const getVisibleOrders = (orders, currentUser) => {
  if (!currentUser) return [];
  
  switch (currentUser.role) {
    case 'Country Office':
      // Country office sees only their country's orders
      return orders.filter(o => o.country === currentUser.country);
    case 'Laboratory Team':
      // Lab team sees all country orders (submitted and beyond)
      return orders.filter(o => o.status !== 'Draft');
    case 'OSL Team':
      // OSL sees only orders forwarded by Lab team
      return orders.filter(o => ['Forwarded to OSL', 'Approved', 'Shipped', 'Completed'].includes(o.status));
    default:
      return [];
  }
};

// Get stats for dashboard based on role
export const getStats = (orders, commodities, currentUser) => {
  const visible = getVisibleOrders(orders, currentUser);
  
  if (currentUser?.role === 'Country Office') {
    return {
      total: visible.length,
      pending: visible.filter(o => ['Submitted', 'Under Review'].includes(o.status)).length,
      approved: visible.filter(o => o.status === 'Approved').length,
      shipped: visible.filter(o => ['Shipped', 'Completed'].includes(o.status)).length,
    };
  }
  
  if (currentUser?.role === 'Laboratory Team') {
    return {
      total: visible.length,
      pendingReview: visible.filter(o => o.status === 'Submitted').length,
      forwarded: visible.filter(o => o.status === 'Forwarded to OSL').length,
      processed: visible.filter(o => ['Approved', 'Shipped', 'Completed'].includes(o.status)).length,
    };
  }
  
  if (currentUser?.role === 'OSL Team') {
    const lowStock = commodities.filter(c => c.stock < 100).length;
    return {
      total: visible.length,
      pendingApproval: visible.filter(o => o.status === 'Forwarded to OSL').length,
      approved: visible.filter(o => o.status === 'Approved').length,
      lowStockItems: lowStock,
    };
  }
  
  return {};
};

// Calculate order total
export const calculateOrderTotal = (items) => {
  return items.reduce((sum, item) => sum + (item.commodity.price * item.qty), 0);
};

// Generate order ID
export const generateOrderId = () => {
  return `ORD-2024-${String(Date.now()).slice(-3)}`;
};

// Get current date in ISO format
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Format date with timestamp
 * @param {string|Date} dateStr - Date string or Date object
 * @param {object} options - Formatting options
 * @param {boolean} options.dateOnly - If true, show only date without time
 * @param {boolean} options.timeOnly - If true, show only time without date
 * @param {boolean} options.short - If true, use shorter format
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateStr, options = {}) => {
  if (!dateStr) return '-';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    
    const { dateOnly = false, timeOnly = false, short = false } = options;
    
    if (timeOnly) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    if (dateOnly) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: short ? 'short' : 'long',
        day: 'numeric'
      });
    }
    
    // Full date with timestamp (default)
    if (short) {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return '-';
  }
};

/**
 * Format date range (for delivery periods)
 * @param {string|Date} fromDate - Start date
 * @param {string|Date} toDate - End date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (fromDate, toDate) => {
  if (!fromDate && !toDate) return '-';
  
  const from = fromDate ? formatDateTime(fromDate, { dateOnly: true, short: true }) : null;
  const to = toDate ? formatDateTime(toDate, { dateOnly: true, short: true }) : null;
  
  if (from && to) return `${from} - ${to}`;
  if (from) return `From ${from}`;
  if (to) return `By ${to}`;
  return '-';
};

/**
 * Calculate time elapsed since a given date
 * @param {string|Date} dateStr - The start date
 * @param {object} options - Formatting options
 * @param {boolean} options.short - Use short format (1h vs 1 hour)
 * @param {boolean} options.suffix - Add "ago" suffix
 * @returns {string} Time elapsed string (e.g., "2hrs", "3 days", "1wk")
 */
export const getTimeElapsed = (dateStr, options = {}) => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    
    if (diffMs < 0) return ''; // Future date
    
    const { short = true, suffix = false } = options;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    let result;
    
    if (months >= 1) {
      result = short 
        ? `${months}mnth${months > 1 ? 's' : ''}`
        : `${months} month${months > 1 ? 's' : ''}`;
    } else if (weeks >= 1) {
      result = short 
        ? `${weeks}wk${weeks > 1 ? 's' : ''}`
        : `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else if (days >= 1) {
      result = short 
        ? `${days}d`
        : `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours >= 1) {
      result = short 
        ? `${hours}hr${hours > 1 ? 's' : ''}`
        : `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes >= 1) {
      result = short 
        ? `${minutes}min${minutes > 1 ? 's' : ''}`
        : `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      result = short ? 'just now' : 'just now';
    }
    
    return suffix ? `${result} ago` : result;
  } catch (e) {
    return '';
  }
};

/**
 * Get pending duration class based on elapsed time
 * @param {string|Date} dateStr - The start date
 * @returns {string} CSS class name for styling
 */
export const getPendingDurationClass = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days >= 7) return 'duration-critical'; // Over a week - critical
    if (days >= 3) return 'duration-warning';  // 3-7 days - warning
    if (hours >= 24) return 'duration-caution'; // 1-3 days - caution
    return 'duration-normal'; // Under 24 hours - normal
  } catch (e) {
    return '';
  }
};

/**
 * Calculate and format elapsed time since a given date
 * @param {string|Date} dateStr - Start date
 * @returns {object} { text: formatted string, urgency: 'low'|'medium'|'high'|'critical' }
 */
export const getElapsedTime = (dateStr) => {
  if (!dateStr) return { text: '', urgency: 'low' };
  
  try {
    const startDate = new Date(dateStr);
    if (isNaN(startDate.getTime())) return { text: '', urgency: 'low' };
    
    const now = new Date();
    const diffMs = now - startDate;
    
    // Convert to different units
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    let text = '';
    let urgency = 'low';
    
    if (diffMins < 1) {
      text = 'Just now';
      urgency = 'low';
    } else if (diffMins < 60) {
      text = `${diffMins}min${diffMins > 1 ? 's' : ''} ago`;
      urgency = 'low';
    } else if (diffHours < 24) {
      text = `${diffHours}hr${diffHours > 1 ? 's' : ''} ago`;
      urgency = diffHours >= 4 ? 'medium' : 'low';
    } else if (diffDays < 7) {
      text = `${diffDays}day${diffDays > 1 ? 's' : ''} ago`;
      urgency = diffDays >= 3 ? 'high' : 'medium';
    } else if (diffWeeks < 4) {
      text = `${diffWeeks}wk${diffWeeks > 1 ? 's' : ''} ago`;
      urgency = 'high';
    } else {
      text = `${diffMonths}mnth${diffMonths > 1 ? 's' : ''} ago`;
      urgency = 'critical';
    }
    
    return { text, urgency };
  } catch (e) {
    return { text: '', urgency: 'low' };
  }
};

/**
 * Check if an order is in a pending state that should show elapsed time
 * @param {string} status - Order status
 * @returns {boolean}
 */
export const isPendingStatus = (status) => {
  return ['Submitted', 'Forwarded to OSL', 'Partially Fulfilled'].includes(status);
};
