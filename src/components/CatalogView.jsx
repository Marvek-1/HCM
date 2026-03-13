import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { commoditiesAPI } from '../services/api';
import '../styles/CatalogView.css';

function CatalogView({ commodities: initialCommodities, cart, setCart, onCreateOrder }) {
  const [commodities, setCommodities] = useState(initialCommodities || []);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showInfo, setShowInfo] = useState(null);
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
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    fetchCommodities(1, searchTerm, newCategory);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCommodities(newPage);
    }
  };

  const addToCart = (commodity) => {
    const existing = cart.find(c => c.commodity.id === commodity.id);
    if (existing) {
      setCart(cart.map(c =>
        c.commodity.id === commodity.id ? { ...c, qty: c.qty + 1 } : c
      ));
      toast.success(`Added another ${commodity.name} to cart`);
    } else {
      setCart([...cart, { commodity, qty: 1 }]);
      toast.success(`${commodity.name} added to cart`);
    }
  };

  const closeInfoModal = () => setShowInfo(null);

  return (
    <div className="catalog-view">
      <div className="catalog-header">
        <h2 className="catalog-title">Commodity Catalog</h2>
        {cart.length > 0 && (
          <button onClick={onCreateOrder} className="catalog-proceed-btn">
            Proceed to Order ({cart.length} items)
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="catalog-search-bar">
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
        <div className="results-info">
          Showing {commodities.length} of {pagination.total} items
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="catalog-filters">
        <button
          onClick={() => handleCategoryFilter('')}
          className={`catalog-filter-btn ${selectedCategory === '' ? 'active' : ''}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id || cat.name}
            onClick={() => handleCategoryFilter(cat.name)}
            className={`catalog-filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Commodity Grid */}
      {isLoading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <div className="catalog-grid">
          {commodities.map(commodity => {
            const inCart = cart.find(c => c.commodity.id === commodity.id);
            const isLowStock = commodity.stock < 100;
            return (
              <div key={commodity.id} className="catalog-card">
                <div className="catalog-card-header">
                  <div className="catalog-card-category">{commodity.category}</div>
                  <button 
                    className="catalog-info-btn"
                    onClick={() => setShowInfo(commodity)}
                    title="View details"
                  >
                    ℹ️
                  </button>
                </div>
                <h3 className="catalog-card-name">{commodity.name}</h3>
                <div className="catalog-card-unit">{commodity.unit}</div>
                <div className="catalog-card-price">${parseFloat(commodity.price).toFixed(2)}</div>
                <div className={`catalog-card-stock ${isLowStock ? 'low-stock' : 'in-stock'}`}>
                  {isLowStock ? '⚠ Low Stock' : '✓ In Stock'} ({commodity.stock} units)
                </div>
                {/* Warehouse breakdown if available */}
                {commodity.warehouse_stock && commodity.warehouse_stock.length > 0 && (
                  <div className="catalog-card-warehouse-stock">
                    {commodity.warehouse_stock.map((ws, idx) => (
                      <span key={idx} className="warehouse-badge">
                        {ws.warehouse_code}: {ws.quantity}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => addToCart(commodity)}
                  className={`catalog-add-btn ${inCart ? 'in-cart' : ''}`}
                >
                  {inCart ? `In Cart (${inCart.qty})` : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}

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
      {showInfo && (
        <div className="modal-overlay" onClick={closeInfoModal}>
          <div className="modal modal-sm commodity-info-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{showInfo.name}</h2>
              <button onClick={closeInfoModal} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="commodity-info-section">
                <label>Category</label>
                <p>{showInfo.category}</p>
              </div>
              <div className="commodity-info-section">
                <label>Unit</label>
                <p>{showInfo.unit}</p>
              </div>
              <div className="commodity-info-section">
                <label>Price</label>
                <p>${parseFloat(showInfo.price).toFixed(2)}</p>
              </div>
              {showInfo.description && (
                <div className="commodity-info-section">
                  <label>Description</label>
                  <p>{showInfo.description}</p>
                </div>
              )}
              {showInfo.storage_requirements && (
                <div className="commodity-info-section">
                  <label>Storage Requirements</label>
                  <p>{showInfo.storage_requirements}</p>
                </div>
              )}
              {showInfo.shelf_life && (
                <div className="commodity-info-section">
                  <label>Shelf Life</label>
                  <p>{showInfo.shelf_life}</p>
                </div>
              )}
              {showInfo.last_updated_by_name && (
                <div className="commodity-info-section">
                  <label>Last Updated By</label>
                  <p>{showInfo.last_updated_by_name}</p>
                </div>
              )}
              <div className="commodity-info-section">
                <label>Stock by Warehouse</label>
                <div className="commodity-warehouse-list">
                  {showInfo.warehouse_stock && showInfo.warehouse_stock.length > 0 ? (
                    showInfo.warehouse_stock.map((ws, idx) => (
                      <div key={idx} className="warehouse-stock-row">
                        <span className="warehouse-name">{ws.warehouse_name}</span>
                        <span className="warehouse-qty">{ws.quantity} units</span>
                      </div>
                    ))
                  ) : (
                    <p>Total: {showInfo.stock} units</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogView;
