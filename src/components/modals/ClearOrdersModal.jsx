import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, countriesAPI } from '../../services/api';
import '../../styles/modals/ClearOrdersModal.css';

function ClearOrdersModal({ onClose, onSuccess, mode = 'country', selectedOrders = [] }) {
  // mode: 'country' | 'selected' | 'all'
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderPreview, setOrderPreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const ORDER_STATUSES = [
    'Draft', 'Submitted', 'Forwarded to OSL', 'Approved',
    'Partially Fulfilled', 'Shipped', 'Completed', 'Cancelled'
  ];

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await countriesAPI.getAll();
      if (response.success) {
        setCountries(response.data.countries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handlePreview = async () => {
    if (mode === 'country' && !selectedCountry) {
      toast.error('Please select a country');
      return;
    }

    setIsLoading(true);
    try {
      const params = mode === 'all'
        ? { all: true }
        : {
            country: selectedCountry,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: selectedStatus || undefined
          };

      const response = await adminAPI.previewOrderDeletion(params);

      if (response.success) {
        setOrderPreview(response.data);
        setShowConfirm(true);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to preview orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!password) {
      toast.error('Please enter your password to confirm');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for deletion');
      return;
    }

    setIsLoading(true);
    try {
      const params = mode === 'all'
        ? {
            all: true,
            password,
            reason
          }
        : {
            country: selectedCountry,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: selectedStatus || undefined,
            password,
            reason
          };

      const response = await adminAPI.clearOrders(params);

      if (response.success) {
        toast.success(response.message || 'Orders deleted successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    if (mode === 'all') return '💣 Clear ALL Orders';
    return '🗑️ Clear Order History';
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal-content clear-orders-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{getModalTitle()}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        {!showConfirm ? (
          <div className="clear-orders-form">
            {mode === 'all' ? (
              <div className="danger-box">
                <strong>🚨 NUCLEAR OPTION</strong>
                <p>You are about to delete <strong>ALL ORDERS</strong> from <strong>ALL COUNTRIES</strong>.</p>
                <p>This is irreversible and will affect the entire system.</p>
              </div>
            ) : (
              <div className="warning-box">
                <strong>⚠️ Warning:</strong> This action will permanently delete orders and cannot be undone.
                Use this feature with extreme caution.
              </div>
            )}

            {mode === 'country' && (
              <div className="form-group">
                <label className="form-label">
                  Country <span className="required">*</span>
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="form-input"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country.name} value={country.name}>{country.name}</option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'country' && (
              <div className="form-group">
                <label className="form-label">Status (Optional)</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                >
                  <option value="">All Statuses</option>
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'country' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date From (Optional)</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="form-input"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date To (Optional)</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="form-input"
                      disabled={isLoading}
                      min={dateFrom}
                    />
                  </div>
                </div>

                <div className="info-box">
                  <strong>ℹ️ Info:</strong> Use filters to narrow down which orders to delete. If no filters are selected, ALL orders for the selected country will be deleted.
                </div>
              </>
            )}

            {mode === 'all' && (
              <div className="info-box" style={{ background: '#FEE2E2', borderColor: '#DC2626' }}>
                <strong>⚠️ Warning:</strong> This will delete ALL orders regardless of country, status, or date.
              </div>
            )}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
                Cancel
              </button>
              <button
                onClick={handlePreview}
                className="btn-primary"
                disabled={isLoading || (mode === 'country' && !selectedCountry)}
              >
                {isLoading ? 'Loading...' : 'Preview Orders'}
              </button>
            </div>
          </div>
        ) : (
          <div className="clear-orders-confirm">
            <div className="preview-section">
              <h3>Order Deletion Preview</h3>
              <div className="preview-stats">
                {mode === 'country' && (
                  <div className="preview-stat">
                    <span className="stat-label">Country:</span>
                    <span className="stat-value">{selectedCountry}</span>
                  </div>
                )}
                {mode === 'all' && (
                  <div className="preview-stat">
                    <span className="stat-label">Scope:</span>
                    <span className="stat-value danger">ALL COUNTRIES</span>
                  </div>
                )}
                {mode === 'country' && selectedStatus && (
                  <div className="preview-stat">
                    <span className="stat-label">Status:</span>
                    <span className="stat-value">{selectedStatus}</span>
                  </div>
                )}
                {mode === 'country' && dateFrom && (
                  <div className="preview-stat">
                    <span className="stat-label">Date Range:</span>
                    <span className="stat-value">{dateFrom} to {dateTo || 'now'}</span>
                  </div>
                )}
                <div className="preview-stat">
                  <span className="stat-label">Orders to Delete:</span>
                  <span className="stat-value danger">{orderPreview?.totalOrders || 0}</span>
                </div>
              </div>

              {orderPreview?.orders && orderPreview.orders.length > 0 && (
                <div className="preview-orders">
                  <p className="preview-label">Sample Orders (showing up to 5):</p>
                  <ul className="order-list">
                    {orderPreview.orders.slice(0, 5).map(order => (
                      <li key={order.id}>
                        {order.order_number} - {order.status} ({new Date(order.created_at).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="danger-box">
              <strong>🚨 Final Confirmation Required</strong>
              <p>You are about to permanently delete <strong>{orderPreview?.totalOrders}</strong> order(s). This action cannot be undone.</p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Reason for Deletion <span className="required">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why these orders are being deleted..."
                className="form-input"
                rows="3"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Your Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className="form-input"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword('');
                  setReason('');
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="btn-danger"
                disabled={isLoading || !password || !reason.trim()}
              >
                {isLoading ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClearOrdersModal;
