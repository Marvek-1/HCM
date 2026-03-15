import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { oslAPI, commoditiesAPI } from '../services/api';
import { formatDateTime, formatDateRange } from '../utils/helpers';
import '../styles/OSLOperations.css';

function OSLOperations({ warehouses = [], oslAdminLevel }) {
  // OSL permission helpers
  const canEdit = oslAdminLevel === 0 || oslAdminLevel === 1; // Level 0-1 can edit
  const isViewOnly = oslAdminLevel === 2; // Level 2 is view-only

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


  // ─── RENDER HELPERS ───
  const tabDefs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'outbound',  label: '📤 Outbound' },
    { id: 'inventory', label: '📦 Inventory' },
    { id: 'procurement', label: '🛒 Procurement' },
  ];

  const statusNeu = (s) => {
    const m = {
      'Pending': 'hcoms-sp-r', 'In Transit': 'hcoms-sp-t',
      'Delivered': 'hcoms-sp-d', 'Shipped': 'hcoms-sp-t',
      'Completed': 'hcoms-sp-d', 'Draft': 'hcoms-sp-s',
      'Approved': 'hcoms-sp-a', 'Rejected': 'hcoms-sp-r',
      'Cancelled': 'hcoms-sp-r',
    };
    return m[s] || 'hcoms-sp-s';
  };

  return (
    <div className="hcoms-page">

      {/* ── TOPBAR ── */}
      <div className="hcoms-topbar">
        <div className="hcoms-page-title">
          <h2>OSL Operations Center</h2>
          <p>Outbound shipments · Inventory · Procurement · Nairobi & Dakar hubs</p>
        </div>
        <div className="hcoms-top-actions">
          <span className="hcoms-hchip hcoms-h-n" style={{ fontSize: 11, padding: '5px 11px' }}>NBI Hub</span>
          <span className="hcoms-hchip hcoms-h-d" style={{ fontSize: 11, padding: '5px 11px' }}>DKR Hub</span>
          {canEdit && (
            <button className="neu-primary" style={{ padding: '9px 18px', fontSize: '12px' }}>
              ＋ New Operation
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: 8 }}>
        {tabDefs.map(t => (
          <button
            key={t.id}
            className={`hcoms-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════
          TAB: DASHBOARD
      ══════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* KPI strip from dashboardData */}
          <div className="hcoms-stats">
            {[
              { lbl: 'Total POs', val: dashboardData?.procurement?.total_orders ?? '—', icon: '🛒', trend: '90 day window', cls: 'hcoms-trend-up' },
              { lbl: 'In Transit', val: dashboardData?.procurement?.in_transit ?? '—', icon: '🚚', trend: 'Active shipments', cls: 'hcoms-trend-up' },
              { lbl: 'Pending', val: dashboardData?.procurement?.pending_orders ?? '—', icon: '⏳', trend: 'Awaiting action', cls: 'hcoms-trend-warn' },
              { lbl: 'Total Value', val: dashboardData?.procurement?.total_value ? `$${parseFloat(dashboardData.procurement.total_value).toLocaleString()}` : '—', icon: '💰', trend: 'USD', cls: 'hcoms-trend-up' },
            ].map((k, i) => (
              <div key={i} className="neu-flat hcoms-stat-card">
                <div className="hcoms-stat-icon-row">
                  <span className="hcoms-stat-lbl">{k.lbl}</span>
                  <div className="neu-circle hcoms-stat-icon" style={{ fontSize: 14 }}>{k.icon}</div>
                </div>
                <div className="hcoms-stat-val" style={{ fontSize: 22 }}>{k.val}</div>
                <div className={`hcoms-stat-trend ${k.cls}`}>{k.trend}</div>
              </div>
            ))}
          </div>

          {/* Warehouse status cards */}
          <div className="hcoms-grid-2">
            <div className="neu-flat" style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neu-t1)', marginBottom: 14 }}>🏭 Warehouse Status</div>
              {dashboardData?.warehouses?.length ? dashboardData.warehouses.map(w => (
                <div key={w.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--neu-t3)' }}>{w.code} · {w.location || 'AFRO Region'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="hcoms-spill hcoms-sp-s" style={{ fontSize: 10 }}>
                      <span className="hcoms-sd" />
                      {w.total_items ?? 0} SKUs
                    </span>
                    <span className={`hcoms-hchip ${w.code === 'DKR' ? 'hcoms-h-d' : 'hcoms-h-n'}`}>{w.code}</span>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--neu-t3)', fontSize: 12, padding: '16px 0' }}>No warehouse data loaded. Check API connection.</div>
              )}
            </div>

            {/* Low stock alerts */}
            <div className="neu-flat" style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neu-t1)', marginBottom: 14 }}>⚠️ Low Stock Alerts</div>
              {dashboardData?.lowStock?.length ? dashboardData.lowStock.slice(0, 6).map((item, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 600, marginBottom: 3 }}>
                    <span style={{ color: 'var(--neu-t2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name || item.commodity_name}</span>
                    <span style={{ color: item.stock < 10 ? 'var(--hc-red)' : 'var(--hc-amber)' }}>{item.stock ?? 0} left</span>
                  </div>
                  <div className="hcoms-track">
                    <div className="hcoms-fill" style={{ width: `${Math.min(100, ((item.stock ?? 0) / (item.reorder_level ?? 100)) * 100)}%`, background: item.stock < 10 ? 'linear-gradient(90deg, #f4a227, #e84855)' : undefined }} />
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--neu-t3)', fontSize: 12, padding: '16px 0' }}>No low-stock alerts at this time.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: OUTBOUND SHIPMENTS
      ══════════════════════════════ */}
      {activeTab === 'outbound' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="hcoms-filter-bar neu-flat">
            <div style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>Outbound Shipments</div>
            <select
              className="hcoms-fsel"
              value={shipmentFilter.status}
              onChange={e => setShipmentFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
            <select
              className="hcoms-fsel"
              value={shipmentFilter.warehouseId}
              onChange={e => setShipmentFilter(f => ({ ...f, warehouseId: e.target.value }))}
            >
              <option value="">All Hubs</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
            {canEdit && (
              <button className="neu-primary" style={{ padding: '8px 16px', fontSize: 12 }}>＋ Shipment</button>
            )}
          </div>

          <div className="neu-flat hcoms-table-wrap">
            <table className="hcoms-table">
              <thead>
                <tr>
                  <th>Shipment Ref</th>
                  <th>Order Ref</th>
                  <th>Destination</th>
                  <th>Hub</th>
                  <th>Status</th>
                  <th>Carrier</th>
                  <th>ETA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--neu-t3)', padding: 28 }}>No shipments loaded — API or data pending</td></tr>
                ) : shipments.map(s => (
                  <tr key={s.id}>
                    <td><span className="hcoms-oid">{s.shipment_number || s.id?.slice(0,12)}</span></td>
                    <td><span className="hcoms-oid" style={{ color: 'var(--neu-t3)' }}>{s.order_number || '—'}</span></td>
                    <td>
                      <div className="hcoms-cname">{s.destination_country || s.destination || '—'}</div>
                      <div className="hcoms-csub">{s.consignee || ''}</div>
                    </td>
                    <td><span className={`hcoms-hchip ${s.warehouse_code === 'DKR' ? 'hcoms-h-d' : 'hcoms-h-n'}`}>{s.warehouse_code || 'NBI'}</span></td>
                    <td>
                      <span className={`hcoms-spill ${statusNeu(s.status)}`}>
                        <span className="hcoms-sd" />{s.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--neu-t2)' }}>{s.carrier || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--neu-t3)', fontFamily: 'monospace' }}>
                      {s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td>
                      <div className="hcoms-acts">
                        <button className="neu-circle hcoms-ab" title="View">👁</button>
                        {canEdit && <button className="neu-circle hcoms-ab" title="Edit">✏️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hcoms-tfoot">
              <span className="hcoms-tfoot-t">
                {shipmentPagination.total} total shipments · Page {shipmentPagination.page}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: INVENTORY / STOCK MOVEMENTS
      ══════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="hcoms-filter-bar neu-flat">
            <div style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>Stock Movements</div>
            <select
              className="hcoms-fsel"
              value={movementFilter.warehouseId}
              onChange={e => setMovementFilter(f => ({ ...f, warehouseId: e.target.value }))}
            >
              <option value="">All Hubs</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
            <select
              className="hcoms-fsel"
              value={movementFilter.movementType}
              onChange={e => setMovementFilter(f => ({ ...f, movementType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Transfer">Transfer</option>
              <option value="Adjustment">Adjustment</option>
            </select>
            {canEdit && (
              <button className="neu-primary" style={{ padding: '8px 16px', fontSize: 12 }}
                onClick={() => setShowMovementModal(true)}>＋ Record Movement</button>
            )}
          </div>

          <div className="neu-flat hcoms-table-wrap">
            <table className="hcoms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Commodity</th>
                  <th>Type</th>
                  <th>Hub</th>
                  <th>Qty</th>
                  <th>Reason</th>
                  <th>Ref</th>
                </tr>
              </thead>
              <tbody>
                {stockMovements.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--neu-t3)', padding: 28 }}>No stock movements recorded</td></tr>
                ) : stockMovements.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 11, color: 'var(--neu-t3)', fontFamily: 'monospace' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—'}
                    </td>
                    <td>
                      <div className="hcoms-cname">{m.commodity?.name || m.commodity_name || '—'}</div>
                      <div className="hcoms-csub">{m.commodity?.code || ''}</div>
                    </td>
                    <td>
                      <span className={`hcoms-pbadge ${m.movement_type === 'Inbound' ? 'hcoms-pb-pt' : m.movement_type === 'Outbound' ? 'hcoms-pb-ft' : 'hcoms-pb-st'}`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td><span className={`hcoms-hchip ${m.warehouse?.code === 'DKR' ? 'hcoms-h-d' : 'hcoms-h-n'}`}>{m.warehouse?.code || 'NBI'}</span></td>
                    <td style={{ fontWeight: 700, fontSize: 13, color: m.movement_type === 'Outbound' ? 'var(--hc-red)' : 'var(--hc-green)' }}>
                      {m.movement_type === 'Outbound' ? '-' : '+'}{m.quantity ?? 0}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--neu-t2)' }}>{m.reason || '—'}</td>
                    <td><span className="hcoms-oid">{m.reference || m.id?.slice(0,8)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hcoms-tfoot">
              <span className="hcoms-tfoot-t">{movementPagination.total} movements · Page {movementPagination.page}</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: PROCUREMENT
      ══════════════════════════════ */}
      {activeTab === 'procurement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="hcoms-filter-bar neu-flat">
            <div style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>Purchase Orders</div>
            <select
              className="hcoms-fsel"
              value={poFilter.status}
              onChange={e => setPoFilter(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
            </select>
            {canEdit && (
              <button className="neu-btn" style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={() => setShowSupplierModal(true)}>+ Supplier</button>
            )}
            {canEdit && (
              <button className="neu-primary" style={{ padding: '8px 16px', fontSize: 12 }}
                onClick={() => setShowPOModal(true)}>＋ Purchase Order</button>
            )}
          </div>

          <div className="neu-flat hcoms-table-wrap">
            <table className="hcoms-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Expected</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--neu-t3)', padding: 28 }}>No purchase orders yet</td></tr>
                ) : purchaseOrders.map(po => (
                  <tr key={po.id} onClick={() => setSelectedPO(po)} style={{ cursor: 'pointer' }}>
                    <td><span className="hcoms-oid">{po.po_number || po.id?.slice(0,12)}</span></td>
                    <td>
                      <div className="hcoms-cname">{po.supplier?.name || '—'}</div>
                      <div className="hcoms-csub">{po.supplier?.country || ''}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{po.items?.length ?? po.line_count ?? 0} lines</td>
                    <td style={{ fontWeight: 700 }}>${parseFloat(po.total_value || 0).toLocaleString()}</td>
                    <td>
                      <span className={`hcoms-spill ${statusNeu(po.status)}`}>
                        <span className="hcoms-sd" />{po.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--neu-t3)', fontFamily: 'monospace' }}>
                      {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—'}
                    </td>
                    <td>
                      <div className="hcoms-acts">
                        <button className="neu-circle hcoms-ab">👁</button>
                        {canEdit && <button className="neu-circle hcoms-ab">✏️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hcoms-tfoot">
              <span className="hcoms-tfoot-t">{poPagination.total} purchase orders · Page {poPagination.page}</span>
            </div>
          </div>

          {/* Suppliers quick list */}
          {suppliers.length > 0 && (
            <div className="neu-flat" style={{ padding: '14px 18px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Registered Suppliers</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suppliers.map(s => (
                  <span key={s.id} className="hcoms-dtag hcoms-dt-b">{s.name} · {s.country}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default OSLOperations;
