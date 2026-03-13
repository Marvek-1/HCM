import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getStatusStyle, getPriorityStyle, formatDateTime, getTimeElapsed, getPendingDurationClass } from '../utils/helpers';
import { chatAPI } from '../services/api';
import { exportOrdersToCSV } from '../utils/exportHelpers';
import '../styles/OrdersView.css';

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

  return (
    <div className="orders-view">
      <div className="orders-header">
        <h2 className="orders-title">{getTitle()}</h2>
        <div className="orders-header-actions">
          <button onClick={handleExportOrders} className="orders-export-btn">
            Export CSV
          </button>
          {(role === 'Country Office' || role === 'Laboratory Team') && (
            <button onClick={onNewOrder} className="orders-new-btn">
              <span className="orders-new-btn-icon">+</span> New Order
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Info Banner */}
      {role === 'Super Admin' && (
        <div className="admin-info-banner">
          <span className="info-icon">ℹ️</span>
          <span>Viewing all orders from all countries. Use filters below to narrow results.</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="orders-search-bar">
        <input
          type="text"
          placeholder="Search by Order ID, Country, PATEO Ref, Priority, or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="search-clear-btn"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="orders-filters">
        {getFilterOptions().map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`orders-filter-btn ${filter === status ? 'active' : ''}`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`orders-filter-btn advanced-toggle ${showAdvancedFilters ? 'active' : ''}`}
        >
          🔍 {showAdvancedFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Country</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="filter-select"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="filter-select"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Forwarded to OSL">Forwarded to OSL</option>
                <option value="Approved">Approved</option>
                <option value="Partially Fulfilled">Partially Fulfilled</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Warehouse</label>
              <select
                value={filters.warehouse}
                onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}
                className="filter-select"
              >
                <option value="">All Warehouses</option>
                {uniqueWarehouses.map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Split Order</label>
              <select
                value={filters.split}
                onChange={(e) => setFilters({ ...filters, split: e.target.value })}
                className="filter-select"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Min Items</label>
              <input
                type="number"
                min="0"
                value={filters.minItems}
                onChange={(e) => setFilters({ ...filters, minItems: e.target.value })}
                className="filter-input"
                placeholder="Min"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Items</label>
              <input
                type="number"
                min="0"
                value={filters.maxItems}
                onChange={(e) => setFilters({ ...filters, maxItems: e.target.value })}
                className="filter-input"
                placeholder="Max"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <button onClick={handleResetFilters} className="reset-filters-btn">
                Reset All
              </button>
            </div>
          </div>

          <div className="filter-summary">
            Showing <strong>{startIndex + 1}-{Math.min(endIndex, filteredOrders.length)}</strong> of <strong>{filteredOrders.length}</strong> {filteredOrders.length !== orders.length && `(filtered from ${orders.length} total)`}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Country</th>
              <th>Items</th>
              <th>PATEO Ref</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Warehouse</th>
              <th>Split</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="orders-empty">No orders found</td>
              </tr>
            ) : (
              paginatedOrders.map(order => {
                const statusStyle = getStatusStyle(order.status);
                const priorityStyle = getPriorityStyle(order.priority);
                const orderDate = formatDateTime(order.created_at, { short: true });
                const itemCount = order.items ? order.items.length : 0;
                const showPendingCounter = isPending(order.status);
                const pendingTime = getTimeElapsed(order.created_at);
                const durationClass = getPendingDurationClass(order.created_at);
                
                return (
                  <tr key={order.id} onClick={() => onViewOrder(order)}>
                    <td className="orders-table-id">
                      <div className="order-id-cell">
                        <span>{order.order_number}</span>
                        {messageCounts[order.id] > 0 && (
                          <span className="message-count-badge" title={`${messageCounts[order.id]} message(s)`}>
                            💬 {messageCounts[order.id]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="orders-table-country">{order.country}</td>
                    <td className="orders-table-items">{itemCount} item(s)</td>
                    <td className="orders-table-pateo">{order.pateo_ref}</td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ color: priorityStyle.color, background: priorityStyle.background }}
                      >
                        {order.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ color: statusStyle.color, background: statusStyle.background }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="orders-table-warehouse">
                      {order.fulfillment_warehouse_code ? (
                        <span className="warehouse-info">
                          {order.fulfillment_warehouse_code}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="orders-table-split">
                      {order.isSplit ? (
                        <span className="split-badge split-yes">Yes</span>
                      ) : order.fulfillmentWarehouses && order.fulfillmentWarehouses.length > 0 ? (
                        <span className="split-badge split-no">No</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="orders-table-date">
                      <div className="date-with-pending">
                        <span className="order-date">{orderDate}</span>
                        {showPendingCounter && pendingTime && (
                          <span className={`pending-counter ${durationClass}`}>
                            ⏱ Pending {pendingTime}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredOrders.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <label className="items-per-page">
                Show
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="items-select">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                per page
              </label>
              <span className="pagination-summary">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
              </span>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  title="Previous page"
                >
                  ‹
                </button>

                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  title="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersView;
