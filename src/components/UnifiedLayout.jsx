import { useState } from 'react';
import '../styles/UnifiedLayout.css';

export default function UnifiedLayout({ 
  children, 
  activeTab, 
  setActiveTab,
  stats,
  currentUser 
}) {
  const [sidebarCompact, setSidebarCompact] = useState(false);

  return (
    <div className="unified-app">
      {/* Sidebar */}
      <aside className={`unified-sidebar ${sidebarCompact ? 'compact' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <span className="logo-badge">W</span>
            <div className="brand-text">
              <h2>HCOMS</h2>
              <p>WHO AFRO</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            data-page="dashboard"
          >
            <span className="menu-icon">📊</span>
            <span className="menu-label">Dashboard</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
            data-page="catalog"
          >
            <span className="menu-icon">📦</span>
            <span className="menu-label">Catalog</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            data-page="orders"
          >
            <span className="menu-icon">🛒</span>
            <span className="menu-label">Orders</span>
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'warehouse' ? 'active' : ''}`}
            onClick={() => setActiveTab('warehouse')}
            data-page="warehouse"
          >
            <span className="menu-icon">🏭</span>
            <span className="menu-label">Warehouse</span>
          </button>
          
          {currentUser?.role === 'Super Admin' && (
            <button 
              className={`menu-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              data-page="admin"
            >
              <span className="menu-icon">⚙️</span>
              <span className="menu-label">Admin</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <span>v2.0</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="unified-main">
        <div className="main-shell">
          {/* Topbar */}
          <div className="topbar">
            <div className="page-title">
              <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p>Manage your health commodities and orders</p>
            </div>
            <div className="top-actions">
              <div className="avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
            </div>
          </div>

          {/* Stats Row */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="kpis">
              {stats.totalOrders !== undefined && (
                <div className="stat-card">
                  <span className="stat-value">{stats.totalOrders || 0}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
              )}
              {stats.pendingOrders !== undefined && (
                <div className="stat-card">
                  <span className="stat-value">{stats.pendingOrders || 0}</span>
                  <span className="stat-label">Pending</span>
                </div>
              )}
              {stats.totalCommodities !== undefined && (
                <div className="stat-card">
                  <span className="stat-value">{stats.totalCommodities || 0}</span>
                  <span className="stat-label">Commodities</span>
                </div>
              )}
              {stats.activeWarehouses !== undefined && (
                <div className="stat-card">
                  <span className="stat-value">{stats.activeWarehouses || 0}</span>
                  <span className="stat-label">Warehouses</span>
                </div>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="content-area">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
