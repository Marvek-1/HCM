/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MoScriptCatalogView.jsx — Protocol-Aware Catalogue Interface
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Catalogue Interface", layer: "ui", version: "2026.03.12" }
 *
 * @capabilities
 *   - protocol_first_navigation
 *   - signal_aware_display
 *   - dual_warehouse_visibility
 *   - moscript_engine_integration
 *
 * @intents
 *   - { id: "catalogue.filter", input: "protocolName", output: "commodity_list" }
 *   - { id: "catalogue.add_to_cart", input: "commodity", output: "cart_update" }
 *   - { id: "catalogue.search", input: "query", output: "filtered_commodities" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "Protocol-aware. Signal-driven. Zero guesswork."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { adaptedInventory, getAllProtocols, getCommoditiesForProtocol, searchInventory } from '../data/inventory-adapter';
import { getSignalsForProtocol, hasActiveEmergency } from '../data/signals';
import { getRealItemImage } from '../lib/real-images';
import MoScriptEngine from '../moscripts';
import MoScriptConsole from './MoScriptConsole';

const CATEGORY_ICONS = {
  "Biomedical Consumables": "💉",
  "Biomedical Equipment": "🏥",
  "Cold Chain Equipment": "❄️",
  "Emergency Health Kits": "🧰",
  "IT & Communications": "💻",
  "Lab & Diagnostics": "🔬",
  "PPE": "🛡️",
  "Pharmaceuticals": "�",
  "Shelter & Field": "⛺",
  "Visibility Materials": "👁️",
  "WASH & Water": "🚿",
  "Wellbeing": "❤️",
};

function MoScriptCatalogView({ cart, setCart, onCreateOrder }) {
  const [activeProtocol, setActiveProtocol] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [moscriptLogs, setMoscriptLogs] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const protocols = getAllProtocols();

  // Filter commodities based on protocol and search
  const getFilteredCommodities = () => {
    let filtered = adaptedInventory;

    if (activeProtocol !== 'all') {
      filtered = getCommoditiesForProtocol(activeProtocol);
    }

    if (searchQuery.trim()) {
      filtered = searchInventory(searchQuery);
      if (activeProtocol !== 'all') {
        filtered = filtered.filter(c => c.protocols.includes(activeProtocol));
      }
    }

    return filtered;
  };

  const filteredCommodities = getFilteredCommodities();

  // Pagination logic
  const totalPages = Math.ceil(filteredCommodities.length / itemsPerPage);
  const paginatedItems = filteredCommodities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  const handleProtocolChange = (protocol) => {
    setActiveProtocol(protocol);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Add to cart with MoScript validation
  const handleAddToCart = async (commodity, qty = 1) => {
    // Fire MoScript: Stock Harmonisation
    const stockResults = await MoScriptEngine.fire('STOCK_HARMONISE', { commodity });
    
    // Fire MoScript: Signal Check
    const signalResults = await MoScriptEngine.fire('SIGNAL_CHECK', { commodity });
    
    // Update logs
    setMoscriptLogs([...stockResults, ...signalResults]);
    
    // Add to cart
    const existing = cart.find(item => item.commodity.id === commodity.id);
    if (existing) {
      setCart(cart.map(item =>
        item.commodity.id === commodity.id
          ? { ...item, qty: item.qty + qty }
          : item
      ));
    } else {
      setCart([...cart, { commodity: { ...commodity, stock: commodity.stock }, qty }]);
    }
  };

  // Get cart quantity for a commodity
  const getCartQty = (commodityId) => {
    const item = cart.find(c => c.commodity.id === commodityId);
    return item ? item.qty : 0;
  };

  // Protocol badge component
  const ProtocolBadge = ({ protocol }) => {
    const signals = getSignalsForProtocol(protocol);
    const hasEmergency = hasActiveEmergency(protocol);
    const isActive = signals.length > 0;

    return (
      <div
        className={`protocol-badge ${isActive ? 'active' : ''} ${hasEmergency ? 'emergency' : ''}`}
        title={isActive ? `${signals.length} active signal(s)` : 'No active signals'}
      >
        {protocol}
        {isActive && <span className="signal-pulse"></span>}
      </div>
    );
  };

  return (
    <div className="moscript-catalogue">
      <style>{`
        .moscript-catalogue {
          display: flex;
          height: calc(100vh - 80px);
          background: #0a0a0f;
          color: #e8e8e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .catalogue-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .catalogue-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 24px;
          border-bottom: 2px solid #d4af37;
        }

        .header-title {
          font-size: 28px;
          font-weight: 700;
          color: #d4af37;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .header-subtitle {
          font-size: 14px;
          color: #888;
          font-family: 'Courier New', monospace;
        }

        .protocol-filter-bar {
          display: flex;
          gap: 8px;
          padding: 16px 24px;
          background: #0f0f15;
          border-bottom: 1px solid #2a2a3e;
          overflow-x: auto;
          flex-wrap: wrap;
        }

        .protocol-btn {
          padding: 8px 16px;
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #e8e8e8;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          position: relative;
        }

        .protocol-btn:hover {
          background: #252540;
          border-color: #d4af37;
        }

        .protocol-btn.active {
          background: #d4af37;
          color: #0a0a0f;
          font-weight: 600;
          border-color: #d4af37;
        }

        .protocol-btn .count {
          margin-left: 6px;
          padding: 2px 6px;
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .protocol-btn.active .count {
          background: rgba(10, 10, 15, 0.3);
        }

        .protocol-btn .signal-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 8px;
          height: 8px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .search-bar {
          padding: 16px 24px;
          background: #0f0f15;
          border-bottom: 1px solid #2a2a3e;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #e8e8e8;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #d4af37;
        }

        .search-input::placeholder {
          color: #666;
        }

        .catalogue-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .commodity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .commodity-card {
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .commodity-card:hover {
          border-color: #d4af37;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
        }

        .commodity-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .commodity-icon {
          font-size: 32px;
          opacity: 0.8;
        }

        .commodity-stock {
          text-align: right;
        }

        .stock-label {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-value {
          font-size: 18px;
          font-weight: 700;
          color: #4ade80;
          font-family: 'Courier New', monospace;
        }

        .stock-value.low {
          color: #fbbf24;
        }

        .stock-value.critical {
          color: #ef4444;
        }

        .commodity-name {
          font-size: 16px;
          font-weight: 600;
          color: #e8e8e8;
          margin-bottom: 6px;
        }

        .commodity-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .meta-badge {
          font-size: 11px;
          padding: 3px 8px;
          background: #2a2a3e;
          border-radius: 4px;
          color: #888;
          font-family: 'Courier New', monospace;
        }

        .commodity-protocols {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .protocol-badge {
          font-size: 11px;
          padding: 4px 8px;
          background: #2a2a3e;
          border: 1px solid #3a3a4e;
          border-radius: 4px;
          color: #aaa;
          position: relative;
        }

        .protocol-badge.active {
          background: rgba(212, 175, 55, 0.1);
          border-color: #d4af37;
          color: #d4af37;
        }

        .protocol-badge.emergency {
          background: rgba(255, 68, 68, 0.1);
          border-color: #ff4444;
          color: #ff4444;
          font-weight: 600;
        }

        .signal-pulse {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 6px;
          height: 6px;
          background: #ff4444;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .commodity-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .add-to-cart-btn {
          flex: 1;
          padding: 10px;
          background: #d4af37;
          border: none;
          border-radius: 6px;
          color: #0a0a0f;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover {
          background: #e8c04d;
          transform: scale(1.02);
        }

        .add-to-cart-btn:active {
          transform: scale(0.98);
        }

        .cart-qty-badge {
          padding: 6px 12px;
          background: #4ade80;
          color: #0a0a0f;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          font-family: 'Courier New', monospace;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .empty-text {
          font-size: 16px;
        }

        .warehouse-breakdown {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          font-size: 11px;
          color: #888;
        }

        .warehouse-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .warehouse-label {
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .details-modal {
          background: #1a1a2e;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 12px;
          border: 2px solid #d4af37;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #2a2a3e;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #16213e;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #d4af37;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 28px;
          cursor: pointer;
          line-height: 1;
        }

        .close-btn:hover {
          color: #d4af37;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 32px;
        }

        @media (max-width: 768px) {
          .modal-body {
            grid-template-columns: 1fr;
          }
        }

        .modal-image-container {
          background: #0f0f15;
          border-radius: 8px;
          overflow: hidden;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #2a2a3e;
        }

        .modal-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .modal-info {
          display: flex;
          flex-direction: column;
        }

        .info-section {
          margin-bottom: 24px;
        }

        .info-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .info-content {
          font-size: 15px;
          line-height: 1.6;
          color: #e8e8e8;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .spec-item {
          background: #0f0f15;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #2a2a3e;
        }

        .spec-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }

        .spec-value {
          font-size: 14px;
          font-family: 'Courier New', monospace;
          color: #d4af37;
        }

        .modal-actions {
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid #2a2a3e;
          display: flex;
          gap: 16px;
          align-items: flex-end;
        }

        .qty-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .qty-input {
          width: 80px;
          padding: 10px;
          background: #0f0f15;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #e8e8e8;
          font-family: 'Courier New', monospace;
          font-size: 16px;
        }

        .modal-add-btn {
          flex: 1;
          padding: 12px;
          background: #d4af37;
          border: none;
          border-radius: 6px;
          color: #0a0a0f;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-add-btn:hover {
          background: #e8c04d;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .view-details-btn {
          padding: 8px 12px;
          background: #16213e;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-top: 1px solid #2a2a3e;
          background: #0f0f15;
        }

        .page-btn {
          padding: 8px 16px;
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #e8e8e8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #d4af37;
          color: #d4af37;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          color: #888;
          font-family: 'Courier New', monospace;
        }
      `}</style>

      <div className="catalogue-main">
        <div className="catalogue-header">
          <h1 className="header-title">MoScript Catalogue</h1>
          <div className="header-subtitle">mo-osl-catbridge-001 | Protocol-Aware Supply Chain Intelligence</div>
        </div>

        <div className="protocol-filter-bar">
          <button
            className={`protocol-btn ${activeProtocol === 'all' ? 'active' : ''}`}
            onClick={() => handleProtocolChange('all')}
          >
            All Commodities
            <span className="count">{adaptedInventory.length}</span>
          </button>
          {protocols.map(protocol => {
            const commodityCount = getCommoditiesForProtocol(protocol).length;
            const signals = getSignalsForProtocol(protocol);
            const hasSignals = signals.length > 0;
            
            return (
              <button
                key={protocol}
                className={`protocol-btn ${activeProtocol === protocol ? 'active' : ''}`}
                onClick={() => handleProtocolChange(protocol)}
              >
                {protocol}
                <span className="count">{commodityCount}</span>
                {hasSignals && <span className="signal-dot"></span>}
              </button>
            );
          })}
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, WHO code, or category..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="catalogue-content">
          {filteredCommodities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">No commodities found matching your criteria</div>
            </div>
          ) : (
            <>
              <div className="commodity-grid">
                {paginatedItems.map(commodity => {
                  const totalStock = commodity.stock;
                  const cartQty = getCartQty(commodity.id);
                  const stockStatus = totalStock > 1000 ? '' : totalStock > 100 ? 'low' : 'critical';
                  const itemImage = getRealItemImage(commodity);

                  return (
                    <div key={commodity.id} className="commodity-card" onClick={() => setSelectedCommodity(commodity)}>
                      <div className="commodity-header">
                        <div className="commodity-icon">
                          {itemImage ? (
                            <img src={itemImage} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px' }} />
                          ) : (
                            CATEGORY_ICONS[commodity.category] || commodity.icon || '📦'
                          )}
                        </div>
                        <div className="commodity-stock">
                          <div className="stock-label">Total Stock</div>
                          <div className={`stock-value ${stockStatus}`}>{totalStock.toLocaleString()}</div>
                          <div className="warehouse-breakdown">
                            <div className="warehouse-item">
                              <span className="warehouse-label">NBO:</span>
                              <span>{commodity.nboStock.toLocaleString()}</span>
                            </div>
                            <div className="warehouse-item">
                              <span className="warehouse-label">DKR:</span>
                              <span>{commodity.dkrStock.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="commodity-name">{commodity.name}</div>

                      <div className="commodity-meta">
                        <span className="meta-badge">{commodity.whoCode}</span>
                        <span className="meta-badge">{commodity.unit}</span>
                        <span className="meta-badge">{commodity.category}</span>
                      </div>

                      {commodity.price > 0 && (
                        <div className="commodity-price" style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#d4af37',
                          marginBottom: '8px',
                          fontFamily: 'Courier New, monospace'
                        }}>
                          ${commodity.price.toFixed(2)}
                        </div>
                      )}

                      <div className="commodity-protocols">
                        {commodity.protocols.map(protocol => (
                          <ProtocolBadge key={protocol} protocol={protocol} />
                        ))}
                      </div>

                      <div className="commodity-actions">
                        <button
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCommodity(commodity);
                          }}
                        >
                          Details
                        </button>
                        <button
                          className="add-to-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(commodity);
                          }}
                        >
                          + Add
                        </button>
                        {cartQty > 0 && (
                          <div className="cart-qty-badge">×{cartQty}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MoScriptConsole
        logs={moscriptLogs}
        cart={cart}
        onCheckout={onCreateOrder}
      />

      {/* Details Modal */}
      {selectedCommodity && (
        <div className="modal-overlay" onClick={() => setSelectedCommodity(null)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedCommodity.name}</h2>
              <button className="close-btn" onClick={() => setSelectedCommodity(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-image-container">
                {getRealItemImage(selectedCommodity) ? (
                  <img src={getRealItemImage(selectedCommodity)} alt={selectedCommodity.name} className="modal-image" />
                ) : (
                  <span style={{ fontSize: '120px' }}>{CATEGORY_ICONS[selectedCommodity.category] || '📦'}</span>
                )}
              </div>
              
              <div className="modal-info">
                <div className="info-section">
                  <div className="info-label">Description</div>
                  <div className="info-content">{selectedCommodity.description}</div>
                </div>

                <div className="info-section">
                  <div className="info-label">Specifications</div>
                  <div className="spec-grid">
                    <div className="spec-item">
                      <div className="spec-label">WHO Code</div>
                      <div className="spec-value">{selectedCommodity.whoCode}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Category</div>
                      <div className="spec-value">{selectedCommodity.category}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Unit</div>
                      <div className="spec-value">{selectedCommodity.unit}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Storage Temp</div>
                      <div className="spec-value">{selectedCommodity.storageTemp}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Shelf Life</div>
                      <div className="spec-value">{selectedCommodity.shelfLife}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Total Stock</div>
                      <div className="spec-value" style={{ color: selectedCommodity.stock < 100 ? '#ef4444' : '#4ade80' }}>
                        {selectedCommodity.stock.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-label">Protocols</div>
                  <div className="commodity-protocols">
                    {selectedCommodity.protocols.map(protocol => (
                      <ProtocolBadge key={protocol} protocol={protocol} />
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <div className="qty-input-group">
                    <div className="info-label">Quantity</div>
                    <input 
                      type="number" 
                      className="qty-input" 
                      min="1" 
                      value={detailQty}
                      onChange={(e) => setDetailQty(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <button 
                    className="modal-add-btn"
                    onClick={() => {
                      handleAddToCart(selectedCommodity, detailQty);
                      setSelectedCommodity(null);
                      setDetailQty(1);
                    }}
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoScriptCatalogView;
