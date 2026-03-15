/**
 * moscript://codex/v1
 * id:       mo-osl-analyticsvc-001
 * name:     Analytics Engine — KPI Calculator
 * element:  🜁
 * trigger:  ANALYTICS_COMPUTE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "KPIs must reflect operational truth,
 *  not dashboard vanity."
 */

const TARGETS = {
  fillRate: parseFloat(process.env.FILL_RATE_TARGET || '95'),
  tatEmergencyHours: parseFloat(process.env.TAT_EMERGENCY_TARGET_HOURS || '48'),
  tatRoutineHours: parseFloat(process.env.TAT_ROUTINE_TARGET_HOURS || '120'),
  stockoutRate: 2,
  emergencyOrderRate: 10,
  needCoverageRatio: 90,
  deliveryRate: 95,
  partialFulfillmentRate: 5,
};

function rag(value, target, lowerIsBetter = false) {
  if (value === null || value === undefined) return 'GRAY';
  const ratio = lowerIsBetter ? target / Math.max(value, 0.01) : value / Math.max(target, 0.01);
  if (ratio >= 1.0) return 'GREEN';
  if (ratio >= 0.85) return 'AMBER';
  return 'RED';
}

function computeKPIs(orders = [], signals = []) {
  const total = orders.length;
  if (total === 0) return defaultKPIs(signals);

  const fulfilled = orders.filter(o =>
    ['delivered', 'completed', 'Completed'].includes(o.status)
  ).length;
  const fillRate = parseFloat(((fulfilled / total) * 100).toFixed(1));

  const emergency = orders.filter(o =>
    o.priority === 'FAST-TRACK' || o.priority === 'High'
  );
  const emergencyRate = parseFloat(((emergency.length / total) * 100).toFixed(1));

  const tatOrders = orders.filter(o => o.submitted_at && o.dispatched_at);
  const tats = tatOrders.map(o =>
    (new Date(o.dispatched_at) - new Date(o.submitted_at)) / 3600000
  );
  const avgTat = tats.length > 0
    ? parseFloat((tats.reduce((a, b) => a + b, 0) / tats.length).toFixed(1))
    : null;

  const eTatOrders = emergency.filter(o => o.submitted_at && o.dispatched_at);
  const eTats = eTatOrders.map(o =>
    (new Date(o.dispatched_at) - new Date(o.submitted_at)) / 3600000
  );
  const avgEmergencyTat = eTats.length > 0
    ? parseFloat((eTats.reduce((a, b) => a + b, 0) / eTats.length).toFixed(1))
    : null;

  const pending = orders.filter(o =>
    ['submitted', 'Submitted', 'Forwarded to OSL', 'forwarded'].includes(o.status)
  ).length;
  const fastTrackActive = emergency.filter(o =>
    !['delivered', 'completed', 'Completed', 'cancelled', 'Rejected'].includes(o.status)
  ).length;

  return {
    kpis: {
      fillRate: { value: fillRate, target: TARGETS.fillRate, rag: rag(fillRate, TARGETS.fillRate) },
      avgTatHours: { value: avgTat, target: TARGETS.tatRoutineHours, rag: avgTat !== null ? rag(TARGETS.tatRoutineHours, avgTat) : 'GRAY' },
      avgEmergencyTatHours: { value: avgEmergencyTat, target: TARGETS.tatEmergencyHours, rag: avgEmergencyTat !== null ? rag(TARGETS.tatEmergencyHours, avgEmergencyTat) : 'GRAY' },
      emergencyRate: { value: emergencyRate, target: TARGETS.emergencyOrderRate, rag: rag(TARGETS.emergencyOrderRate, emergencyRate) },
      activeSignals: { value: signals.length, rag: signals.some(s => s.riskLevel === 'CRITICAL') ? 'RED' : signals.length > 0 ? 'AMBER' : 'GREEN' },
      pendingApprovals: { value: pending, rag: pending > 10 ? 'RED' : pending > 5 ? 'AMBER' : 'GREEN' },
    },
    totals: { total, fulfilled, pending, fastTrackActive, emergencyRate },
    targets: TARGETS,
    moScriptId: 'mo-osl-analytics-pulse-001',
    timestamp: new Date().toISOString(),
  };
}

function defaultKPIs(signals = []) {
  return {
    kpis: {
      fillRate: { value: 0, target: TARGETS.fillRate, rag: 'GRAY' },
      avgTatHours: { value: null, target: TARGETS.tatRoutineHours, rag: 'GRAY' },
      avgEmergencyTatHours: { value: null, target: TARGETS.tatEmergencyHours, rag: 'GRAY' },
      emergencyRate: { value: 0, target: TARGETS.emergencyOrderRate, rag: 'GRAY' },
      activeSignals: { value: signals.length, rag: signals.length > 0 ? 'AMBER' : 'GREEN' },
      pendingApprovals: { value: 0, rag: 'GREEN' },
    },
    totals: { total: 0, fulfilled: 0, pending: 0, fastTrackActive: 0, emergencyRate: 0 },
    targets: TARGETS,
    moScriptId: 'mo-osl-analytics-pulse-001',
    timestamp: new Date().toISOString(),
  };
}

function computeTrends(orders = [], days = 90) {
  const now = Date.now();
  const cutoff = now - (days * 24 * 3600000);
  const filtered = orders.filter(o =>
    o.submitted_at && new Date(o.submitted_at).getTime() > cutoff
  );

  // Group by day
  const byDay = {};
  for (const order of filtered) {
    const day = new Date(order.submitted_at).toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = { date: day, submitted: 0, fulfilled: 0, emergency: 0 };
    byDay[day].submitted++;
    if (['delivered', 'completed', 'Completed'].includes(order.status)) byDay[day].fulfilled++;
    if (order.priority === 'FAST-TRACK' || order.priority === 'High') byDay[day].emergency++;
  }

  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

module.exports = { computeKPIs, computeTrends, TARGETS };
