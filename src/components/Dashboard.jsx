import { useState, useMemo, useEffect } from 'react';
import { chatAPI } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard({ stats, role, orders, commodities = [], onViewOrder, currentUser }) {
  const [messageCounts, setMessageCounts] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [weeksToShow, setWeeksToShow] = useState(8);
  const [commoditiesToShow, setCommoditiesToShow] = useState(5);
  const [countriesToShow, setCountriesToShow] = useState(5);
  const [filters, setFilters] = useState({
    country: '',
    status: '',
    priority: '',
    warehouse: '',
    dateFrom: '',
    dateTo: ''
  });

  // Apply filters to orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Country filter
      if (filters.country && order.country !== filters.country) return false;

      // Status filter
      if (filters.status && order.status !== filters.status) return false;

      // Priority filter
      if (filters.priority && order.priority !== filters.priority) return false;

      // Warehouse filter
      if (filters.warehouse && order.fulfillment_warehouse_code !== filters.warehouse) return false;

      // Date range filter
      if (filters.dateFrom) {
        const orderDate = new Date(order.created_at);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const orderDate = new Date(order.created_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const recentOrders = filteredOrders.slice(0, 5);

  // Get unique values for filter dropdowns
  const uniqueCountries = [...new Set(orders.map(o => o.country))].sort();
  const uniqueWarehouses = [...new Set(orders.map(o => o.fulfillment_warehouse_code).filter(Boolean))].sort();

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      country: '',
      status: '',
      priority: '',
      warehouse: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Fetch message counts when orders change
  useEffect(() => {
    const fetchMessageCounts = async () => {
      if (recentOrders && recentOrders.length > 0) {
        const orderIds = recentOrders.map(o => o.id);
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
  }, [recentOrders]);

  // Check if order is in a pending state
  const isPending = (status) => {
    return ['Submitted', 'Forwarded to OSL', 'Partially Fulfilled'].includes(status);
  };

  // Featured items logic
  const featuredItems = useMemo(() => {
    const importantCategories = [
      "Emergency Health Kits",
      "Pharmaceuticals",
      "Biomedical Equipment",
      "Cold Chain Equipment",
    ];
    const prioritizedItems = commodities
      .filter(item => importantCategories.includes(item.category))
      .sort((a, b) => (parseInt(a.stock, 10) || 0) - (parseInt(b.stock, 10) || 0));

    const sourceItems = prioritizedItems.length > 0 ? prioritizedItems : commodities;
    return sourceItems
      .slice(0, 4);
  }, [commodities]);

  // Format welcome message with username and country
  const getWelcomeMessage = () => {
    const name = currentUser?.name || 'User';
    const country = currentUser?.country;

    if (country) {
      return `${name}, ${country}`;
    }
    return name;
  };

  // Process chart data
  const chartData = useMemo(() => {
    // Orders by week (dynamic number of weeks)
    const weeklyData = {};
    const now = new Date();
    for (let i = weeksToShow - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekKey = `Week ${weeksToShow - i}`;
      weeklyData[weekKey] = { week: weekKey, orders: 0, shipped: 0 };
    }

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const weeksDiff = Math.floor((now - orderDate) / (7 * 24 * 60 * 60 * 1000));
      if (weeksDiff >= 0 && weeksDiff < weeksToShow) {
        const weekKey = `Week ${weeksToShow - weeksDiff}`;
        if (weeklyData[weekKey]) {
          weeklyData[weekKey].orders += 1;
          if (order.status === 'Shipped' || order.status === 'Completed') {
            weeklyData[weekKey].shipped += 1;
          }
        }
      }
    });

    // Orders by status
    const statusData = {};
    filteredOrders.forEach(order => {
      statusData[order.status] = (statusData[order.status] || 0) + 1;
    });

    // Orders by priority
    const priorityData = [
      { name: 'High', value: filteredOrders.filter(o => o.priority === 'High').length },
      { name: 'Medium', value: filteredOrders.filter(o => o.priority === 'Medium').length },
      { name: 'Low', value: filteredOrders.filter(o => o.priority === 'Low').length }
    ];

    // Orders by country (dynamic top N)
    const countryData = {};
    filteredOrders.forEach(order => {
      const country = order.country || 'Unknown';
      countryData[country] = (countryData[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, countriesToShow)
      .map(([name, value]) => ({ name, orders: value }));

    // Orders by commodity (dynamic top N) - count total quantity ordered
    // Filter orders based on role to show relevant commodities
    const commodityData = {};
    const relevantOrders = filteredOrders.filter(order => {
      // Laboratory Team: Show commodities from orders in their review queue
      if (role === 'Laboratory Team') {
        return ['Submitted', 'Forwarded to OSL', 'Approved', 'Partially Fulfilled', 'Shipped'].includes(order.status);
      }
      // OSL Team: Show commodities from orders in their fulfillment queue
      if (role === 'OSL Team') {
        return ['Forwarded to OSL', 'Approved', 'Partially Fulfilled', 'Shipped'].includes(order.status);
      }
      // Country Office and Super Admin: Show all filtered orders
      return true;
    });

    relevantOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const commodityName = item.commodity?.name || 'Unknown';
          if (!commodityData[commodityName]) {
            commodityData[commodityName] = 0;
          }
          commodityData[commodityName] += item.quantity || 0;
        });
      }
    });
    const topCommodities = Object.entries(commodityData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, commoditiesToShow)
      .map(([name, value]) => ({ name, quantity: value }));

    // OSL Turnaround Time Analysis
    const turnaroundData = {
      fast: 0,      // < 24 hours
      moderate: 0,  // 24-72 hours
      slow: 0,      // 73-168 hours (1 week)
      critical: 0   // > 168 hours
    };

    let totalTurnaroundHours = 0;
    let turnaroundCount = 0;

    filteredOrders.forEach(order => {
      if (order.osl_forwarded_at && order.osl_approved_at) {
        const forwardedDate = new Date(order.osl_forwarded_at);
        const approvedDate = new Date(order.osl_approved_at);
        const turnaroundHours = (approvedDate - forwardedDate) / (1000 * 60 * 60);

        totalTurnaroundHours += turnaroundHours;
        turnaroundCount++;

        if (turnaroundHours < 24) {
          turnaroundData.fast++;
        } else if (turnaroundHours < 72) {
          turnaroundData.moderate++;
        } else if (turnaroundHours < 168) {
          turnaroundData.slow++;
        } else {
          turnaroundData.critical++;
        }
      }
    });

    const averageTurnaroundHours = turnaroundCount > 0 ? totalTurnaroundHours / turnaroundCount : 0;
    const averageTurnaroundDays = (averageTurnaroundHours / 24).toFixed(1);

    const turnaroundChartData = [
      { name: '< 24h', value: turnaroundData.fast, label: 'Fast' },
      { name: '24-72h', value: turnaroundData.moderate, label: 'Moderate' },
      { name: '3-7d', value: turnaroundData.slow, label: 'Slow' },
      { name: '> 7d', value: turnaroundData.critical, label: 'Critical' }
    ];

    return {
      weekly: Object.values(weeklyData),
      status: Object.entries(statusData).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      priority: priorityData,
      countries: topCountries,
      commodities: topCommodities,
      turnaround: turnaroundChartData,
      averageTurnaround: averageTurnaroundDays,
      turnaroundCount: turnaroundCount
    };
  }, [filteredOrders, weeksToShow, commoditiesToShow, countriesToShow, role]);

  // ─── RENDER ───


  // ─── KPI config per role ───
  const kpiCards = (() => {
    const total = stats?.total ?? filteredOrders.length;
    if (role === 'Country Office') return [
      { lbl: 'My Orders', val: total, trend: '↑ All time', cls: 'hcoms-trend-up', spark: [35,52,44,60,72,68] },
      { lbl: 'Pending', val: stats?.pending ?? filteredOrders.filter(o => o.status === 'Submitted').length, trend: 'Awaiting review', cls: 'hcoms-trend-warn', spark: [28,35,30,42,38,44] },
      { lbl: 'Approved', val: stats?.approved ?? filteredOrders.filter(o => o.status === 'Approved').length, trend: '↑ This month', cls: 'hcoms-trend-up', spark: [20,24,30,35,40,48] },
      { lbl: 'Shipped', val: stats?.shipped ?? filteredOrders.filter(o => ['Shipped','Completed'].includes(o.status)).length, trend: '↑ Delivered', cls: 'hcoms-trend-up', spark: [15,20,28,32,36,42] },
    ];
    if (role === 'OSL Team') return [
      { lbl: 'Total Orders', val: total, trend: '↑ Active pipeline', cls: 'hcoms-trend-up', spark: [40,48,55,62,70,76] },
      { lbl: 'Pending Approval', val: stats?.pendingApproval ?? filteredOrders.filter(o => o.status === 'Forwarded to OSL').length, trend: 'Needs action', cls: 'hcoms-trend-warn', spark: [18,22,28,24,30,26] },
      { lbl: 'Approved', val: stats?.approved ?? filteredOrders.filter(o => o.status === 'Approved').length, trend: '↑ Fulfilled', cls: 'hcoms-trend-up', spark: [25,30,38,42,48,55] },
      { lbl: 'Low Stock SKUs', val: stats?.lowStockItems ?? 23, trend: '↘ Urgent', cls: 'hcoms-trend-down', spark: [70,65,58,50,44,38] },
    ];
    if (role === 'Laboratory Team') return [
      { lbl: 'Total Requests', val: total, trend: '↑ Active queue', cls: 'hcoms-trend-up', spark: [30,38,42,50,58,64] },
      { lbl: 'Pending Review', val: stats?.pendingReview ?? filteredOrders.filter(o => o.status === 'Submitted').length, trend: 'In queue', cls: 'hcoms-trend-warn', spark: [20,25,30,27,32,28] },
      { lbl: 'Forwarded', val: stats?.forwarded ?? filteredOrders.filter(o => o.status === 'Forwarded to OSL').length, trend: '↑ To OSL', cls: 'hcoms-trend-up', spark: [12,18,22,28,24,30] },
      { lbl: 'Processed', val: stats?.processed ?? filteredOrders.filter(o => ['Approved','Shipped'].includes(o.status)).length, trend: '↑ This month', cls: 'hcoms-trend-up', spark: [10,14,18,22,26,30] },
    ];
    // Super Admin / default
    return [
      { lbl: 'Total Orders', val: total, trend: '↑ 47 countries', cls: 'hcoms-trend-up', spark: [40,52,48,65,72,80] },
      { lbl: 'Pending', val: filteredOrders.filter(o => ['Submitted','Forwarded to OSL'].includes(o.status)).length, trend: 'Needs action', cls: 'hcoms-trend-warn', spark: [30,35,28,38,32,36] },
      { lbl: 'Fill Rate', val: `${chartData.turnaroundCount > 0 ? '94' : '--'}%`, trend: 'Target 95%', cls: 'hcoms-trend-up', spark: [75,80,82,84,88,92] },
      { lbl: 'Avg TAT', val: `${chartData.averageTurnaround}d`, trend: 'Turnaround', cls: 'hcoms-trend-up', spark: [20,18,15,12,10,8] },
    ];
  })();

  const statusColors = {
    'Submitted': 'hcoms-sp-s',
    'Forwarded to OSL': 'hcoms-sp-r',
    'Approved': 'hcoms-sp-a',
    'Shipped': 'hcoms-sp-t',
    'Completed': 'hcoms-sp-d',
    'Rejected': 'hcoms-sp-r',
    'Draft': 'hcoms-sp-s',
    'Under Review': 'hcoms-sp-r',
    'Partially Fulfilled': 'hcoms-sp-t',
  };

  const diseaseTag = (country) => {
    const map = { 'Nigeria':'dt-r', 'DR Congo':'dt-a', 'Ethiopia':'dt-b', 'Guinea':'dt-r', 'Mozambique':'dt-g' };
    return map[country] || 'dt-b';
  };

  const priorityBadge = (p) => {
    if (!p) return null;
    const upper = p.toUpperCase();
    if (upper === 'EMERGENCY' || upper === 'HIGH') return { cls: 'hcoms-pb-ft', label: '⚡ FAST-TRACK' };
    if (upper === 'ROUTINE' || upper === 'MEDIUM') return { cls: 'hcoms-pb-pt', label: '◎ PATTERN' };
    return { cls: 'hcoms-pb-st', label: '— STANDARD' };
  };

  return (
    <div className="hcoms-page">

      {/* ── TOPBAR ── */}
      <div className="hcoms-topbar">
        <div className="hcoms-page-title">
          <h2>Dashboard</h2>
          <p>Health Commodity Operations · {role || 'WHO AFRO'} · {filteredOrders.length} active orders</p>
        </div>
        <div className="hcoms-top-actions">
          <button className="neu-btn" style={{ padding: '9px 16px', fontSize: '12px' }}>⬇ Export</button>
          <button className="neu-primary" style={{ padding: '9px 18px', fontSize: '12px' }}>＋ New Request</button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="hcoms-stats">
        {kpiCards.map((k, i) => (
          <div key={i} className="neu-flat hcoms-stat-card">
            <div>
              <div className="hcoms-stat-icon-row">
                <span className="hcoms-stat-lbl">{k.lbl}</span>
                <div className="neu-circle hcoms-stat-icon" style={{ fontSize: '14px' }}>
                  {['📦','⏳','✅','📊'][i]}
                </div>
              </div>
              <div className="hcoms-stat-val">{k.val}</div>
              <div className={`hcoms-stat-trend ${k.cls}`}>{k.trend}</div>
            </div>
            <div className="hcoms-sparkline">
              {k.spark.map((h, si) => (
                <span key={si} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── FULFILLMENT PIPELINE ── */}
      {(role === 'OSL Team' || role === 'Super Admin') && (
        <div className="neu-flat" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neu-t1)' }}>Fulfillment Pipeline</span>
            <span style={{ fontSize: '11px', color: 'var(--neu-t3)' }}>Live · AFRO NBO + DKR</span>
          </div>
          <div className="hcoms-pipeline">
            {[
              { n: 1, name: 'Receiving', meta: 'Inbound shipments', badge: 'Stable' },
              { n: 2, name: 'Validation', meta: 'OSL review', badge: 'In Progress', warn: true },
              { n: 3, name: 'Allocation', meta: 'NBO / DKR routing', badge: 'Active' },
              { n: 4, name: 'Packing', meta: 'Kit preparation', badge: 'On Track' },
              { n: 5, name: 'Dispatch', meta: '47 member states', badge: 'On Time' },
            ].map(s => (
              <div key={s.n} className="hcoms-step">
                <div className="hcoms-step-num">{s.n}</div>
                <div className="hcoms-step-name">{s.name}</div>
                <div className="hcoms-step-meta">{s.meta}</div>
                <div className={`hcoms-step-badge${s.warn ? ' warn' : ''}`}>{s.badge}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MINI ANALYTICS ROW ── */}
      <div className="hcoms-grid-3-4">
        {[
          { label: 'By Country', items: chartData.countries.slice(0,4).map(c => ({ name: c.name, val: c.orders, max: Math.max(...chartData.countries.map(x=>x.orders),1) })) },
          { label: 'By Status', items: chartData.status.slice(0,4).map(s => ({ name: s.name, val: s.value, max: Math.max(...chartData.status.map(x=>x.value),1) })) },
          { label: 'By Priority', items: chartData.priority.slice(0,3).map(p => ({ name: p.name, val: p.value, max: Math.max(...chartData.priority.map(x=>x.value),1) })) },
          { label: 'By Commodity', items: chartData.commodities.slice(0,4).map(c => ({ name: c.name.substring(0,16)+'…', val: c.quantity, max: Math.max(...chartData.commodities.map(x=>x.quantity),1) })) },
        ].map((panel, pi) => (
          <div key={pi} className="neu-flat" style={{ padding: '14px 16px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--neu-t2)', marginBottom: '12px' }}>{panel.label}</div>
            {panel.items.length === 0
              ? <div style={{ fontSize: '11px', color: 'var(--neu-t3)' }}>No data yet</div>
              : panel.items.map((item, ii) => (
                <div key={ii} style={{ marginBottom: ii < panel.items.length - 1 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                    <span style={{ color: 'var(--neu-t2)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <span style={{ color: 'var(--neu-t1)' }}>{item.val}</span>
                  </div>
                  <div className="hcoms-track">
                    <div className="hcoms-fill" style={{ width: `${item.max > 0 ? Math.round((item.val / item.max) * 100) : 0}%` }} />
                  </div>
                </div>
              ))
            }
          </div>
        ))}
      </div>

      {/* ── RECENT ORDERS TABLE ── */}
      <div className="neu-flat hcoms-table-wrap">
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neu-t1)' }}>Recent Orders</span>
          <button
            className="neu-btn"
            style={{ padding: '6px 14px', fontSize: '11.5px' }}
            onClick={() => {/* navigate to orders */}}
          >
            View All →
          </button>
        </div>
        <table className="hcoms-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Country</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Items</th>
              <th>Messages</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--neu-t3)', padding: '24px' }}>No orders yet</td></tr>
            ) : recentOrders.map(order => {
              const pb = priorityBadge(order.priority);
              const statusCls = statusColors[order.status] || 'hcoms-sp-s';
              const hub = order.fulfillment_warehouse_code === 'DKR' ? 'hcoms-h-d' : 'hcoms-h-n';
              const hubLabel = order.fulfillment_warehouse_code || 'NBI';
              return (
                <tr
                  key={order.id}
                  onClick={() => onViewOrder && onViewOrder(order)}
                >
                  <td><span className="hcoms-oid">{order.order_number || order.id?.slice(0,12)}</span></td>
                  <td>
                    <div className="hcoms-cc">
                      <div className="hcoms-cav">🌍</div>
                      <div>
                        <div className="hcoms-cname">{order.country || '—'}</div>
                        <div className="hcoms-csub">{order.contact_name || order.submitted_by?.name || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {pb && <span className={`hcoms-pbadge ${pb.cls}`}>{pb.label}</span>}
                  </td>
                  <td>
                    <span className={`hcoms-spill ${statusCls}`}>
                      <span className="hcoms-sd" />
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--neu-t3)', fontSize: '11px', fontFamily: 'monospace' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '12px' }}>
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {messageCounts[order.id] ? (
                      <span className="hcoms-tab-badge" style={{ margin: 0 }}>
                        {messageCounts[order.id]}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--neu-t3)', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className="hcoms-acts">
                      <button
                        className="neu-circle hcoms-ab"
                        title="View order"
                        onClick={e => { e.stopPropagation(); onViewOrder && onViewOrder(order); }}
                      >👁</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="hcoms-tfoot">
          <span className="hcoms-tfoot-t">Showing 1–{recentOrders.length} of {filteredOrders.length} orders</span>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
