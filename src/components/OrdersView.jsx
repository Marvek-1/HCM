import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getStatusStyle, getPriorityStyle, formatDateTime, getTimeElapsed, getPendingDurationClass } from '../utils/helpers';
import { chatAPI } from '../services/api';
import { exportOrdersToCSV } from '../utils/exportHelpers';
import '../styles/OrdersView.css';
import '../styles/hcoms-neu.css';

function OrdersView({ orders, role, onNewOrder, onViewOrder }) {
  const [filter, setFilter] = useState('all');
  const [messageCounts, setMessageCounts] = useState({});

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    priority: '',
    status: '',
    warehouse: '',
    split: '',
    dateFrom: '',
    dateTo: '',
    minItems: '',
    maxItems: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selected row highlight
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch message counts when orders change
  useEffect(() => {
    const fetchMessageCounts = async () => {
      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        try {
          const response = await chatAPI.getMessageCountsBatch(orderIds);
          if (response.success) {
            setMessageCounts(response.data.counts || {});
          }
        } catch (err) {
          console.error('Failed to fetch message counts:', err);
        }
      }
    };
    fetchMessageCounts();
  }, [orders]);

  const getFilterOptions = () => {
    switch (role) {
      case 'Laboratory Team':
        return ['all', 'Submitted', 'Forwarded to OSL'];
      case 'OSL Team':
        return ['all', 'Forwarded to OSL', 'Approved', 'Shipped'];
      default:
        return ['all', 'Submitted', 'Approved', 'Shipped'];
    }
  };

  // Apply all filters
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.order_number?.toLowerCase().includes(searchLower) ||
        order.pateo_ref?.toLowerCase().includes(searchLower) ||
        order.country?.toLowerCase().includes(searchLower) ||
        order.priority?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Status filter (tabs)
    if (filter !== 'all' && order.status !== filter) return false;

    // Status filter (advanced - overrides tab if set)
    if (filters.status && order.status !== filters.status) return false;

    // Country filter
    if (filters.country && order.country !== filters.country) return false;

    // Priority filter
    if (filters.priority && order.priority !== filters.priority) return false;

    // Warehouse filter
    if (filters.warehouse && order.fulfillment_warehouse_code !== filters.warehouse) return false;

    // Split filter
    if (filters.split !== '') {
      const isSplit = order.isSplit || false;
      if (filters.split === 'yes' && !isSplit) return false;
      if (filters.split === 'no' && isSplit) return false;
    }

    // Item count filter
    const itemCount = order.items ? order.items.length : 0;
    if (filters.minItems && itemCount < parseInt(filters.minItems)) return false;
    if (filters.maxItems && itemCount > parseInt(filters.maxItems)) return false;

    // Date range filter
    if (filters.dateFrom) {
      const orderDate = new Date(order.created_at);
      const fromDate = new Date(filters.dateFrom);
      if (orderDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const orderDate = new Date(order.created_at);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include entire day
      if (orderDate > toDate) return false;
    }

    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueCountries = [...new Set(orders.map(o => o.country))].sort();
  const uniqueWarehouses = [...new Set(orders.map(o => o.fulfillment_warehouse_code).filter(Boolean))].sort();

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, filters]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      country: '',
      priority: '',
      status: '',
      warehouse: '',
      split: '',
      dateFrom: '',
      dateTo: '',
      minItems: '',
      maxItems: ''
    });
    setFilter('all');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Check if order is in a pending state
  const isPending = (status) => {
    return ['Submitted', 'Forwarded to OSL', 'Partially Fulfilled'].includes(status);
  };

  const getTitle = () => {
    switch (role) {
      case 'Country Office':
        return 'My Orders';
      case 'Laboratory Team':
        return 'All Country Requests';
      case 'OSL Team':
        return 'Orders Pending Approval';
      case 'Super Admin':
        return 'All Orders (Admin View)';
      default:
        return 'Orders';
    }
  };

  const handleExportOrders = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `HCOMS_Orders_${role.replace(/\s+/g, '_')}_${timestamp}.csv`;
      exportOrdersToCSV(filteredOrders, filename);
      toast.success(`Exported ${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export orders. Please try again.');
    }
  };

  // ─── STATUS → NEU CLASS MAP ───
  const statusNeuClass = (status) => {
    const m = {
      'Submitted': 'hcoms-sp-s',
      'Draft': 'hcoms-sp-s',
      'Forwarded to OSL': 'hcoms-sp-r',
      'Under Review': 'hcoms-sp-r',
      'Approved': 'hcoms-sp-a',
      'Shipped': 'hcoms-sp-t',
      'Completed': 'hcoms-sp-d',
      'Rejected': 'hcoms-sp-r',
      'Partially Fulfilled': 'hcoms-sp-t',
    };
    return m[status] || 'hcoms-sp-s';
  };

  const priorityNeuBadge = (p) => {
    if (!p) return null;
    const u = p.toUpperCase();
    if (u === 'EMERGENCY' || u === 'HIGH') return { cls: 'hcoms-pb-ft', label: '⚡ FAST-TRACK' };
    if (u === 'ROUTINE' || u === 'MEDIUM') return { cls: 'hcoms-pb-pt', label: '◎ PATTERN' };
    return { cls: 'hcoms-pb-st', label: '— STANDARD' };
  };

  const hubClass = (code) => code === 'DKR' ? 'hcoms-h-d' : 'hcoms-h-n';

  // KPI summary
  const kpiData = [
    { lbl: 'Total Orders', val: filteredOrders.length, icon: '📦', cls: 'hcoms-trend-up', trend: 'All filtered' },
    { lbl: 'Pending', val: filteredOrders.filter(o => ['Submitted','Under Review'].includes(o.status)).length, icon: '⏳', cls: 'hcoms-trend-warn', trend: 'Needs action' },
    { lbl: 'Fast-Track', val: filteredOrders.filter(o => ['EMERGENCY','HIGH'].includes((o.priority||'').toUpperCase())).length, icon: '⚡', cls: 'hcoms-trend-down', trend: 'Active signals' },
    { lbl: 'Completed', val: filteredOrders.filter(o => ['Completed','Shipped'].includes(o.status)).length, icon: '✅', cls: 'hcoms-trend-up', trend: '↑ This month' },
  ];

  return (
    <div className="hcoms-page">

      {/* ── TOPBAR ── */}
      <div className="hcoms-topbar">
        <div className="hcoms-page-title">
          <h2>{getTitle()}</h2>
          <p>{filteredOrders.length} orders · WHO AFRO 47 member states</p>
        </div>
        <div className="hcoms-top-actions">
          <button className="neu-circle" style={{ width: 38, height: 38, fontSize: 14 }} onClick={handleExportOrders}>⬇</button>
          <button className="neu-btn" style={{ padding: '9px 16px', fontSize: '12px' }} onClick={handleExportOrders}>Export CSV</button>
          {(role === 'Country Office' || role === 'Laboratory Team') && (
            <button className="neu-primary" style={{ padding: '9px 18px', fontSize: '12px' }} onClick={onNewOrder}>＋ New Request</button>
          )}
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="hcoms-stats">
        {kpiData.map((k, i) => (
          <div key={i} className="neu-flat hcoms-stat-card" style={{ minHeight: 90 }}>
            <div className="hcoms-stat-icon-row">
              <span className="hcoms-stat-lbl">{k.lbl}</span>
              <div className="neu-circle hcoms-stat-icon" style={{ fontSize: 14 }}>{k.icon}</div>
            </div>
            <div className="hcoms-stat-val">{k.val}</div>
            <div className={`hcoms-stat-trend ${k.cls}`}>{k.trend}</div>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="neu-flat hcoms-filter-bar">
        {/* Tab filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {getFilterOptions().map(f => (
            <button
              key={f}
              className={`hcoms-tab${filter === f ? ' active' : ''}`}
              onClick={() => { setFilter(f); setCurrentPage(1); }}
            >
              {f === 'all' ? 'All Orders' : f}
              {f !== 'all' && (
                <span className="hcoms-tab-badge">
                  {orders.filter(o => o.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="neu-pressed hcoms-search">
          <span style={{ color: 'var(--neu-t3)', fontSize: 13 }}>🔍</span>
          <input
            placeholder="Search PATEO, country, disease…"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Selects */}
        <select
          className="hcoms-fsel"
          value={filters.country}
          onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
        >
          <option value="">All Countries</option>
          {[...new Set(orders.map(o => o.country))].filter(Boolean).sort().map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="hcoms-fsel"
          value={filters.priority}
          onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All Priority</option>
          <option value="EMERGENCY">Fast-Track</option>
          <option value="ROUTINE">Pattern</option>
          <option value="STUDY">Standard</option>
        </select>

        {Object.values(filters).some(v => v !== '') && (
          <button
            className="neu-btn"
            style={{ padding: '7px 14px', fontSize: '11.5px', color: 'var(--hc-red)' }}
            onClick={() => setFilters({ country:'', priority:'', status:'', warehouse:'', split:'', dateFrom:'', dateTo:'', minItems:'', maxItems:'' })}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── ORDERS TABLE ── */}
      <div className="neu-flat hcoms-table-wrap">
        <table className="hcoms-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Country</th>
              <th>Disease / Category</th>
              <th>Priority</th>
              <th>Hub</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Items</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--neu-t3)', padding: '32px', fontSize: '13px' }}>
                  No orders match your filters
                </td>
              </tr>
            ) : paginatedOrders.map(order => {
              const pb = priorityNeuBadge(order.priority);
              const statusCls = statusNeuClass(order.status);
              const whCode = order.fulfillment_warehouse_code || 'NBI';
              const categories = order.items?.map(i => i.commodity?.category).filter(Boolean);
              const primaryCat = categories?.[0] || '';
              const diseaseLabel = primaryCat.includes('Emergency') ? '🜂 Emergency Kit'
                : primaryCat.includes('PPE') ? '🜂 PPE'
                : primaryCat.includes('Pharma') ? '🜂 Pharma'
                : primaryCat ? `🜂 ${primaryCat.split(' ')[0]}`
                : order.disease || '🜂 Routine';

              return (
                <tr
                  key={order.id}
                  className={selectedOrder?.id === order.id ? 'hcoms-row-sel' : ''}
                  onClick={() => { setSelectedOrder(order); onViewOrder && onViewOrder(order); }}
                >
                  <td><span className="hcoms-oid">{order.order_number || `ORD-${order.id?.slice(0,8)}`}</span></td>
                  <td>
                    <div className="hcoms-cc">
                      <div className="hcoms-cav">🌍</div>
                      <div>
                        <div className="hcoms-cname">{order.country || '—'}</div>
                        <div className="hcoms-csub">{order.submitted_by?.name || order.contact_name || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="hcoms-dtag hcoms-dt-b">{diseaseLabel}</span>
                  </td>
                  <td>
                    {pb && <span className={`hcoms-pbadge ${pb.cls}`}>{pb.label}</span>}
                  </td>
                  <td>
                    <span className={`hcoms-hchip ${hubClass(whCode)}`}>{whCode}</span>
                  </td>
                  <td>
                    <span className={`hcoms-spill ${statusCls}`}>
                      <span className="hcoms-sd" />
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--neu-t3)', fontSize: '11px', fontFamily: 'monospace' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit' }) : '—'}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '12px' }}>
                    {order.items?.length ?? 0}
                  </td>
                  <td>
                    <div className="hcoms-acts">
                      <button
                        className="neu-circle hcoms-ab"
                        title="View order"
                        onClick={e => { e.stopPropagation(); onViewOrder && onViewOrder(order); }}
                      >👁</button>
                      <button className="neu-circle hcoms-ab" title="More">⋯</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── PAGINATION ── */}
        <div className="hcoms-tfoot">
          <span className="hcoms-tfoot-t">
            Showing {Math.min((currentPage-1)*itemsPerPage+1, filteredOrders.length)}–{Math.min(currentPage*itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </span>
          <div className="hcoms-pages">
            <button
              className={`hcoms-pg${currentPage === 1 ? ' disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
            >‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  className={`hcoms-pg${currentPage === pg ? ' active' : ''}`}
                  onClick={() => setCurrentPage(pg)}
                >{pg}</button>
              );
            })}
            {totalPages > 5 && <span style={{ color: 'var(--neu-t3)', fontSize: 12 }}>…</span>}
            <button
              className={`hcoms-pg${currentPage === totalPages ? ' disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
            >›</button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default OrdersView;