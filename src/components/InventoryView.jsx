import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { commoditiesAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import '../styles/InventoryView.css';

function InventoryView({ commodities: initialCommodities, warehouses = [], onUpdateStock, onUpdateWarehouseStock, onAddCommodity, onRefresh }) {
  const [commodities, setCommodities] = useState(initialCommodities || []);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editWarehouseStock, setEditWarehouseStock] = useState(null);
  const [editCommodity, setEditCommodity] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await commoditiesAPI.getCategories();
        if (response.success) {
          setCategories(response.data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch commodities with pagination/search
  const fetchCommodities = async (page = 1, search = searchTerm, category = selectedCategory) => {
    setIsLoading(true);
    try {
      const response = await commoditiesAPI.getAll({ 
        page, 
        limit: pagination.limit, 
        search: search || undefined, 
        category: category || undefined 
      });
      if (response.success) {
        setCommodities(response.data.commodities || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch commodities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCommodities(1);
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchCommodities(1, searchTerm, selectedCategory);
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    fetchCommodities(1, searchTerm, category);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCommodities(newPage);
    }
  };

  const handleUpdateStock = async (commodityId, currentStock) => {
    const newStock = prompt('Enter new stock quantity:', currentStock);
    if (newStock && !isNaN(newStock) && parseInt(newStock) >= 0) {
      await onUpdateStock(commodityId, parseInt(newStock));
      fetchCommodities(pagination.page);
    }
  };

  const handleWarehouseStockEdit = (commodity) => {
    setEditWarehouseStock({
      commodity,
      stocks: warehouses.map(w => {
        const ws = commodity.warehouse_stock?.find(s => s.warehouse_id === w.id);
        return {
          warehouseId: w.id,
          warehouseName: w.name,
          warehouseCode: w.code,
          quantity: ws?.quantity || 0
        };
      })
    });
  };

  const handleSaveWarehouseStock = async () => {
    if (!editWarehouseStock || !onUpdateWarehouseStock) return;
    
    for (const stock of editWarehouseStock.stocks) {
      await onUpdateWarehouseStock(editWarehouseStock.commodity.id, stock.warehouseId, stock.quantity);
    }
    setEditWarehouseStock(null);
    fetchCommodities(pagination.page);
  };

  const updateWarehouseQty = (warehouseId, quantity) => {
    setEditWarehouseStock(prev => ({
      ...prev,
      stocks: prev.stocks.map(s => 
        s.warehouseId === warehouseId ? { ...s, quantity: parseInt(quantity) || 0 } : s
      )
    }));
  };

  // Edit commodity handlers
  const handleEditCommodity = (commodity) => {
    setEditCommodity({
      id: commodity.id,
      name: commodity.name,
      category: commodity.category,
      unit: commodity.unit,
      price: commodity.price,
      description: commodity.description || '',
      storageRequirements: commodity.storage_requirements || '',
      shelfLife: commodity.shelf_life || ''
    });
  };

  const handleSaveCommodity = async () => {
    if (!editCommodity) return;
    try {
      const response = await commoditiesAPI.update(editCommodity.id, editCommodity);
      if (response.success) {
        setEditCommodity(null);
        fetchCommodities(pagination.page);
        if (onRefresh) onRefresh();
        toast.success('Commodity updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update commodity: ' + err.message);
    }
  };

  // Category management
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      const response = await commoditiesAPI.createCategory(newCategory);
      if (response.success) {
        setCategories([...categories, response.data.category]);
        setNewCategory({ name: '', description: '' });
        setShowCategoryModal(false);
        toast.success('Category created successfully');
      }
    } catch (err) {
      toast.error('Failed to create category: ' + err.message);
    }
  };

  const getStockStatus = (stock) => {
    if (stock < 50) return { label: 'Critical', className: 'critical', bg: '#FEE2E2', color: '#DC2626' };
    if (stock < 100) return { label: 'Low', className: 'low', bg: '#FEF3C7', color: '#D97706' };
    return { label: 'Normal', className: 'normal', bg: '#D1FAE5', color: '#059669' };
  };

  const showCommodityInfo = (commodity) => {
    setSelectedCommodity(commodity);
    setShowInfoModal(true);
  };

  return (
    <div className="inventory-view">
      <div className="inventory-header">
        <h2 className="inventory-title">Inventory Management</h2>
        <div className="inventory-header-actions">
          <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary">
            + Add Category
          </button>
          <button onClick={onAddCommodity} className="inventory-add-btn">
            <span className="inventory-add-btn-icon">+</span> Add Commodity
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="inventory-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search commodities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">🔍</button>
        </div>
        <div className="filter-box">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="results-info">
          Showing {commodities.length} of {pagination.total} items
        </div>
      </div>

      <div className="inventory-table-container">
        {isLoading ? (
          <div className="loading-indicator">Loading...</div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Total Stock</th>
                {warehouses.map(w => (
                  <th key={w.id} className="warehouse-col">{w.code}</th>
                ))}
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {commodities.map(commodity => {
                const status = getStockStatus(commodity.stock);
                return (
                  <tr key={commodity.id}>
                    <td className="inventory-table-name">
                      <span className="commodity-name-with-info">
                        {commodity.name}
                        <button 
                          className="info-icon-btn" 
                          onClick={() => showCommodityInfo(commodity)}
                          title="View details"
                        >
                          ℹ️
                        </button>
                      </span>
                    </td>
                    <td className="inventory-table-category">{commodity.category}</td>
                    <td className="inventory-table-unit">{commodity.unit}</td>
                    <td className="inventory-table-price">${parseFloat(commodity.price).toFixed(2)}</td>
                    <td className={`inventory-table-stock ${status.className}`}>
                      {commodity.stock}
                    </td>
                    {warehouses.map(w => {
                      const ws = commodity.warehouse_stock?.find(s => s.warehouse_id === w.id);
                      const qty = ws?.quantity || 0;
                      return (
                        <td key={w.id} className="warehouse-stock-cell">
                          {qty}
                        </td>
                      );
                    })}
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="last-updated-cell">
                      <div>{formatDateTime(commodity.updated_at, { short: true })}</div>
                      {commodity.last_updated_by_name && (
                        <small className="updated-by">by {commodity.last_updated_by_name}</small>
                      )}
                    </td>
                    <td>
                      <div className="inventory-actions">
                        <button
                          onClick={() => handleEditCommodity(commodity)}
                          className="inventory-edit-btn"
                          title="Edit commodity"
                        >
                          ✏️
                        </button>
                        {warehouses.length > 0 ? (
                          <button
                            onClick={() => handleWarehouseStockEdit(commodity)}
                            className="inventory-update-btn"
                          >
                            Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStock(commodity.id, commodity.stock)}
                            className="inventory-update-btn"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <div className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Commodity Info Modal */}
      {showInfoModal && selectedCommodity && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedCommodity.name}</h2>
              <button onClick={() => setShowInfoModal(false)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="commodity-info-grid">
                <div className="info-row">
                  <label>Category</label>
                  <span>{selectedCommodity.category}</span>
                </div>
                <div className="info-row">
                  <label>Unit</label>
                  <span>{selectedCommodity.unit}</span>
                </div>
                <div className="info-row">
                  <label>Price</label>
                  <span>${parseFloat(selectedCommodity.price).toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <label>Last Updated</label>
                  <span>{formatDateTime(selectedCommodity.updated_at, { short: true })}</span>
                </div>
                {selectedCommodity.last_updated_by_name && (
                  <div className="info-row">
                    <label>Updated By</label>
                    <span>{selectedCommodity.last_updated_by_name}</span>
                  </div>
                )}
                {selectedCommodity.description && (
                  <div className="info-row full-width">
                    <label>Description</label>
                    <p>{selectedCommodity.description}</p>
                  </div>
                )}
                {selectedCommodity.storage_requirements && (
                  <div className="info-row full-width">
                    <label>Storage Requirements</label>
                    <p>{selectedCommodity.storage_requirements}</p>
                  </div>
                )}
                {selectedCommodity.shelf_life && (
                  <div className="info-row full-width">
                    <label>Shelf Life</label>
                    <p>{selectedCommodity.shelf_life}</p>
                  </div>
                )}
                <div className="info-row full-width">
                  <label>Stock by Warehouse</label>
                  <div className="warehouse-stock-list">
                    {selectedCommodity.warehouse_stock?.length > 0 ? (
                      selectedCommodity.warehouse_stock.map((ws, idx) => (
                        <div key={idx} className="warehouse-stock-item">
                          <span>{ws.warehouse_name || ws.warehouse_code}</span>
                          <span className="stock-value">{ws.quantity} units</span>
                        </div>
                      ))
                    ) : (
                      <p>Total: {selectedCommodity.stock} units</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Commodity Modal */}
      {editCommodity && (
        <div className="modal-overlay" onClick={() => setEditCommodity(null)}>
          <div className="modal modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Commodity</h2>
              <button onClick={() => setEditCommodity(null)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={editCommodity.name}
                  onChange={(e) => setEditCommodity({...editCommodity, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editCommodity.category}
                    onChange={(e) => setEditCommodity({...editCommodity, category: e.target.value})}
                    className="form-select"
                  >
                    {categories.map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    value={editCommodity.unit}
                    onChange={(e) => setEditCommodity({...editCommodity, unit: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editCommodity.price}
                  onChange={(e) => setEditCommodity({...editCommodity, price: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={editCommodity.description}
                  onChange={(e) => setEditCommodity({...editCommodity, description: e.target.value})}
                  className="form-input"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Storage Requirements</label>
                  <input
                    type="text"
                    value={editCommodity.storageRequirements}
                    onChange={(e) => setEditCommodity({...editCommodity, storageRequirements: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Shelf Life</label>
                  <input
                    type="text"
                    value={editCommodity.shelfLife}
                    onChange={(e) => setEditCommodity({...editCommodity, shelfLife: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditCommodity(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSaveCommodity} className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Stock Edit Modal */}
      {editWarehouseStock && (
        <div className="modal-overlay" onClick={() => setEditWarehouseStock(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Stock: {editWarehouseStock.commodity.name}</h2>
              <button onClick={() => setEditWarehouseStock(null)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <p className="edit-stock-hint">Update stock quantities for each warehouse:</p>
              {editWarehouseStock.stocks.map(stock => (
                <div key={stock.warehouseId} className="warehouse-edit-row">
                  <label>{stock.warehouseName} ({stock.warehouseCode})</label>
                  <input
                    type="number"
                    min="0"
                    value={stock.quantity}
                    onChange={(e) => updateWarehouseQty(stock.warehouseId, e.target.value)}
                    className="warehouse-qty-input"
                  />
                </div>
              ))}
              <div className="warehouse-edit-total">
                Total: {editWarehouseStock.stocks.reduce((sum, s) => sum + s.quantity, 0)} units
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditWarehouseStock(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSaveWarehouseStock} className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Category</h2>
              <button onClick={() => setShowCategoryModal(false)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="e.g., Vaccines"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Brief description of the category"
                  className="form-input"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCategoryModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleAddCategory} className="btn btn-primary">Add Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryView;
