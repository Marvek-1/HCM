import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { commoditiesAPI } from '../services/api';
import { CURRENCY_CONFIG } from '../constants';
import '../styles/CatalogView.css';

function CatalogView({ commodities: initialCommodities, cart, setCart, onCreateOrder, onViewItem }) {
  const [commodities, setCommodities] = useState(initialCommodities || []);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState('USD');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchCommodities(1, searchTerm, selectedCategory);
  };

  const handleCategoryFilter = (category) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    fetchCommodities(1, searchTerm, newCategory);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCommodities(newPage);
    }
  };

  const formatPrice = (priceUSD) => {
    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.USD;
    const converted = (parseFloat(priceUSD) * config.rate).toFixed(0);
    return `${config.symbol}${converted}`;
  };

  const getShapeClass = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('kit') || cat.includes('emergency')) return 'kit';
    if (cat.includes('mask') || cat.includes('ppe')) return 'mask';
    if (cat.includes('glove')) return 'glove';
    return '';
  };

  return (
    <div className="catalog-view" id="page-products">
      <section className="topbar mb-2">
        <div className="page-title">
          <h1>Products</h1>
          <p>Medical supply catalog with emergency kits, PPE, detail view, and multi-currency pricing.</p>
        </div>
        <div className="top-actions">
          <div className="pill">Medical Inventory</div>
          {cart.length > 0 && (
             <button onClick={onCreateOrder} className="pill" style={{ background: 'var(--blue)', color: 'white', border: 'none', cursor: 'pointer' }}>
               Checkout ({cart.length})
             </button>
          )}
        </div>
      </section>

      <div className="products-shell" id="productsCatalogShell">
        <section className="products-hero">
          <div className="hero-banner" style={{ border: 'none' }}>
            <div className="hero-copy">
              <div className="eyebrow">Medical products • sterile supply</div>
              <h2>Smart care inventory with a premium clinical shelf.</h2>
              <p>Borrowing that glossy product-landing drama from your references, but kept disciplined inside the dashboard frame.</p>
              <div className="hero-actions">
                <button className="hero-btn primary" onClick={() => document.getElementById('catalog-main-grid').scrollIntoView({ behavior: 'smooth' })}>Browse catalog</button>
                <button className="hero-btn" onClick={() => handleCategoryFilter('Emergency Health Kits')}>Emergency kits</button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="device-screen">
                <div className="device-ui">
                  <div className="ui-line" style={{ width: '56%' }}></div>
                  <div className="ui-box"></div>
                  <div className="ui-line" style={{ width: '88%' }}></div>
                  <div className="ui-line" style={{ width: '72%' }}></div>
                  <div className="ui-line" style={{ width: '64%' }}></div>
                </div>
              </div>
              <div className="device-screen small">
                <div className="device-ui" style={{ padding: '12px', gap: '8px' }}>
                  <div className="ui-box" style={{ height: '28px' }}></div>
                  <div className="ui-line" style={{ width: '70%' }}></div>
                  <div className="ui-line" style={{ width: '48%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-side">
            <div className="spotlight-card">
              <div className="product-art kit"></div>
              <div className="spotlight-copy">
                <h3>Emergency Health Kits</h3>
                <p>Trauma-ready, sealed, category-labeled kits for field response, clinics, and rapid dispatch stations.</p>
                <div className="chip-row">
                  <span className="chip">IFAK</span><span className="chip">Trauma</span><span className="chip">Rapid Pack</span>
                </div>
              </div>
            </div>
            <div className="spotlight-card">
              <div className="product-art mask"></div>
              <div className="spotlight-copy">
                <h3>PPE Essentials</h3>
                <p>Mask, gloves, shields, gowns, and sterile barrier stock with shelf-life and usage metadata.</p>
                <div className="chip-row">
                  <span className="chip">N95</span><span className="chip">Gloves</span><span className="chip">Sterile</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="products-layout" id="catalog-main-grid">
          <aside className="filters-card">
            <div className="search-box-glossy">
              <span>⌕</span>
              <input 
                type="text" 
                placeholder="Search products, SKUs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="filter-group">
              <div className="filter-title">Categories</div>
              <div 
                className={`category-link ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => handleCategoryFilter('')}
              >
                All Products <span>{pagination.total > 0 && selectedCategory === '' ? pagination.total : ''}</span>
              </div>
              {categories.map(cat => (
                <div 
                  key={cat.id || cat.name}
                  className={`category-link ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(cat.name)}
                >
                  {cat.name} <span></span>
                </div>
              ))}
            </div>

            <div className="filter-group">
              <div className="filter-title">Currency</div>
              <div className="currency-pills">
                {Object.keys(CURRENCY_CONFIG).map((cur) => (
                  <button 
                    key={cur}
                    className={`currency-pill ${currentCurrency === cur ? 'active' : ''}`}
                    onClick={() => setCurrentCurrency(cur)}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <div className="note-box">
              <b>Catalog note</b>
              Tap 'View details' on a product card and the detail panel updates with summary, usage guidance, pricing in {currentCurrency}.
            </div>
          </aside>

          <div className="products-main">
            <div className="products-head">
              <div>
                <h3 style={{ margin: 0, fontSize: '24px' }}>Featured medical products</h3>
                <div className="subtle" style={{ marginTop: '6px' }}>Styled with the glossy promo energy of your references, but locked to the dashboard width.</div>
              </div>
              <div className="chip-row">
                <span className="chip">Clinic Stock</span>
                <span className="chip">Emergency Ready</span>
                <span className="chip">Multi-currency</span>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-indicator">Retrieving inventory...</div>
            ) : commodities.length === 0 ? (
              <div className="loading-indicator">No products found matching your criteria.</div>
            ) : (
              <div className="products-grid">
                {commodities.map(commodity => {
                  const shapeClass = getShapeClass(commodity.category);
                  
                  return (
                    <article key={commodity.id} className="product-card" onClick={() => onViewItem(commodity, currentCurrency)}>
                      <div className="product-top">
                        <span className="badge">{commodity.category}</span>
                        {/* Background shape */}
                        {shapeClass && <div className={`product-shape-bg ${shapeClass}`} style={{ position: 'absolute', right: '20px', bottom: '14px', width: '124px', height: '110px', opacity: 0.1, background: 'var(--blue)', borderRadius: '30px' }}></div>}
                        {/* Actual Image */}
                        <img 
                          src={(commodity.image || '').replace('/images/real/', '/images/')} 
                          alt={commodity.name} 
                          className="product-shape-img"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/images/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="product-body">
                        <div className="product-meta">
                          <div>
                            <h4 className="product-name" style={{ marginBottom: '8px' }}>{commodity.name}</h4>
                            <div className="sku">SKU {commodity.id} • {commodity.unit}</div>
                          </div>
                          <div className="price-block">
                            <strong className="money">{formatPrice(commodity.price)}</strong>
                            <span>per {String(commodity.unit).toLowerCase().replace(/s$/, '')}</span>
                          </div>
                        </div>
                        <div className="spec-list">
                          <div>Category<b>{commodity.category}</b></div>
                          <div>Stock<b style={{ color: commodity.stock < 100 ? '#DC2626' : 'inherit' }}>{commodity.stock} {commodity.unit}</b></div>
                          <div>Use case<b className="truncate">{commodity.usedFor || 'General Use'}</b></div>
                          <div>Shelf life<b>{commodity.shelf_life || '12-36 mos'}</b></div>
                        </div>
                        <div className="card-actions">
                          <button className="link-btn" onClick={(e) => { e.stopPropagation(); onViewItem({ ...commodity, currentCurrency }); }}>Summary</button>
                          <button className="link-btn primary" onClick={(e) => { e.stopPropagation(); onViewItem({ ...commodity, currentCurrency }); }}>View details</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <div className="subtle">
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
          </div>
        </section>
      </div>
    </div>
  );
}

export default CatalogView;
