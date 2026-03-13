import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { warehouseAPI } from '../services/api';
import '../styles/WarehouseManagement.css';

function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    code: '',
    capacity: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const response = await warehouseAPI.getAll();
      if (response.success) {
        setWarehouses(response.data.warehouses);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarehouseStock = async (warehouseId) => {
    setIsLoading(true);
    try {
      const response = await warehouseAPI.getStock(warehouseId);
      if (response.success) {
        setWarehouseStock(response.data.stock);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch warehouse stock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Name and code are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await warehouseAPI.create(formData);
      if (response.success) {
        toast.success('Warehouse created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchWarehouses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create warehouse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Name and code are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await warehouseAPI.update(selectedWarehouse.id, formData);
      if (response.success) {
        toast.success('Warehouse updated successfully');
        setShowEditModal(false);
        setSelectedWarehouse(null);
        resetForm();
        fetchWarehouses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update warehouse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (warehouseId) => {
    setIsLoading(true);
    try {
      const response = await warehouseAPI.toggleStatus(warehouseId);
      if (response.success) {
        toast.success(response.message);
        fetchWarehouses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle warehouse status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStock = (warehouse) => {
    setSelectedWarehouse(warehouse);
    fetchWarehouseStock(warehouse.id);
    setShowStockModal(true);
  };

  const handleEditClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      location: warehouse.location || '',
      code: warehouse.code,
      capacity: warehouse.capacity || '',
      contactName: warehouse.contact_name || '',
      contactPhone: warehouse.contact_phone || '',
      contactEmail: warehouse.contact_email || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      code: '',
      capacity: '',
      contactName: '',
      contactPhone: '',
      contactEmail: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="warehouse-management">
      <div className="warehouse-header">
        <h2>Warehouse Management</h2>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn btn-primary">
          + Add Warehouse
        </button>
      </div>

      {isLoading && warehouses.length === 0 ? (
        <div className="loading">Loading warehouses...</div>
      ) : warehouses.length === 0 ? (
        <div className="empty-state">
          <p>No warehouses found. Create your first warehouse to get started.</p>
        </div>
      ) : (
        <div className="warehouse-grid">
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className={`warehouse-card ${!warehouse.is_active ? 'inactive' : ''}`}>
              <div className="warehouse-card-header">
                <div className="warehouse-code">{warehouse.code}</div>
                <span className={`status-badge ${warehouse.is_active ? 'active' : 'inactive'}`}>
                  {warehouse.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="warehouse-card-body">
                <h3>{warehouse.name}</h3>
                {warehouse.location && (
                  <div className="warehouse-info">
                    <span className="info-label">📍 Location:</span>
                    <span className="info-value">{warehouse.location}</span>
                  </div>
                )}
                {warehouse.capacity && (
                  <div className="warehouse-info">
                    <span className="info-label">📦 Capacity:</span>
                    <span className="info-value">{warehouse.capacity.toLocaleString()} units</span>
                  </div>
                )}
                <div className="warehouse-info">
                  <span className="info-label">📊 Total Stock:</span>
                  <span className="info-value stock-count">{warehouse.total_stock || 0}</span>
                </div>
                {warehouse.contact_name && (
                  <div className="warehouse-info">
                    <span className="info-label">👤 Contact:</span>
                    <span className="info-value">{warehouse.contact_name}</span>
                  </div>
                )}
              </div>

              <div className="warehouse-card-actions">
                <button onClick={() => handleViewStock(warehouse)} className="btn btn-sm btn-secondary">
                  View Stock
                </button>
                <button onClick={() => handleEditClick(warehouse)} className="btn btn-sm btn-outline">
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(warehouse.id)}
                  className={`btn btn-sm ${warehouse.is_active ? 'btn-warning' : 'btn-success'}`}
                >
                  {warehouse.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Warehouse Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowCreateModal(false)}>
          <div className="modal-content warehouse-modal">
            <div className="modal-header">
              <h3>Create New Warehouse</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Warehouse Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Nairobi Main Warehouse"
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Code * (2-10 chars, uppercase)</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., NBO"
                    maxLength="10"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity (units)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    placeholder="e.g., 10000"
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="e.g., Nairobi, Kenya"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleFormChange}
                  placeholder="Warehouse manager name"
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleFormChange}
                    placeholder="+254 XXX XXX XXX"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleFormChange}
                    placeholder="email@example.com"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleCreate} className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Warehouse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Warehouse Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowEditModal(false)}>
          <div className="modal-content warehouse-modal">
            <div className="modal-header">
              <h3>Edit Warehouse</h3>
              <button onClick={() => setShowEditModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Warehouse Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Code * (2-10 chars, uppercase)</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    maxLength="10"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity (units)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleFormChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleUpdate} className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Warehouse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && selectedWarehouse && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowStockModal(false)}>
          <div className="modal-content stock-modal">
            <div className="modal-header">
              <h3>📦 {selectedWarehouse.name} - Inventory</h3>
              <button onClick={() => setShowStockModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <div className="loading">Loading stock...</div>
              ) : warehouseStock.length === 0 ? (
                <div className="empty-state">No stock items found in this warehouse.</div>
              ) : (
                <div className="stock-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Commodity</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th className="text-right">Quantity</th>
                        <th className="text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouseStock.map((item, idx) => (
                        <tr key={idx} className={item.quantity === 0 ? 'out-of-stock' : ''}>
                          <td>{item.name}</td>
                          <td><span className="category-badge">{item.category}</span></td>
                          <td>{item.unit}</td>
                          <td className="text-right">
                            <span className={`quantity ${item.quantity === 0 ? 'zero' : ''}`}>
                              {item.quantity || 0}
                            </span>
                          </td>
                          <td className="text-right">${((item.quantity || 0) * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan="3"><strong>Total Value</strong></td>
                        <td className="text-right"><strong>{warehouseStock.reduce((sum, i) => sum + (i.quantity || 0), 0)}</strong></td>
                        <td className="text-right">
                          <strong>${warehouseStock.reduce((sum, i) => sum + ((i.quantity || 0) * i.price), 0).toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowStockModal(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarehouseManagement;
