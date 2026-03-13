import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { oslAPI, commoditiesAPI } from '../services/api';
import { formatDateTime, formatDateRange } from '../utils/helpers';
import '../styles/OSLOperations.css';

const DEV_UNLOCK_ROLES = import.meta.env.VITE_DEV_UNLOCK_ROLES === 'true';

function OSLOperations({ warehouses = [], oslAdminLevel }) {
  // OSL permission helpers
  const canEdit = DEV_UNLOCK_ROLES || oslAdminLevel === 0 || oslAdminLevel === 1; // Level 0-1 can edit
  const isViewOnly = !DEV_UNLOCK_ROLES && oslAdminLevel === 2; // Level 2 is view-only

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);

  // Outbound state
  const [shipments, setShipments] = useState([]);
  const [shipmentPagination, setShipmentPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [shipmentFilter, setShipmentFilter] = useState({ status: '', warehouseId: '' });

  // Inventory state
  const [stockMovements, setStockMovements] = useState([]);
  const [movementPagination, setMovementPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [movementFilter, setMovementFilter] = useState({ warehouseId: '', movementType: '' });
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [newMovement, setNewMovement] = useState({
    movementType: 'Adjustment',
    warehouseId: '',
    toWarehouseId: '',
    commodityId: '',
    quantity: 0,
    reason: '',
    notes: ''
  });

  // Procurement state
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poPagination, setPoPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [poFilter, setPoFilter] = useState({ status: '', supplierId: '' });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '', code: '', contactName: '', contactEmail: '', contactPhone: '',
    address: '', country: '', leadTimeDays: 30, paymentTerms: ''
  });
  const [newPO, setNewPO] = useState({
    supplierId: '', warehouseId: '', expectedDeliveryDate: '', shippingMethod: '', notes: '', items: []
  });

  // Commodities for selection
  const [commodities, setCommodities] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboard();
    fetchCommodities();
    fetchSuppliers();
  }, []);

  // Fetch based on active tab
  useEffect(() => {
    if (activeTab === 'outbound') fetchShipments();
    if (activeTab === 'inventory') fetchStockMovements();
    if (activeTab === 'procurement') fetchPurchaseOrders();
  }, [activeTab]);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await oslAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommodities = async () => {
    try {
      const response = await commoditiesAPI.getAll({ limit: 100 });
      if (response.success) {
        setCommodities(response.data.commodities || []);
      }
    } catch (err) {
      console.error('Failed to fetch commodities:', err);
    }
  };

  const fetchShipments = async (page = 1, filterOverrides = {}) => {
    setIsLoading(true);
    try {
      const filters = { ...shipmentFilter, ...filterOverrides };
      const response = await oslAPI.getOutboundShipments({
        page,
        limit: shipmentPagination.limit,
        ...filters
      });
      if (response.success) {
        setShipments(response.data.shipments);
        setShipmentPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockMovements = async (page = 1, filterOverrides = {}) => {
    setIsLoading(true);
    try {
      const filters = { ...movementFilter, ...filterOverrides };
      const response = await oslAPI.getStockMovements({
        page,
        limit: movementPagination.limit,
        ...filters
      });
      if (response.success) {
        setStockMovements(response.data.movements);
        setMovementPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await oslAPI.getSuppliers({ limit: 100 });
      if (response.success) {
        setSuppliers(response.data.suppliers);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const fetchPurchaseOrders = async (page = 1, filterOverrides = {}) => {
    setIsLoading(true);
    try {
      const filters = { ...poFilter, ...filterOverrides };
      const response = await oslAPI.getPurchaseOrders({
        page,
        limit: poPagination.limit,
        ...filters
      });
      if (response.success) {
        setPurchaseOrders(response.data.purchaseOrders);
        setPoPagination(response.data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.code) {
      toast.error('Name and code are required');
      return;
    }
    try {
      const response = await oslAPI.createSupplier(newSupplier);
      if (response.success) {
        setShowSupplierModal(false);
        setNewSupplier({ name: '', code: '', contactName: '', contactEmail: '', contactPhone: '', address: '', country: '', leadTimeDays: 30, paymentTerms: '' });
        fetchSuppliers();
        toast.success('Supplier created successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleCreatePO = async () => {
    if (!newPO.supplierId || !newPO.warehouseId || newPO.items.length === 0) {
      toast.error('Supplier, warehouse, and at least one item are required');
      return;
    }
    try {
      const response = await oslAPI.createPurchaseOrder(newPO);
      if (response.success) {
        setShowPOModal(false);
        setNewPO({ supplierId: '', warehouseId: '', expectedDeliveryDate: '', shippingMethod: '', notes: '', items: [] });
        fetchPurchaseOrders();
        toast.success('Purchase order created successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleUpdatePOStatus = async (poId, status) => {
    try {
      await oslAPI.updatePurchaseOrderStatus(poId, status);
      fetchPurchaseOrders();
      if (selectedPO?.id === poId) {
        const response = await oslAPI.getPurchaseOrder(poId);
        if (response.success) setSelectedPO(response.data.purchaseOrder);
      }
      toast.success(`Purchase order ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleCreateMovement = async () => {
    if (!newMovement.warehouseId || !newMovement.commodityId || !newMovement.quantity) {
      toast.error('Warehouse, commodity, and quantity are required');
      return;
    }
    try {
      await oslAPI.createStockMovement(newMovement);
      setShowMovementModal(false);
      setNewMovement({ movementType: 'Adjustment', warehouseId: '', toWarehouseId: '', commodityId: '', quantity: 0, reason: '', notes: '' });
      fetchStockMovements();
      fetchDashboard();
      toast.success('Stock movement recorded');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleUpdateShipment = async (shipmentId, data) => {
    try {
      await oslAPI.updateShipment(shipmentId, data);
      fetchShipments();
      toast.success('Shipment updated');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const addPOItem = () => {
    setNewPO({
      ...newPO,
      items: [...newPO.items, { commodityId: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const updatePOItem = (index, field, value) => {
    const items = [...newPO.items];
    items[index][field] = value;
    setNewPO({ ...newPO, items });
  };

  const removePOItem = (index) => {
    const items = newPO.items.filter((_, i) => i !== index);
    setNewPO({ ...newPO, items });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Shipped': 'status-shipped',
      'In Transit': 'status-transit',
      'Delivered': 'status-delivered',
      'Draft': 'status-draft',
      'Submitted': 'status-submitted',
      'Confirmed': 'status-confirmed',
      'Received': 'status-received',
      'Partially Received': 'status-partial',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  const getMovementTypeIcon = (type) => {
    const icons = {
      'Inbound': '📥',
      'Outbound': '📤',
      'Transfer': '🔄',
      'Adjustment': '📝',
      'Return': '↩️'
    };
    return icons[type] || '📦';
  };

  return (
    <div className="osl-operations">
      <div className="osl-header">
        <h2>OSL Operations Center</h2>
        <p>Manage outbound shipments, inventory, and procurement</p>
      </div>

      {/* Tab Navigation */}
      <div className="osl-tabs">
        <button
          className={`osl-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`osl-tab ${activeTab === 'outbound' ? 'active' : ''}`}
          onClick={() => setActiveTab('outbound')}
        >
          📤 Outbound
        </button>
        <button
          className={`osl-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory
        </button>
        <button
          className={`osl-tab ${activeTab === 'procurement' ? 'active' : ''}`}
          onClick={() => setActiveTab('procurement')}
        >
          🛒 Procurement
        </button>
      </div>

      {/* Tab Content */}
      <div className="osl-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="dashboard-tab">
            <div className="dashboard-grid">
              {/* Procurement Summary */}
              <div className="dashboard-card">
                <h3>🛒 Procurement Overview</h3>
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-value">{dashboardData.procurement?.total_orders || 0}</span>
                    <span className="stat-label">Total POs (90 days)</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{dashboardData.procurement?.pending_orders || 0}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{dashboardData.procurement?.in_transit || 0}</span>
                    <span className="stat-label">In Transit</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">${parseFloat(dashboardData.procurement?.total_value || 0).toLocaleString()}</span>
                    <span className="stat-label">Total Value</span>
                  </div>
                </div>
              </div>

              {/* Warehouse Summary */}
              <div className="dashboard-card">
                <h3>🏭 Warehouse Status</h3>
                <div className="warehouse-list">
                  {dashboardData.warehouses?.map(w => (
                    <div key={w.id} className="warehouse-item">
                      <div className="warehouse-name">{w.name} ({w.code})</div>
                      <div className="warehouse-stats">
                        <span>{w.total_products} products</span>
                        <span>{parseInt(w.total_stock).toLocaleString()} units</span>
                        {w.low_stock_items > 0 && (
                          <span className="low-stock-badge">⚠️ {w.low_stock_items} low</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="dashboard-card alerts-card">
                <h3>⚠️ Low Stock Alerts</h3>
                {dashboardData.lowStockAlerts?.length > 0 ? (
                  <div className="alerts-list">
                    {dashboardData.lowStockAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className="alert-item">
                        <span className="alert-commodity">{alert.commodity_name}</span>
                        <span className="alert-warehouse">{alert.warehouse_code}</span>
                        <span className="alert-qty">{alert.current_stock} {alert.unit}</span>
                      </div>
                    ))}
                    {dashboardData.lowStockAlerts.length > 5 && (
                      <div className="more-alerts">+{dashboardData.lowStockAlerts.length - 5} more</div>
                    )}
                  </div>
                ) : (
                  <div className="no-alerts">✓ All stock levels healthy</div>
                )}
              </div>

              {/* Stock Movement Summary */}
              <div className="dashboard-card">
                <h3>📊 Movement Summary (30 days)</h3>
                <div className="movement-summary">
                  {dashboardData.movements?.map((m, idx) => (
                    <div key={idx} className="movement-item">
                      <span className="movement-type">{getMovementTypeIcon(m.movement_type)} {m.movement_type}</span>
                      <span className="movement-count">{m.count} transactions</span>
                      <span className="movement-qty">{parseInt(m.total_quantity).toLocaleString()} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Outbound Tab */}
        {activeTab === 'outbound' && (
          <div className="outbound-tab">
            <div className="tab-toolbar">
              <div className="filters">
                <select
                  value={shipmentFilter.status}
                  onChange={(e) => { 
                    const newStatus = e.target.value;
                    setShipmentFilter({ ...shipmentFilter, status: newStatus }); 
                    fetchShipments(1, { status: newStatus }); 
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <select
                  value={shipmentFilter.warehouseId}
                  onChange={(e) => { 
                    const newWarehouseId = e.target.value;
                    setShipmentFilter({ ...shipmentFilter, warehouseId: newWarehouseId }); 
                    fetchShipments(1, { warehouseId: newWarehouseId }); 
                  }}
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="loading">Loading shipments...</div>
            ) : (
              <div className="shipments-table-container">
                <table className="osl-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Destination</th>
                      <th>Warehouse</th>
                      <th>Carrier</th>
                      <th>Tracking</th>
                      <th>ETA</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(s => (
                      <tr key={s.id}>
                        <td>{s.orderNumber}</td>
                        <td>{s.destinationCountry}</td>
                        <td>{s.warehouseCode}</td>
                        <td>{s.shippingCompany}</td>
                        <td>{s.trackingNumber || '-'}</td>
                        <td>
                          {formatDateRange(s.estimatedDeliveryDateFrom, s.estimatedDeliveryDateTo)}
                        </td>
                        <td><span className={`status-badge ${getStatusBadgeClass(s.status)}`}>{s.status}</span></td>
                        <td>
                          <select
                            value={s.status}
                            onChange={(e) => handleUpdateShipment(s.id, { status: e.target.value })}
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {shipmentPagination.totalPages > 1 && (
              <div className="pagination">
                <button disabled={shipmentPagination.page === 1} onClick={() => fetchShipments(shipmentPagination.page - 1)}>← Prev</button>
                <span>Page {shipmentPagination.page} of {shipmentPagination.totalPages}</span>
                <button disabled={shipmentPagination.page === shipmentPagination.totalPages} onClick={() => fetchShipments(shipmentPagination.page + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            <div className="tab-toolbar">
              <div className="filters">
                <select
                  value={movementFilter.warehouseId}
                  onChange={(e) => { 
                    const newWarehouseId = e.target.value;
                    setMovementFilter({ ...movementFilter, warehouseId: newWarehouseId }); 
                    fetchStockMovements(1, { warehouseId: newWarehouseId }); 
                  }}
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
                <select
                  value={movementFilter.movementType}
                  onChange={(e) => { 
                    const newType = e.target.value;
                    setMovementFilter({ ...movementFilter, movementType: newType }); 
                    fetchStockMovements(1, { movementType: newType }); 
                  }}
                >
                  <option value="">All Movement Types</option>
                  <option value="Inbound">Inbound</option>
                  <option value="Outbound">Outbound</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Return">Return</option>
                </select>
              </div>
              {canEdit && (
                <button className="btn btn-primary" onClick={() => setShowMovementModal(true)}>
                  + Record Movement
                </button>
              )}
              {isViewOnly && (
                <span className="view-only-badge">View Only</span>
              )}
            </div>

            {isLoading ? (
              <div className="loading">Loading movements...</div>
            ) : (
              <div className="movements-table-container">
                <table className="osl-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Warehouse</th>
                      <th>Commodity</th>
                      <th>Quantity</th>
                      <th>Reference</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map(m => (
                      <tr key={m.id}>
                        <td>{formatDateTime(m.createdAt, { short: true })}</td>
                        <td>
                          <span className={`movement-badge ${m.movementType.toLowerCase()}`}>
                            {getMovementTypeIcon(m.movementType)} {m.movementType}
                          </span>
                        </td>
                        <td>
                          {m.warehouseCode}
                          {m.toWarehouseCode && ` → ${m.toWarehouseCode}`}
                        </td>
                        <td>{m.commodityName}</td>
                        <td className={m.movementType === 'Outbound' ? 'qty-negative' : 'qty-positive'}>
                          {m.movementType === 'Outbound' ? '-' : '+'}{m.quantity} {m.commodityUnit}
                        </td>
                        <td>{m.referenceType ? `${m.referenceType} #${m.referenceId}` : '-'}</td>
                        <td>{m.performedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {movementPagination.totalPages > 1 && (
              <div className="pagination">
                <button disabled={movementPagination.page === 1} onClick={() => fetchStockMovements(movementPagination.page - 1)}>← Prev</button>
                <span>Page {movementPagination.page} of {movementPagination.totalPages}</span>
                <button disabled={movementPagination.page === movementPagination.totalPages} onClick={() => fetchStockMovements(movementPagination.page + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* Procurement Tab */}
        {activeTab === 'procurement' && (
          <div className="procurement-tab">
            <div className="tab-toolbar">
              <div className="filters">
                <select
                  value={poFilter.status}
                  onChange={(e) => { 
                    const newStatus = e.target.value;
                    setPoFilter({ ...poFilter, status: newStatus }); 
                    fetchPurchaseOrders(1, { status: newStatus }); 
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Partially Received">Partially Received</option>
                  <option value="Received">Received</option>
                </select>
                <select
                  value={poFilter.supplierId}
                  onChange={(e) => { 
                    const newSupplierId = e.target.value;
                    setPoFilter({ ...poFilter, supplierId: newSupplierId }); 
                    fetchPurchaseOrders(1, { supplierId: newSupplierId }); 
                  }}
                >
                  <option value="">All Suppliers</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              {canEdit ? (
                <div className="toolbar-actions">
                  <button className="btn btn-secondary" onClick={() => setShowSupplierModal(true)}>
                    + Add Supplier
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowPOModal(true)}>
                    + Create PO
                  </button>
                </div>
              ) : (
                <span className="view-only-badge">View Only</span>
              )}
            </div>

            {isLoading ? (
              <div className="loading">Loading purchase orders...</div>
            ) : (
              <div className="po-table-container">
                <table className="osl-table">
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Supplier</th>
                      <th>Warehouse</th>
                      <th>Order Date</th>
                      <th>Expected</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map(po => (
                      <tr key={po.id}>
                        <td><strong>{po.poNumber}</strong></td>
                        <td>{po.supplierName}</td>
                        <td>{po.warehouseCode}</td>
                        <td>{formatDateTime(po.orderDate, { short: true })}</td>
                        <td>{formatDateTime(po.expectedDeliveryDate, { dateOnly: true, short: true })}</td>
                        <td>${po.totalAmount.toLocaleString()}</td>
                        <td><span className={`status-badge ${getStatusBadgeClass(po.status)}`}>{po.status}</span></td>
                        <td>
                          <button className="btn-link" onClick={() => setSelectedPO(po)}>View</button>
                          {po.status === 'Draft' && (
                            <button className="btn-link" onClick={() => handleUpdatePOStatus(po.id, 'Submitted')}>Submit</button>
                          )}
                          {po.status === 'Submitted' && (
                            <button className="btn-link" onClick={() => handleUpdatePOStatus(po.id, 'Confirmed')}>Confirm</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {poPagination.totalPages > 1 && (
              <div className="pagination">
                <button disabled={poPagination.page === 1} onClick={() => fetchPurchaseOrders(poPagination.page - 1)}>← Prev</button>
                <span>Page {poPagination.page} of {poPagination.totalPages}</span>
                <button disabled={poPagination.page === poPagination.totalPages} onClick={() => fetchPurchaseOrders(poPagination.page + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock Movement Modal */}
      {showMovementModal && (
        <div className="modal-overlay">
          <div className="modal movement-modal">
            <div className="modal-header">
              <h3>Record Stock Movement</h3>
              <button className="modal-close" onClick={() => setShowMovementModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Movement Type *</label>
                <select
                  value={newMovement.movementType}
                  onChange={(e) => setNewMovement({ ...newMovement, movementType: e.target.value })}
                >
                  <option value="Adjustment">Adjustment</option>
                  <option value="Inbound">Inbound</option>
                  <option value="Outbound">Outbound</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Return">Return</option>
                </select>
              </div>
              <div className="form-group">
                <label>{newMovement.movementType === 'Transfer' ? 'From Warehouse *' : 'Warehouse *'}</label>
                <select
                  value={newMovement.warehouseId}
                  onChange={(e) => setNewMovement({ ...newMovement, warehouseId: e.target.value })}
                >
                  <option value="">Select warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>
              {newMovement.movementType === 'Transfer' && (
                <div className="form-group">
                  <label>To Warehouse *</label>
                  <select
                    value={newMovement.toWarehouseId}
                    onChange={(e) => setNewMovement({ ...newMovement, toWarehouseId: e.target.value })}
                  >
                    <option value="">Select destination...</option>
                    {warehouses.filter(w => w.id.toString() !== newMovement.warehouseId).map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Commodity *</label>
                <select
                  value={newMovement.commodityId}
                  onChange={(e) => setNewMovement({ ...newMovement, commodityId: e.target.value })}
                >
                  <option value="">Select commodity...</option>
                  {commodities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={newMovement.quantity}
                  onChange={(e) => setNewMovement({ ...newMovement, quantity: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={newMovement.reason}
                  onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                  placeholder="e.g., Inventory adjustment, Stock correction"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newMovement.notes}
                  onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowMovementModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateMovement}>Record Movement</button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="modal-overlay">
          <div className="modal supplier-modal">
            <div className="modal-header">
              <h3>Add Supplier</h3>
              <button className="modal-close" onClick={() => setShowSupplierModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Name *</label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    value={newSupplier.code}
                    onChange={(e) => setNewSupplier({ ...newSupplier, code: e.target.value.toUpperCase() })}
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={newSupplier.contactName}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={newSupplier.contactEmail}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    value={newSupplier.contactPhone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={newSupplier.country}
                    onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Lead Time (Days)</label>
                  <input
                    type="number"
                    value={newSupplier.leadTimeDays}
                    onChange={(e) => setNewSupplier({ ...newSupplier, leadTimeDays: parseInt(e.target.value) || 30 })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Terms</label>
                  <input
                    type="text"
                    value={newSupplier.paymentTerms}
                    onChange={(e) => setNewSupplier({ ...newSupplier, paymentTerms: e.target.value })}
                    placeholder="e.g., Net 30"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSupplierModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateSupplier}>Add Supplier</button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Order Modal */}
      {showPOModal && (
        <div className="modal-overlay">
          <div className="modal po-modal">
            <div className="modal-header">
              <h3>Create Purchase Order</h3>
              <button className="modal-close" onClick={() => setShowPOModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier *</label>
                  <select
                    value={newPO.supplierId}
                    onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })}
                  >
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Destination Warehouse *</label>
                  <select
                    value={newPO.warehouseId}
                    onChange={(e) => setNewPO({ ...newPO, warehouseId: e.target.value })}
                  >
                    <option value="">Select warehouse...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expected Delivery Date</label>
                  <input
                    type="date"
                    value={newPO.expectedDeliveryDate}
                    onChange={(e) => setNewPO({ ...newPO, expectedDeliveryDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Shipping Method</label>
                  <input
                    type="text"
                    value={newPO.shippingMethod}
                    onChange={(e) => setNewPO({ ...newPO, shippingMethod: e.target.value })}
                    placeholder="e.g., Air Freight, Sea Freight"
                  />
                </div>
              </div>

              <div className="po-items-section">
                <div className="po-items-header">
                  <h4>Order Items</h4>
                  <button className="btn btn-sm btn-secondary" onClick={addPOItem}>+ Add Item</button>
                </div>
                {newPO.items.length === 0 ? (
                  <div className="no-items">No items added yet</div>
                ) : (
                  <div className="po-items-list">
                    {newPO.items.map((item, idx) => (
                      <div key={idx} className="po-item-row">
                        <select
                          value={item.commodityId}
                          onChange={(e) => updatePOItem(idx, 'commodityId', e.target.value)}
                          className="commodity-select"
                        >
                          <option value="">Select commodity...</option>
                          {commodities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updatePOItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="Qty"
                          min="1"
                          className="qty-input"
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updatePOItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="Unit Price"
                          step="0.01"
                          className="price-input"
                        />
                        <span className="item-total">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                        <button className="btn-remove" onClick={() => removePOItem(idx)}>×</button>
                      </div>
                    ))}
                    <div className="po-total">
                      <strong>Total: ${newPO.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newPO.notes}
                  onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPOModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreatePO}>Create PO</button>
            </div>
          </div>
        </div>
      )}

      {/* PO Detail Modal */}
      {selectedPO && (
        <div className="modal-overlay">
          <div className="modal po-detail-modal">
            <div className="modal-header">
              <h3>Purchase Order: {selectedPO.poNumber}</h3>
              <button className="modal-close" onClick={() => setSelectedPO(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="po-detail-grid">
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusBadgeClass(selectedPO.status)}`}>{selectedPO.status}</span>
                </div>
                <div className="detail-item">
                  <label>Supplier</label>
                  <span>{selectedPO.supplierName}</span>
                </div>
                <div className="detail-item">
                  <label>Warehouse</label>
                  <span>{selectedPO.warehouseName} ({selectedPO.warehouseCode})</span>
                </div>
                <div className="detail-item">
                  <label>Order Date</label>
                  <span>{formatDateTime(selectedPO.orderDate, { short: true })}</span>
                </div>
                <div className="detail-item">
                  <label>Expected Delivery</label>
                  <span>{formatDateTime(selectedPO.expectedDeliveryDate, { dateOnly: true, short: true })}</span>
                </div>
                <div className="detail-item">
                  <label>Total Amount</label>
                  <span><strong>${selectedPO.totalAmount.toLocaleString()}</strong></span>
                </div>
              </div>

              {selectedPO.items && selectedPO.items.length > 0 && (
                <div className="po-detail-items">
                  <h4>Items</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Commodity</th>
                        <th>Ordered</th>
                        <th>Received</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.items.map(item => (
                        <tr key={item.id}>
                          <td>{item.commodityName}</td>
                          <td>{item.quantityOrdered} {item.commodityUnit}</td>
                          <td>{item.quantityReceived} {item.commodityUnit}</td>
                          <td>${item.unitPrice.toFixed(2)}</td>
                          <td>${item.totalPrice.toFixed(2)}</td>
                          <td><span className={`status-badge ${getStatusBadgeClass(item.status)}`}>{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedPO.notes && (
                <div className="po-notes">
                  <label>Notes</label>
                  <p>{selectedPO.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedPO.status === 'Draft' && (
                <button className="btn btn-primary" onClick={() => handleUpdatePOStatus(selectedPO.id, 'Submitted')}>Submit PO</button>
              )}
              {selectedPO.status === 'Submitted' && (
                <button className="btn btn-primary" onClick={() => handleUpdatePOStatus(selectedPO.id, 'Confirmed')}>Confirm PO</button>
              )}
              {selectedPO.status === 'Confirmed' && (
                <button className="btn btn-primary" onClick={() => handleUpdatePOStatus(selectedPO.id, 'Shipped')}>Mark Shipped</button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedPO(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OSLOperations;
