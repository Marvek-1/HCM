import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useContinuousScroll } from '../hooks/useContinuousScroll';
import { ChevronDown, ChevronUp, Pause, Play, Search, Grid3X3, ArrowLeft } from 'lucide-react';
import '../styles/Catalogue.css';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Map category names to image files in public/images/categories/
const CATEGORY_IMAGES = {
  'Biomedical Consumables': '/images/categories/biomedical-consumables.png',
  'Biomedical Equipment': '/images/categories/biomedical-equipment.jpeg',
  'Cold Chain Equipment': '/images/categories/cold-chain.webp',
  'Emergency Health Kits': '/images/categories/emergencyhelath-kits.png',
  'Field Support Material': '/images/categories/field-support-material.png',
  'IT & Communications': '/images/categories/field-support-material.png',
  'Lab & Diagnostics': '/images/categories/lab-diagnostics.png',
  'PPE': '/images/categories/ppe.png',
  'Pharmaceuticals': '/images/categories/biomedical-consumables.png',
  'Shelter & Field': '/images/categories/field-support-material.png',
  'Vehicles': '/images/categories/vehicles.png',
  'Visibility Materials': '/images/categories/visibility.png',
  'WASH & Water': '/images/categories/field-support-material.png',
  'Wellbeing': '/images/categories/well-being.png',
};

const getCategoryImage = (categoryName) => {
  if (CATEGORY_IMAGES[categoryName]) {
    return CATEGORY_IMAGES[categoryName];
  }
  const normalizedName = categoryName.toLowerCase().trim();
  for (const [key, value] of Object.entries(CATEGORY_IMAGES)) {
    if (key.toLowerCase().trim() === normalizedName) {
      return value;
    }
  }
  for (const [key, value] of Object.entries(CATEGORY_IMAGES)) {
    if (normalizedName.includes(key.toLowerCase().split(' ')[0]) || 
        key.toLowerCase().includes(normalizedName.split(' ')[0])) {
      return value;
    }
  }
  return '/images/categories/visibility.png';
};

// Fallback categories in case API is empty/slow
const FALLBACK_CATEGORIES = [
  { name: 'Biomedical Consumables', item_count: 15 },
  { name: 'Biomedical Equipment', item_count: 33 },
  { name: 'Cold Chain Equipment', item_count: 12 },
  { name: 'Emergency Health Kits', item_count: 8 },
  { name: 'PPE', item_count: 68 },
  { name: 'Vehicles', item_count: 5 }
];

function Catalogue() {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('scroll');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [direction, setDirection] = useState('down');

  const { containerRef, isPaused, handleMouseEnter, handleMouseLeave, togglePause, changeDirection } =
    useContinuousScroll({
      speed: 0.5,
      direction,
      pauseOnHover: true,
    });

  useEffect(() => {
    console.log('Fetching categories from:', `${API_BASE}/catalog/categories`);
    setCategoriesLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    fetch(`${API_BASE}/catalog/categories`, { signal: controller.signal })
      .then(r => {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(d => {
        console.log('Categories data received:', d);
        if (d.success && d.data?.categories && d.data.categories.length > 0) {
          setCategories(d.data.categories);
          setCategoriesError(null);
        } else {
          console.warn('API returned empty categories, using fallbacks');
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.error('Error fetching categories:', err);
          setCategories(FALLBACK_CATEGORIES); // Always fallback on error
        }
      })
      .finally(() => {
        setCategoriesLoading(false);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const fetchItems = useCallback(async () => {
    if (!selectedCategory && viewMode === 'grid') {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 12 });
        if (search) params.set('search', search);
        const res = await fetch(`${API_BASE}/catalog?${params}`);
        const data = await res.json();
        if (data.success) {
          setItems(data.data.items || []);
          setPagination(data.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setLoading(false);
      }
    } else if (selectedCategory) {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage, limit: 12 });
        params.set('category', selectedCategory.name);
        if (search) params.set('search', search);
        const res = await fetch(`${API_BASE}/catalog?${params}`);
        const data = await res.json();
        if (data.success) {
          setItems(data.data.items || []);
          setPagination(data.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [currentPage, search, selectedCategory, viewMode]);

  useEffect(() => {
    if (viewMode === 'grid') {
      fetchItems();
    }
  }, [fetchItems, viewMode]);

  const duplicatedCategories = categories.length > 0 
    ? [...categories, ...categories, ...categories]
    : [];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setViewMode('grid');
    setCurrentPage(1);
  };

  const handleBackToScroll = () => {
    setSelectedCategory(null);
    setViewMode('scroll');
    setSearch('');
  };

  const toggleDirection = () => {
    const newDir = direction === 'down' ? 'up' : 'down';
    setDirection(newDir);
    changeDirection(newDir);
  };

  const openDetail = async (item) => {
    setSelectedItem(item);
    setStockLoading(true);
    try {
      const res = await fetch(`${API_BASE}/catalog/item/${item.id}/stock`);
      const data = await res.json();
      setWarehouseStock(data.data?.stock || []);
    } catch {
      setWarehouseStock([]);
    } finally {
      setStockLoading(false);
    }
  };

  if (viewMode === 'scroll' && !selectedCategory) {
    if (categoriesLoading) {
      return (
        <div className="catalogue-scroll-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="catalogue-loading" style={{ color: 'white' }}>
            <div className="catalogue-loading-spinner" />
            <div>Loading categories...</div>
          </div>
        </div>
      );
    }

    if (categoriesError || categories.length === 0) {
      return (
        <div className="catalogue-scroll-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="catalogue-empty" style={{ color: 'white' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <div>{categoriesError || 'No categories available'}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#FFC20E', color: '#005A9C', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="catalogue-scroll-wrapper">
        <div className="catalogue-scroll-controls">
          <button className="catalogue-control-btn" onClick={togglePause} title={isPaused ? 'Play' : 'Pause'}>
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button className="catalogue-control-btn" onClick={toggleDirection} title="Change direction">
            {direction === 'down' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button className="catalogue-control-btn" onClick={() => setViewMode('grid')} title="Grid view">
            <Grid3X3 size={18} />
          </button>
        </div>
        <div ref={containerRef} className="catalogue-scroll-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <div className="catalogue-scroll-content" style={{ height: `${duplicatedCategories.length * 100}vh` }}>
            {duplicatedCategories.map((category, index) => {
              const categoryImage = getCategoryImage(category.name);
              return (
                <motion.div
                  key={`${category.name}-${index}`}
                  className="catalogue-scroll-item"
                  style={{ top: `${index * 100}vh` }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: false, margin: '-20%' }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="catalogue-scroll-bg">
                    <div className="catalogue-scroll-gradient" />
                    <img src={categoryImage} alt={category.name} className="catalogue-scroll-image" />
                  </div>
                  <div className="catalogue-scroll-text">
                    <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: false, margin: '-20%' }}>
                      {category.name}
                    </motion.h2>
                    <motion.div className="catalogue-scroll-line" initial={{ width: 0 }} whileInView={{ width: 96 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: false, margin: '-20%' }} />
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} viewport={{ once: false, margin: '-20%' }}>
                      {category.item_count} items available
                    </motion.p>
                    <motion.button className="catalogue-scroll-cta" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} viewport={{ once: false, margin: '-20%' }}>
                      View Category
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogue">
      <div className="catalogue-header">
        <div className="catalogue-header-left">
          {selectedCategory && (
            <button className="catalogue-back-btn" onClick={handleBackToScroll}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <div>
            <h1 className="catalogue-title">{selectedCategory ? selectedCategory.name : 'Catalogue'}</h1>
            <p className="catalogue-subtitle">{pagination.total} items available</p>
          </div>
        </div>
        <div className="catalogue-header-actions">
          <button className="catalogue-view-toggle" onClick={() => setViewMode(viewMode === 'scroll' ? 'grid' : 'scroll')}>
            {viewMode === 'scroll' ? <Grid3X3 size={18} /> : <ChevronDown size={18} />}
            {viewMode === 'scroll' ? 'Grid View' : 'Scroll View'}
          </button>
        </div>
      </div>
      <div className="catalogue-filters">
        <div className="catalogue-search-box">
          <Search size={18} className="catalogue-search-icon" />
          <input type="text" className="catalogue-search-input" placeholder="Search items..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <span className="catalogue-results-info">{loading ? 'Loading...' : `${pagination.total} items`}</span>
      </div>
      {loading ? (
        <div className="catalogue-loading">Loading catalogue...</div>
      ) : items.length === 0 ? (
        <div className="catalogue-empty"><div className="catalogue-empty-icon">📦</div><div>No items found</div></div>
      ) : (
        <>
          <div className="catalogue-grid">
            {items.map(item => (
              <div key={item.id} className="catalogue-card" onClick={() => openDetail(item)}>
                <div className="catalogue-card-image">
                  <img src={getCategoryImage(item.category)} alt={item.name} className="catalogue-card-img" />
                  <span className={`catalogue-card-badge ${item.availability || 'in_stock'}`}>
                    {item.availability === 'in_stock' ? 'In Stock' : item.availability === 'low' ? 'Low Stock' : item.availability === 'critical' ? 'Critical' : 'Out of Stock'}
                  </span>
                </div>
                <div className="catalogue-card-content">
                  <h3 className="catalogue-card-title">{item.name}</h3>
                  <p className="catalogue-card-category">{item.category}</p>
                  <div className="catalogue-card-footer">
                    <span className="catalogue-card-unit">{item.unit}</span>
                    <span className="catalogue-card-price">${Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="catalogue-pagination">
              <button className="catalogue-page-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>Previous</button>
              <span className="catalogue-page-info">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="catalogue-page-btn" disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
      {selectedItem && (
        <div className="catalogue-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="catalogue-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalogue-detail-header">
              <h2 className="catalogue-detail-title">{selectedItem.name}</h2>
              <button className="catalogue-detail-close" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            <div className="catalogue-detail-body">
              <div className="catalogue-detail-image">
                <img src={getCategoryImage(selectedItem.category)} alt={selectedItem.name} />
              </div>
              <div className="catalogue-detail-grid">
                <div className="catalogue-detail-item"><label>Category</label><span>{selectedItem.category}</span></div>
                <div className="catalogue-detail-item"><label>Unit</label><span>{selectedItem.unit}</span></div>
                <div className="catalogue-detail-item"><label>Price</label><span>${Number(selectedItem.price).toFixed(2)}</span></div>
                <div className="catalogue-detail-item"><label>Total Stock</label><span>{Number(selectedItem.stock).toLocaleString()}</span></div>
              </div>
              {selectedItem.description && (
                <div className="catalogue-detail-section"><label>Description</label><p>{selectedItem.description}</p></div>
              )}
              {(selectedItem.storage_requirements || selectedItem.shelf_life) && (
                <div className="catalogue-detail-section">
                  <label>Storage & Shelf Life</label>
                  <div className="catalogue-detail-tags">
                    {selectedItem.storage_requirements && selectedItem.storage_requirements !== 'N/A' && <span className="catalogue-tag">{selectedItem.storage_requirements}</span>}
                    {selectedItem.shelf_life && selectedItem.shelf_life !== 'N/A' && <span className="catalogue-tag">{selectedItem.shelf_life}</span>}
                  </div>
                </div>
              )}
              <div className="catalogue-detail-section">
                <label>Warehouse Stock</label>
                {stockLoading ? <p>Loading...</p> : warehouseStock.length === 0 ? <p>No warehouse data available</p> : (
                  <div className="catalogue-warehouse-list">
                    {warehouseStock.map((wh, i) => (
                      <div key={i} className="catalogue-warehouse-item">
                        <span>{wh.name} ({wh.code})</span>
                        <span className="catalogue-warehouse-qty">{Number(wh.quantity).toLocaleString()} {selectedItem.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalogue;
