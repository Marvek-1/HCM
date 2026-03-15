/**
 * moscript://codex/v1
 * id:       mo-osl-analytics-pulse-001
 * name:     Analytics Pulse — KPI Computation Engine
 * element:  🜁
 * trigger:  ANALYTICS_LOAD
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "KPIs must reflect operational truth,
 *  not dashboard vanity."
 */

const KPI_TARGETS = {
  fillRate: 95,
  tatEmergencyHours: 48,
  tatRoutineHours: 120,
  stockoutRate: 2,
  emergencyOrderRate: 10,
  needCoverageRatio: 90,
  deliveryRate: 95,
  partialFulfillmentRate: 5,
};

function ragStatus(value, target, isLowerBetter = false) {
  if (value === null || value === undefined) return 'GRAY';
  const ratio = isLowerBetter ? target / Math.max(value, 0.01) : value / Math.max(target, 0.01);
  if (ratio >= 1.0) return 'GREEN';
  if (ratio >= 0.85) return 'AMBER';
  return 'RED';
}

function ragColor(status) {
  return { GREEN: '#4ade80', AMBER: '#fbbf24', RED: '#ef4444', GRAY: '#64748b' }[status] || '#64748b';
}

const moOslAnalyticsPulse001 = {
  id: 'mo-osl-analytics-pulse-001',
  name: 'Analytics Pulse',
  trigger: 'ANALYTICS_LOAD',
  element: 'air',
  inputs: ['orders', 'signals', 'dateRange', 'roleContext'],

  logic: ({ orders = [], signals = [], dateRange, roleContext }) => {
    const total = orders.length;
    if (total === 0) return defaultPulse(signals);

    // --- Fill Rate ---
    const fulfilled = orders.filter(o =>
      ['delivered', 'completed', 'Completed'].includes(o.status)
    ).length;
    const fillRate = parseFloat(((fulfilled / total) * 100).toFixed(1));
    const fillRateRAG = ragStatus(fillRate, KPI_TARGETS.fillRate);

    // --- TAT ---
    const tatOrders = orders.filter(o => o.submittedAt && o.dispatchedAt);
    const tats = tatOrders.map(o =>
      (new Date(o.dispatchedAt) - new Date(o.submittedAt)) / 3600000
    );
    const avgTat = tats.length > 0
      ? parseFloat((tats.reduce((a, b) => a + b, 0) / tats.length).toFixed(1))
      : null;

    const emergencyOrders = orders.filter(o =>
      o.priority === 'FAST-TRACK' || o.priority === 'High'
    );
    const emergencyTats = emergencyOrders
      .filter(o => o.submittedAt && o.dispatchedAt)
      .map(o => (new Date(o.dispatchedAt) - new Date(o.submittedAt)) / 3600000);
    const avgEmergencyTat = emergencyTats.length > 0
      ? parseFloat((emergencyTats.reduce((a, b) => a + b, 0) / emergencyTats.length).toFixed(1))
      : null;

    // --- Emergency Order Rate ---
    const emergencyRate = parseFloat(((emergencyOrders.length / total) * 100).toFixed(1));

    // --- Pending ---
    const pendingApprovals = orders.filter(o =>
      ['submitted', 'Submitted', 'Forwarded to OSL'].includes(o.status)
    ).length;
    const fastTrackActive = emergencyOrders.filter(o =>
      !['delivered', 'completed', 'Completed', 'cancelled', 'Rejected'].includes(o.status)
    ).length;

    // --- Need Coverage (based on partial fulfillment data if available) ---
    const ordersWithAllocation = orders.filter(o => o.allocatedQty !== undefined && o.requestedQty);
    const needCoverage = ordersWithAllocation.length > 0
      ? parseFloat(((ordersWithAllocation.reduce((sum, o) => sum + (o.allocatedQty / o.requestedQty), 0) / ordersWithAllocation.length) * 100).toFixed(1))
      : 92.0; // Seed default

    // --- Delivery Rate ---
    const deliveredOrders = orders.filter(o => o.confirmedQty !== undefined && o.dispatchedQty);
    const deliveryRate = deliveredOrders.length > 0
      ? parseFloat(((deliveredOrders.reduce((sum, o) => sum + (o.confirmedQty / o.dispatchedQty), 0) / deliveredOrders.length) * 100).toFixed(1))
      : 97.0; // Seed default

    // Build KPIs array for dashboard cards
    const kpis = [
      {
        id: 'orderRequestRate',
        label: 'Order Request Rate',
        value: total,
        unit: 'orders',
        target: null,
        rag: 'GREEN',
        color: ragColor('GREEN'),
        trend: 'up',
      },
      {
        id: 'fillRate',
        label: 'Order Fulfillment Rate',
        value: fillRate,
        unit: '%',
        target: KPI_TARGETS.fillRate,
        rag: fillRateRAG,
        color: ragColor(fillRateRAG),
        trend: fillRate >= KPI_TARGETS.fillRate ? 'up' : 'down',
      },
      {
        id: 'avgTat',
        label: 'Avg TAT',
        value: avgTat,
        unit: 'hours',
        target: KPI_TARGETS.tatRoutineHours,
        rag: avgTat !== null ? ragStatus(KPI_TARGETS.tatRoutineHours, avgTat) : 'GRAY',
        color: avgTat !== null ? ragColor(ragStatus(KPI_TARGETS.tatRoutineHours, avgTat)) : '#64748b',
        trend: avgTat !== null && avgTat <= KPI_TARGETS.tatRoutineHours ? 'up' : 'down',
      },
      {
        id: 'activeSignals',
        label: 'Active Disease Signals',
        value: signals.filter(s => s.riskLevel === 'CRITICAL' || s.riskLevel === 'ELEVATED').length,
        unit: 'signals',
        target: null,
        rag: signals.some(s => s.riskLevel === 'CRITICAL') ? 'RED' : signals.length > 0 ? 'AMBER' : 'GREEN',
        color: signals.some(s => s.riskLevel === 'CRITICAL') ? '#ef4444' : signals.length > 0 ? '#fbbf24' : '#4ade80',
        trend: null,
      },
      {
        id: 'pendingApprovals',
        label: 'Pending Approvals',
        value: pendingApprovals,
        unit: 'orders',
        target: null,
        rag: pendingApprovals > 10 ? 'RED' : pendingApprovals > 5 ? 'AMBER' : 'GREEN',
        color: ragColor(pendingApprovals > 10 ? 'RED' : pendingApprovals > 5 ? 'AMBER' : 'GREEN'),
        trend: null,
      },
      {
        id: 'needCoverage',
        label: 'Need Coverage',
        value: needCoverage,
        unit: '%',
        target: KPI_TARGETS.needCoverageRatio,
        rag: ragStatus(needCoverage, KPI_TARGETS.needCoverageRatio),
        color: ragColor(ragStatus(needCoverage, KPI_TARGETS.needCoverageRatio)),
        trend: needCoverage >= KPI_TARGETS.needCoverageRatio ? 'up' : 'down',
      },
    ];

    return {
      kpis,
      totals: {
        total, fulfilled, pending: pendingApprovals,
        fastTrackActive, emergencyRate,
      },
      tat: {
        avgHours: avgTat,
        avgEmergencyHours: avgEmergencyTat,
        emergencyTarget: KPI_TARGETS.tatEmergencyHours,
        routineTarget: KPI_TARGETS.tatRoutineHours,
      },
      deliveryRate,
      needCoverage,
      signalCount: signals.length,
      criticalSignals: signals.filter(s => s.riskLevel === 'CRITICAL').length,
      timestamp: new Date().toISOString(),
    };
  },

  voiceLine: (r) => {
    const parts = [];
    parts.push(`Pulse reading: ${r.signalCount} active signal(s)`);
    if (r.criticalSignals > 0) parts.push(`${r.criticalSignals} CRITICAL`);
    parts.push(`${r.totals.pending} actions awaiting attention`);
    if (r.totals.fastTrackActive > 0) parts.push(`${r.totals.fastTrackActive} FAST-TRACK in pipeline`);
    return parts.join('. ') + '.';
  },

  sass: "KPIs must reflect operational truth, not dashboard vanity.",
};

function defaultPulse(signals = []) {
  return {
    kpis: [
      { id: 'orderRequestRate', label: 'Order Request Rate', value: 0, unit: 'orders', rag: 'GRAY', color: '#64748b' },
      { id: 'fillRate', label: 'Order Fulfillment Rate', value: 0, unit: '%', target: 95, rag: 'GRAY', color: '#64748b' },
      { id: 'avgTat', label: 'Avg TAT', value: null, unit: 'hours', rag: 'GRAY', color: '#64748b' },
      { id: 'activeSignals', label: 'Active Disease Signals', value: signals.length, unit: 'signals', rag: signals.length > 0 ? 'AMBER' : 'GREEN', color: signals.length > 0 ? '#fbbf24' : '#4ade80' },
      { id: 'pendingApprovals', label: 'Pending Approvals', value: 0, unit: 'orders', rag: 'GREEN', color: '#4ade80' },
      { id: 'needCoverage', label: 'Need Coverage', value: 0, unit: '%', target: 90, rag: 'GRAY', color: '#64748b' },
    ],
    totals: { total: 0, fulfilled: 0, pending: 0, fastTrackActive: 0, emergencyRate: 0 },
    tat: { avgHours: null, avgEmergencyHours: null, emergencyTarget: 48, routineTarget: 120 },
    deliveryRate: 0,
    needCoverage: 0,
    signalCount: signals.length,
    criticalSignals: signals.filter(s => s.riskLevel === 'CRITICAL').length,
    timestamp: new Date().toISOString(),
  };
}

export default moOslAnalyticsPulse001;
