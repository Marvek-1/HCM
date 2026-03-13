import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, countriesAPI, warehouseAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import WarehouseManagement from './WarehouseManagement';
import ClearOrdersModal from './modals/ClearOrdersModal';
import Loading from './Loading';
import '../styles/AdminView.css';

// OSL Admin Level labels
const OSL_LEVELS = [
  { value: 0, label: 'Level 0 - Super Admin (Full privileges)' },
  { value: 1, label: 'Level 1 - Admin (No fulfillment qty adjust)' },
  { value: 2, label: 'Level 2 - Viewer (View & download only)' }
];

function AdminView() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [logPagination, setLogPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [showClearOrdersModal, setShowClearOrdersModal] = useState(false);
  const [clearOrdersMode, setClearOrdersMode] = useState('country'); // 'country' | 'all'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [newUser, setNewUser] = useState({ email: '', name: '', role: '', country: '', oslAdminLevel: 0, warehouseId: '' });

  // Fetch users
  const fetchUsers = async (page = 1, overrides = {}) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getUsers({
        search: overrides.search !== undefined ? overrides.search : (searchTerm || undefined),
        role: overrides.role !== undefined ? overrides.role : (roleFilter || undefined),
        isActive: overrides.isActive !== undefined ? overrides.isActive : (statusFilter === '' ? undefined : statusFilter === 'active'),
        page,
        limit: pagination.limit
      });
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getActivityLogs({ page, limit: logPagination.limit });
      if (response.success) {
        setActivityLogs(response.data.logs);
        setLogPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const response = await countriesAPI.getAll();
      if (response.success) {
        setCountries(response.data.countries);
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseAPI.getAll();
      if (response.success) {
        setWarehouses(response.data.warehouses);
      }
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchCountries();
    fetchWarehouses();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'activity') {
      fetchActivityLogs();
    }
  }, [activeTab]);

  // Handle search
  const handleSearch = () => {
    fetchUsers(1);
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.role) {
      toast.error('Email, name, and role are required');
      return;
    }

    if (newUser.role === 'Country Office' && !newUser.country) {
      toast.error('Country is required for Country Office users');
      return;
    }

    if (newUser.role === 'OSL Team' && !newUser.warehouseId) {
      toast.error('Warehouse is required for OSL Team users');
      return;
    }

    try {
      const userData = {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        country: newUser.country
      };

      // Include OSL admin level and warehouse for OSL Team users
      if (newUser.role === 'OSL Team') {
        userData.oslAdminLevel = parseInt(newUser.oslAdminLevel) || 0;
        userData.warehouseId = parseInt(newUser.warehouseId);
      }

      const response = await adminAPI.createUser(userData);
      if (response.success) {
        toast.success(`User created! Temp password: ${response.data.tempPassword}`, { duration: 10000 });
        setShowCreateModal(false);
        setNewUser({ email: '', name: '', role: '', country: '', oslAdminLevel: 0, warehouseId: '' });
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const userData = {
        name: selectedUser.name,
        role: selectedUser.role,
        country: selectedUser.country,
        isActive: selectedUser.is_active
      };

      // Include OSL admin level and warehouse for OSL Team users
      if (selectedUser.role === 'OSL Team') {
        userData.oslAdminLevel = parseInt(selectedUser.osl_admin_level) ?? 0;
        userData.warehouseId = selectedUser.warehouse_id ? parseInt(selectedUser.warehouse_id) : null;
      }

      const response = await adminAPI.updateUser(selectedUser.id, userData);
      if (response.success) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  // Handle reset password
  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password for this user? They will receive an email with a temporary password.')) {
      return;
    }

    try {
      const response = await adminAPI.resetPassword(userId);
      if (response.success) {
        toast.success(`Password reset! New temp password: ${response.data.tempPassword}`, { duration: 10000 });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this user?`)) {
      return;
    }

    try {
      if (user.is_active) {
        await adminAPI.deactivateUser(user.id);
      } else {
        await adminAPI.activateUser(user.id);
      }
      toast.success(`User ${action}d successfully`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.message || `Failed to ${action} user`);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deletePassword) {
      toast.error('Password confirmation is required');
      return;
    }

    try {
      const response = await adminAPI.deleteUser(selectedUser.id, {
        confirmPassword: deletePassword,
        reason: deleteReason
      });
      if (response.success) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setSelectedUser(null);
        setDeletePassword('');
        setDeleteReason('');
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  // Handle quick role change
  const handleQuickRoleChange = async (userId, currentRole, newRole) => {
    if (currentRole === newRole) return;

    if (!window.confirm(`Change user role from "${currentRole}" to "${newRole}"? This will take effect immediately.`)) {
      return;
    }

    try {
      const userData = { role: newRole };

      // If changing to OSL Team, set default OSL level
      if (newRole === 'OSL Team') {
        userData.oslAdminLevel = 0;
      }

      // If changing from Country Office, clear country
      if (currentRole === 'Country Office' && newRole !== 'Country Office') {
        userData.country = null;
      }

      const response = await adminAPI.updateUser(userId, userData);
      if (response.success) {
        toast.success('User role updated successfully');
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user role');
    }
  };

  // Get role badge style
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Super Admin':
        return { background: '#7C3AED', color: 'white' };
      case 'OSL Team':
        return { background: '#059669', color: 'white' };
      case 'Laboratory Team':
        return { background: '#0284C7', color: 'white' };
      case 'Country Office':
        return { background: '#EA580C', color: 'white' };
      default:
        return { background: '#6B7280', color: 'white' };
    }
  };

  return (
    <div className="admin-view">
      <div className="admin-header">
        <h2 className="admin-title">System Administration</h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_users}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active_users}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.country_office_users}</div>
            <div className="stat-label">Country Office</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.lab_users}</div>
            <div className="stat-label">Lab Team</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.osl_users}</div>
            <div className="stat-label">OSL Team</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active_last_week}</div>
            <div className="stat-label">Active (7 days)</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'warehouses' ? 'active' : ''}`}
          onClick={() => setActiveTab('warehouses')}
        >
          🏢 Warehouse Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🗑️ Order Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📋 Activity Logs
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-content">
          {/* Filters */}
          <div className="admin-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">🔍</button>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { 
                const newRole = e.target.value;
                setRoleFilter(newRole); 
                fetchUsers(1, { role: newRole || undefined }); 
              }}
              className="filter-select"
            >
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="OSL Team">OSL Team</option>
              <option value="Laboratory Team">Laboratory Team</option>
              <option value="Country Office">Country Office</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { 
                const newStatus = e.target.value;
                setStatusFilter(newStatus); 
                fetchUsers(1, { isActive: newStatus === '' ? undefined : newStatus === 'active' }); 
              }}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              + Create User
            </button>
          </div>

          {/* Users Table */}
          <div className="admin-table-container">
            {isLoading ? (
              <Loading message="Loading users..." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={!user.is_active ? 'inactive-row' : ''}>
                      <td className="user-name">
                        {user.name}
                        {user.must_change_password && (
                          <span className="password-change-badge" title="Must change password">🔑</span>
                        )}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="role-cell">
                          <select
                            value={user.role}
                            onChange={(e) => handleQuickRoleChange(user.id, user.role, e.target.value)}
                            className="role-select"
                            title="Quick role change"
                          >
                            <option value="Country Office">Country Office</option>
                            <option value="Laboratory Team">Laboratory Team</option>
                            <option value="OSL Team">OSL Team</option>
                            <option value="Super Admin">Super Admin</option>
                          </select>
                          {user.role === 'OSL Team' && user.osl_admin_level !== null && (
                            <span className="osl-level-badge" title={`OSL Level ${user.osl_admin_level}`}>
                              L{user.osl_admin_level}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {user.role === 'OSL Team' && user.warehouse_id ? (
                          <span title="Warehouse Location">
                            📦 {warehouses.find(w => w.id === user.warehouse_id)?.name || `Warehouse #${user.warehouse_id}`}
                          </span>
                        ) : (
                          user.country || '-'
                        )}
                      </td>
                      <td>
                        <span className={`status-indicator ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="last-login">{formatDateTime(user.last_login) || 'Never'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => { setSelectedUser({...user}); setShowEditModal(true); }}
                            className="action-btn edit"
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="action-btn reset"
                            title="Reset password"
                          >
                            🔐
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                            title={user.is_active ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.is_active ? '🚫' : '✅'}
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                            className="action-btn delete"
                            title="Delete user permanently"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="admin-content">
          <div className="admin-table-container">
            {isLoading ? (
              <Loading message="Loading activity logs..." />
            ) : (
              <table className="admin-table activity-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map(log => (
                    <tr key={log.id}>
                      <td className="timestamp">{formatDateTime(log.created_at)}</td>
                      <td>
                        <div className="log-user">
                          <span className="log-user-name">{log.user_name || 'System'}</span>
                          <span className="log-user-email">{log.user_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`action-badge ${log.action.replace('_', '-')}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{log.entity_type ? `${log.entity_type} #${log.entity_id}` : '-'}</td>
                      <td className="details-cell">
                        {log.details ? (
                          <span className="details-preview" title={typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}>
                            {(() => {
                              try {
                                const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                                const keys = Object.keys(details || {});
                                return keys.length > 0 ? `${keys.slice(0, 2).join(', ')}...` : 'No details';
                              } catch (e) {
                                return 'Invalid data';
                              }
                            })()}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="ip-address">{log.ip_address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Log Pagination */}
          {logPagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchActivityLogs(logPagination.page - 1)}
                disabled={logPagination.page === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {logPagination.page} of {logPagination.totalPages}
              </span>
              <button
                onClick={() => fetchActivityLogs(logPagination.page + 1)}
                disabled={logPagination.page === logPagination.totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warehouse Management Tab */}
      {activeTab === 'warehouses' && (
        <div className="admin-content">
          <WarehouseManagement />
        </div>
      )}

      {/* Order Management Tab */}
      {activeTab === 'orders' && (
        <div className="admin-content">
          <div className="order-management-header">
            <h3>Order History Management</h3>
            <p className="section-description">
              Select specific orders to delete or clear orders by country/all records.
            </p>
          </div>

          <div className="warning-section">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h4>Critical Action</h4>
              <p>Deleting orders will permanently remove them and all related data. This cannot be undone.</p>
            </div>
          </div>

          <div className="order-management-actions">
            <button
              type="button"
              onClick={(e) => {
                console.log('🔘 Clear by Country button clicked');
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ Event prevented and stopped');
                setClearOrdersMode('country');
                console.log('✅ Mode set to country');
                // Small delay to ensure click event completes before modal renders
                setTimeout(() => {
                  console.log('✅ Opening modal now...');
                  setShowClearOrdersModal(true);
                }, 10);
              }}
              className="btn-danger"
            >
              🗑️ Clear by Country
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm('⚠️ WARNING: This will delete ALL orders from ALL countries!\n\nAre you absolutely sure?')) {
                  setClearOrdersMode('all');
                  setTimeout(() => {
                    setShowClearOrdersModal(true);
                  }, 10);
                }
              }}
              className="btn-danger"
              style={{ marginLeft: '10px' }}
            >
              💣 Clear All Orders
            </button>
          </div>

          <div className="info-section">
            <h4>Deletion Options:</h4>
            <ul>
              <li><strong>Clear by Country:</strong> Delete all orders for a specific country (with optional date range)</li>
              <li><strong>Clear All Orders:</strong> Nuclear option - deletes ALL orders from ALL countries</li>
            </ul>
            <p className="note">
              <strong>Note:</strong> All deletions are logged and require your password confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@who.int"
                  className="form-input"
                />
                <small className="form-hint">Must be a @who.int email address</small>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="form-select"
                >
                  <option value="">-- Select Role --</option>
                  <option value="Country Office">Country Office</option>
                  <option value="Laboratory Team">Laboratory Team</option>
                  <option value="OSL Team">OSL Team</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              {newUser.role === 'OSL Team' && (
                <>
                  <div className="form-group">
                    <label className="form-label">OSL Admin Level *</label>
                    <select
                      value={newUser.oslAdminLevel}
                      onChange={(e) => setNewUser({...newUser, oslAdminLevel: parseInt(e.target.value)})}
                      className="form-select"
                    >
                      {OSL_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    <small className="form-hint">
                      Level 0: Full access | Level 1: No qty adjustments | Level 2: View only
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warehouse Location *</label>
                    <select
                      value={newUser.warehouseId}
                      onChange={(e) => setNewUser({...newUser, warehouseId: e.target.value})}
                      className="form-select"
                    >
                      <option value="">-- Select Warehouse --</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.code} - {warehouse.name}
                        </option>
                      ))}
                    </select>
                    <small className="form-hint">
                      Select the warehouse where this OSL user is located
                    </small>
                  </div>
                </>
              )}
              {newUser.role === 'Country Office' && (
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <select
                    value={newUser.country}
                    onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                    className="form-select"
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.name}>{country.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="info-box">
                <p>A temporary password will be generated and sent to the user's email address.</p>
                <p>The user will be required to change their password upon first login.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateUser} className="btn btn-primary">
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  disabled
                  className="form-input disabled"
                />
                <small className="form-hint">Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                  className="form-select"
                >
                  <option value="Country Office">Country Office</option>
                  <option value="Laboratory Team">Laboratory Team</option>
                  <option value="OSL Team">OSL Team</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              {selectedUser.role === 'OSL Team' && (
                <>
                  <div className="form-group">
                    <label className="form-label">OSL Admin Level</label>
                    <select
                      value={selectedUser.osl_admin_level ?? 0}
                      onChange={(e) => setSelectedUser({...selectedUser, osl_admin_level: parseInt(e.target.value)})}
                      className="form-select"
                    >
                      {OSL_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                    <small className="form-hint">
                      Level 0: Full access | Level 1: No qty adjustments | Level 2: View only
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Warehouse Location</label>
                    <select
                      value={selectedUser.warehouse_id || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, warehouse_id: e.target.value})}
                      className="form-select"
                    >
                      <option value="">-- Select Warehouse --</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.code} - {warehouse.name}
                        </option>
                      ))}
                    </select>
                    <small className="form-hint">
                      Select the warehouse where this OSL user is located
                    </small>
                  </div>
                </>
              )}
              {selectedUser.role === 'Country Office' && (
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    value={selectedUser.country || ''}
                    disabled
                    className="form-input disabled"
                  />
                  <small className="form-hint">Country cannot be changed</small>
                </div>
              )}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedUser.is_active}
                    onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.checked})}
                  />
                  Active Account
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateUser} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ Delete User</h2>
              <button onClick={() => setShowDeleteModal(false)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="warning-box">
                <p><strong>Warning:</strong> This action cannot be undone!</p>
                <p>You are about to permanently delete:</p>
                <div className="user-info-box">
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Deletion (optional)</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g., User requested account deletion, duplicate account, etc."
                  className="form-input"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Your Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password to confirm deletion"
                    className="form-input"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="password-toggle-btn"
                    tabIndex={-1}
                  >
                    {showDeletePassword ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
                  </button>
                </div>
                <small className="form-hint">
                  For security, you must enter your password to delete a user.
                </small>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteReason('');
                  setSelectedUser(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="btn btn-danger"
                disabled={!deletePassword}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Orders Modal */}
      {showClearOrdersModal && (
        <ClearOrdersModal
          mode={clearOrdersMode}
          onClose={() => setShowClearOrdersModal(false)}
          onSuccess={() => {
            // Refresh data if needed
            toast.success('Order history cleared successfully');
          }}
        />
      )}
    </div>
  );
}

export default AdminView;
