// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEV_AUTH_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';
const DEV_BYPASS_USER = {
  id: 1,
  email: import.meta.env.VITE_DEV_AUTH_EMAIL || 'super.admin@who.int',
  name: import.meta.env.VITE_DEV_AUTH_NAME || 'Development Admin',
  role: import.meta.env.VITE_DEV_AUTH_ROLE || 'Super Admin',
  country: import.meta.env.VITE_DEV_AUTH_COUNTRY || 'Nigeria',
  oslAdminLevel: 0
};

// Token management
const getToken = () => localStorage.getItem('hcoms_token');
const setToken = (token) => localStorage.setItem('hcoms_token', token);
const removeToken = () => localStorage.removeItem('hcoms_token');

const getUser = () => {
  const user = localStorage.getItem('hcoms_user');
  return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('hcoms_user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('hcoms_user');

// Base fetch function with authentication
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Handle 401 - Token expired
  if (response.status === 401) {
    removeToken();
    removeUser();
    if (!DEV_AUTH_BYPASS) {
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    if (DEV_AUTH_BYPASS) {
      setToken('dev-auth-bypass');
      setUser(DEV_BYPASS_USER);
      return {
        success: true,
        data: {
          user: DEV_BYPASS_USER,
          token: 'dev-auth-bypass'
        }
      };
    }

    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response;
  },

  logout: async () => {
    if (DEV_AUTH_BYPASS) {
      removeToken();
      removeUser();
      return;
    }

    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
      removeUser();
    }
  },

  // Get stored user from localStorage
  getStoredUser: () => getUser() || (DEV_AUTH_BYPASS ? DEV_BYPASS_USER : null),

  // Update stored user in localStorage
  updateStoredUser: (user) => setUser(user),

  // Check if authenticated
  isAuthenticated: () => DEV_AUTH_BYPASS || !!getToken(),

  register: async (userData) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return apiFetch('/auth/me');
  },

  getLoginHistory: async () => {
    return apiFetch('/auth/login-history');
  },

  getActiveSessions: async () => {
    return apiFetch('/auth/sessions');
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiFetch('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  forgotPassword: async (email) => {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  getLoginMonitoring: async () => {
    return apiFetch('/auth/monitoring');
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    return apiFetch('/orders');
  },

  getById: async (id) => {
    return apiFetch(`/orders/${id}`);
  },

  create: async (orderData, idempotencyKey) => {
    return apiFetch('/orders', {
      method: 'POST',
      headers: {
        ...(idempotencyKey && { 'X-Idempotency-Key': idempotencyKey }),
      },
      body: JSON.stringify(orderData),
    });
  },

  validateOrder: async (orderData, sessionId) => {
    return apiFetch('/orders/validate', {
      method: 'POST',
      body: JSON.stringify({ ...orderData, sessionId }),
    });
  },

  getReconciliation: async (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/orders/${id}/reconciliation?${query}`);
  },

  applyEmergencyOverride: async (id, justification) => {
    return apiFetch(`/orders/${id}/emergency-override`, {
      method: 'POST',
      body: JSON.stringify({ justification }),
    });
  },

  getKPIs: async () => {
    return apiFetch('/orders/analytics/kpis');
  },

  getTrends: async (days = 90) => {
    return apiFetch(`/orders/analytics/trends?days=${days}`);
  },

  forwardToOSL: async (id, warehouseId, notes) => {
    return apiFetch(`/orders/${id}/forward`, {
      method: 'POST',
      body: JSON.stringify({ warehouseId, notes }),
    });
  },

  reject: async (id, notes) => {
    return apiFetch(`/orders/${id}/reject`, { 
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Split fulfill item from multiple warehouses
  splitFulfillItem: async (itemId, fulfillments) => {
    return apiFetch(`/orders/items/${itemId}/split-fulfill`, {
      method: 'POST',
      body: JSON.stringify({ fulfillments }),
    });
  },

  // Smart auto-fulfill based on proximity and stock
  smartFulfillOrder: async (id) => {
    return apiFetch(`/orders/${id}/smart-fulfill`, { method: 'POST' });
  },

  // Create shipment
  createShipment: async (orderId, shipmentData) => {
    return apiFetch(`/orders/${orderId}/shipments`, {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },

  // Update shipment
  updateShipment: async (shipmentId, data) => {
    return apiFetch(`/orders/shipments/${shipmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  markShipped: async (id) => {
    return apiFetch(`/orders/${id}/ship`, { method: 'POST' });
  },

  getStatistics: async () => {
    return apiFetch('/orders/statistics');
  },

  // Get quantity modification history
  getModificationHistory: async (orderId) => {
    return apiFetch(`/orders/${orderId}/modifications`);
  },

  // Get intervention types
  getInterventionTypes: async () => {
    return apiFetch('/orders/intervention-types');
  },

  // Item editing
  updateItem: async (orderId, itemId, data) => {
    return apiFetch(`/orders/${orderId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  addItem: async (orderId, data) => {
    return apiFetch(`/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  removeItem: async (orderId, itemId) => {
    return apiFetch(`/orders/${orderId}/items/${itemId}`, { method: 'DELETE' });
  },

  // ==================== DRAFT ORDER METHODS ====================

  // Get all drafts
  getDrafts: async () => {
    return apiFetch('/orders/drafts');
  },

  // Get draft by ID
  getDraftById: async (id) => {
    return apiFetch(`/orders/drafts/${id}`);
  },

  // Save draft (create new or update existing)
  saveDraft: async (draftData) => {
    if (draftData.id) {
      return apiFetch(`/orders/drafts/${draftData.id}`, {
        method: 'PUT',
        body: JSON.stringify(draftData),
      });
    }
    return apiFetch('/orders/drafts', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  },

  // Delete draft
  deleteDraft: async (id) => {
    return apiFetch(`/orders/drafts/${id}`, { method: 'DELETE' });
  },

  // Submit draft
  submitDraft: async (id, { pateoRef, pateoFile }) => {
    return apiFetch(`/orders/drafts/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ pateoRef, pateoFile }),
    });
  },

  // ==================== WORKFLOW STAGE METHODS ====================

  // Confirm PATEO verification
  confirmPateo: async (orderId, { verificationNotes, budgetVerified }) => {
    return apiFetch(`/orders/${orderId}/confirm-pateo`, {
      method: 'POST',
      body: JSON.stringify({ verificationNotes, budgetVerified }),
    });
  },

  // Confirm payment
  confirmPayment: async (orderId, { paymentReference, paymentNotes }) => {
    return apiFetch(`/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentReference, paymentNotes }),
    });
  },

  // Confirm contact/delivery info
  confirmContact: async (orderId) => {
    return apiFetch(`/orders/${orderId}/confirm-contact`, { method: 'POST' });
  },

  // Confirm fulfillment
  confirmFulfillment: async (orderId) => {
    return apiFetch(`/orders/${orderId}/confirm-fulfillment`, { method: 'POST' });
  },

  // Get packaging checklist
  getPackagingChecklist: async (orderId) => {
    return apiFetch(`/orders/${orderId}/packaging`);
  },

  // Update packaging checklist
  updatePackaging: async (orderId, { items }) => {
    return apiFetch(`/orders/${orderId}/packaging`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  // Confirm packaging complete
  confirmPackaging: async (orderId) => {
    return apiFetch(`/orders/${orderId}/confirm-packaging`, { method: 'POST' });
  },

  // Book shipping
  bookShipping: async (orderId) => {
    return apiFetch(`/orders/${orderId}/book-shipping`, { method: 'POST' });
  },

  // Confirm shipping (items dispatched)
  confirmShipping: async (orderId, shippingData) => {
    return apiFetch(`/orders/${orderId}/confirm-shipping`, {
      method: 'POST',
      body: JSON.stringify(shippingData),
    });
  },

  // Carrier confirms delivery
  confirmCarrierDelivery: async (orderId, { notes }) => {
    return apiFetch(`/orders/${orderId}/carrier-delivery`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Country confirms receipt
  confirmCountryReceipt: async (orderId, { notes }) => {
    return apiFetch(`/orders/${orderId}/confirm-receipt`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Submit feedback
  submitFeedback: async (orderId, feedbackData) => {
    return apiFetch(`/orders/${orderId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // Get feedback
  getFeedback: async (orderId) => {
    return apiFetch(`/orders/${orderId}/feedback`);
  },

  // Request amendment (Lab returns to Country for adjustments)
  requestAmendment: async (orderId, { notes }) => {
    return apiFetch(`/orders/${orderId}/request-amendment`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  // Cancel order (Country Office)
  cancelOrder: async (orderId, { reason }) => {
    return apiFetch(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Resubmit order after amendment (Country Office)
  resubmitOrder: async (orderId) => {
    return apiFetch(`/orders/${orderId}/resubmit`, {
      method: 'POST',
    });
  },

  // Delete item from order (with justification)
  deleteItem: async (orderId, itemId, { reason }) => {
    return apiFetch(`/orders/${orderId}/items/${itemId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Validate items received by country
  validateItemsReceived: async (orderId, { items }) => {
    return apiFetch(`/orders/${orderId}/validate-items`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};

// Commodities API
export const commoditiesAPI = {
  getAll: async ({ search, category, page, limit, simple } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (simple) params.append('simple', simple);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/commodities${query}`);
  },

  getById: async (id) => {
    return apiFetch(`/commodities/${id}`);
  },

  create: async (commodityData) => {
    return apiFetch('/commodities', {
      method: 'POST',
      body: JSON.stringify(commodityData),
    });
  },

  update: async (id, commodityData) => {
    return apiFetch(`/commodities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(commodityData),
    });
  },

  updateStock: async (id, stock) => {
    return apiFetch(`/commodities/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  },

  updateWarehouseStock: async (id, warehouseId, quantity) => {
    return apiFetch(`/commodities/${id}/warehouse-stock`, {
      method: 'PATCH',
      body: JSON.stringify({ warehouseId, quantity }),
    });
  },

  delete: async (id) => {
    return apiFetch(`/commodities/${id}`, { method: 'DELETE' });
  },

  getLowStock: async (threshold = 100) => {
    return apiFetch(`/commodities/low-stock?threshold=${threshold}`);
  },

  getCategories: async () => {
    return apiFetch('/commodities/categories');
  },

  createCategory: async (categoryData) => {
    return apiFetch('/commodities/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (id, categoryData) => {
    return apiFetch(`/commodities/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (id) => {
    return apiFetch(`/commodities/categories/${id}`, { method: 'DELETE' });
  },

  getWarehouses: async () => {
    return apiFetch('/commodities/warehouses');
  },
};

// Admin API
export const adminAPI = {
  // User management
  getUsers: async ({ search, role, isActive, page, limit } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (isActive !== undefined) params.append('isActive', isActive);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/admin/users${query}`);
  },

  getUser: async (id) => {
    return apiFetch(`/admin/users/${id}`);
  },

  createUser: async (userData) => {
    return apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return apiFetch(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  resetPassword: async (id) => {
    return apiFetch(`/admin/users/${id}/reset-password`, {
      method: 'POST',
    });
  },

  deactivateUser: async (id, reason = '') => {
    return apiFetch(`/admin/users/${id}/deactivate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  activateUser: async (id) => {
    return apiFetch(`/admin/users/${id}/activate`, {
      method: 'POST',
    });
  },

  deleteUser: async (id, { confirmPassword, reason }) => {
    return apiFetch(`/admin/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmPassword, reason }),
    });
  },

  // Statistics
  getStats: async () => {
    return apiFetch('/admin/stats');
  },

  // Activity logs
  getActivityLogs: async ({ userId, action, entityType, startDate, endDate, page, limit } = {}) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (action) params.append('action', action);
    if (entityType) params.append('entityType', entityType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/admin/activity-logs${query}`);
  },

  // Profile management
  getProfile: async () => {
    return apiFetch('/admin/profile');
  },

  updateProfile: async (data) => {
    return apiFetch('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiFetch('/admin/profile/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Order management
  previewOrderDeletion: async ({ country, dateFrom, dateTo }) => {
    const params = new URLSearchParams();
    params.append('country', country);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    return apiFetch(`/admin/orders/preview-deletion?${params.toString()}`);
  },

  clearOrders: async ({ country, dateFrom, dateTo, password, reason }) => {
    return apiFetch('/admin/orders/clear', {
      method: 'POST',
      body: JSON.stringify({ country, dateFrom, dateTo, password, reason }),
    });
  },
};

// Countries API
export const countriesAPI = {
  getAll: async (region = null) => {
    const query = region ? `?region=${encodeURIComponent(region)}` : '';
    return apiFetch(`/countries${query}`);
  },

  getRegions: async () => {
    return apiFetch('/countries/regions');
  },

  getById: async (id) => {
    return apiFetch(`/countries/${id}`);
  },

  create: async (countryData) => {
    return apiFetch('/countries', {
      method: 'POST',
      body: JSON.stringify(countryData),
    });
  },

  update: async (id, countryData) => {
    return apiFetch(`/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(countryData),
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiFetch('/health');
};

// OSL Operations API
export const oslAPI = {
  // Dashboard
  getDashboard: async () => {
    return apiFetch('/osl/dashboard');
  },

  // Suppliers
  getSuppliers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/osl/suppliers${queryString ? `?${queryString}` : ''}`);
  },

  getSupplier: async (id) => {
    return apiFetch(`/osl/suppliers/${id}`);
  },

  createSupplier: async (data) => {
    return apiFetch('/osl/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSupplier: async (id, data) => {
    return apiFetch(`/osl/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Purchase Orders
  getPurchaseOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/osl/purchase-orders${queryString ? `?${queryString}` : ''}`);
  },

  getPurchaseOrder: async (id) => {
    return apiFetch(`/osl/purchase-orders/${id}`);
  },

  createPurchaseOrder: async (data) => {
    return apiFetch('/osl/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePurchaseOrderStatus: async (id, status) => {
    return apiFetch(`/osl/purchase-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  receivePurchaseOrder: async (id, data) => {
    return apiFetch(`/osl/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Stock Movements
  getStockMovements: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/osl/stock-movements${queryString ? `?${queryString}` : ''}`);
  },

  createStockMovement: async (data) => {
    return apiFetch('/osl/stock-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Outbound / Shipments
  getOutboundShipments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/osl/outbound${queryString ? `?${queryString}` : ''}`);
  },

  updateShipment: async (id, data) => {
    return apiFetch(`/osl/outbound/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Chat/Messages API
export const chatAPI = {
  // Get messages for an order
  getMessages: async (orderId) => {
    return apiFetch(`/chat/orders/${orderId}`);
  },

  // Get message count for an order
  getMessageCount: async (orderId) => {
    return apiFetch(`/chat/orders/${orderId}/count`);
  },

  // Get message counts for multiple orders (batch)
  getMessageCountsBatch: async (orderIds) => {
    if (!orderIds || orderIds.length === 0) {
      return { success: true, data: { counts: {} } };
    }
    return apiFetch(`/chat/counts/batch?orderIds=${orderIds.join(',')}`);
  },

  // Send a message
  sendMessage: async (orderId, message) => {
    return apiFetch(`/chat/orders/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Update a message
  updateMessage: async (messageId, message) => {
    return apiFetch(`/chat/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    return apiFetch(`/chat/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  // Delete entire conversation (Super Admin only)
  deleteConversation: async (orderId, hardDelete = false) => {
    return apiFetch(`/chat/orders/${orderId}/conversation?hardDelete=${hardDelete}`, {
      method: 'DELETE',
    });
  },

  // Mark messages as read
  markAsRead: async (orderId) => {
    return apiFetch(`/chat/orders/${orderId}/read`, {
      method: 'POST',
    });
  },

  // Get notifications
  getNotifications: async (limit = 20, unreadOnly = false) => {
    return apiFetch(`/chat/notifications?limit=${limit}&unreadOnly=${unreadOnly}`);
  },

  // Get notification count
  getNotificationCount: async () => {
    return apiFetch('/chat/notifications/count');
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    return apiFetch(`/chat/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    return apiFetch('/chat/notifications/read-all', {
      method: 'POST',
    });
  },
};

// Warehouse API
export const warehouseAPI = {
  // Get all warehouses
  getAll: async () => {
    return apiFetch('/warehouses');
  },

  // Get warehouse by ID with inventory
  getById: async (id) => {
    return apiFetch(`/warehouses/${id}`);
  },

  // Create warehouse (Super Admin only)
  create: async (data) => {
    return apiFetch('/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update warehouse (Super Admin only)
  update: async (id, data) => {
    return apiFetch(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Toggle warehouse active status (Super Admin only)
  toggleStatus: async (id) => {
    return apiFetch(`/warehouses/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  // Get warehouse stock/inventory
  getStock: async (id) => {
    return apiFetch(`/warehouses/${id}/stock`);
  },

  // Update stock for a commodity in warehouse (Super Admin only)
  updateStock: async (id, commodityId, quantity) => {
    return apiFetch(`/warehouses/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ commodityId, quantity }),
    });
  },
};

// AI API
export const aiAPI = {
  analyzeOutbreak: async (outbreakData) => {
    return apiFetch('/ai/analyze-outbreak', {
      method: 'POST',
      body: JSON.stringify({ outbreakData }),
    });
  },

  chat: async (messages, options = {}) => {
    return apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, options }),
    });
  },
};

// Signals API
export const signalsAPI = {
  getAll: async () => {
    return apiFetch('/signals');
  },
  getByCountry: async (country) => {
    return apiFetch(`/signals/${country}`);
  },
  getRisk: async (country) => {
    return apiFetch(`/signals/risk/${country}`);
  },
};

// Analytics API
export const analyticsAPI = {
  getKPIs: async () => {
    return apiFetch('/orders/analytics/kpis');
  },
  getTrends: async (days = 90) => {
    return apiFetch(`/orders/analytics/trends?days=${days}`);
  },
};

// Assets API
export const assetsAPI = {
  getCatalogue: async () => {
    return apiFetch('/assets/catalogue');
  },
  validate: async (data) => {
    return apiFetch('/assets/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Session API
export const sessionAPI = {
  init: async (data) => {
    return apiFetch('/sessions/init', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  validate: async (sessionId) => {
    return apiFetch(`/sessions/validate/${sessionId}`);
  },
  extend: async (sessionId, minutes = 5) => {
    return apiFetch(`/sessions/extend/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    });
  },
  release: async (sessionId) => {
    return apiFetch(`/sessions/release/${sessionId}`, {
      method: 'DELETE',
    });
  },
  queue: async (protocol) => {
    return apiFetch(`/sessions/queue/${protocol}`);
  },
};


export default {
  auth: authAPI,
  orders: ordersAPI,
  commodities: commoditiesAPI,
  admin: adminAPI,
  countries: countriesAPI,
  osl: oslAPI,
  chat: chatAPI,
  warehouse: warehouseAPI,
  ai: aiAPI,
  signals: signalsAPI,
  analytics: analyticsAPI,
  assets: assetsAPI,
  sessions: sessionAPI,
  healthCheck,
};
