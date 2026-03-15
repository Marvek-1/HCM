/**
 * moscript://codex/v1
 * id:       mo-osl-fulfilltrack-004
 * name:     Fulfillment Tracker — GRN Validator
 * element:  🜃
 * trigger:  FULFILLMENT_RECONCILE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "The difference between dispatched and received
 *  is where people die."
 */

const moOslFulfilltrack004 = {
  id: 'mo-osl-fulfilltrack-004',
  name: 'Fulfillment Tracker',
  trigger: 'FULFILLMENT_RECONCILE',
  element: 'earth',
  inputs: ['requested', 'dispatched', 'confirmed', 'batchData', 'orderId'],

  logic: ({ requested = 0, dispatched = 0, confirmed = 0, batchData = [], orderId }) => {
    // Core metrics
    const gapRate = dispatched > 0
      ? parseFloat((((dispatched - confirmed) / dispatched) * 100).toFixed(1))
      : 0;
    const deliveryRate = dispatched > 0
      ? parseFloat(((confirmed / dispatched) * 100).toFixed(1))
      : 0;
    const requestFulfillmentRate = requested > 0
      ? parseFloat(((confirmed / requested) * 100).toFixed(1))
      : 0;

    // Status classification
    let status = 'HEALTHY';
    let statusColor = '#4ade80';
    if (gapRate > 10) {
      status = 'CRITICAL';
      statusColor = '#ef4444';
    } else if (gapRate > 5) {
      status = 'DEGRADED';
      statusColor = '#fbbf24';
    }

    // Batch/expiry analysis
    const expiryAlerts = [];
    const coldChainBreaches = [];
    const now = new Date();

    for (const batch of batchData) {
      if (batch.expiryDate) {
        const expiry = new Date(batch.expiryDate);
        const monthsToExpiry = (expiry - now) / (30 * 24 * 3600000);
        if (monthsToExpiry < 6) {
          expiryAlerts.push({
            itemCode: batch.itemCode,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate,
            monthsRemaining: Math.max(0, parseFloat(monthsToExpiry.toFixed(1))),
            severity: monthsToExpiry < 3 ? 'CRITICAL' : 'WARNING',
          });
        }
      }

      if (batch.temperatureAtReceipt !== undefined && batch.coldChainRequired) {
        const temp = batch.temperatureAtReceipt;
        if (temp < 2 || temp > 8) {
          coldChainBreaches.push({
            itemCode: batch.itemCode,
            batchNumber: batch.batchNumber,
            temperature: temp,
            requiredRange: '2-8°C',
            breach: temp < 2 ? 'BELOW_RANGE' : 'ABOVE_RANGE',
          });
        }
      }
    }

    // Supplier flag
    const supplierFlag = gapRate > 5 || coldChainBreaches.length > 0;

    // Generate insight
    let insight = '';
    if (status === 'HEALTHY' && expiryAlerts.length === 0 && coldChainBreaches.length === 0) {
      insight = 'Fulfillment cycle healthy. All items received in good condition.';
    } else {
      const parts = [];
      if (gapRate > 0) parts.push(`${gapRate}% gap between dispatched and received`);
      if (expiryAlerts.length > 0) parts.push(`${expiryAlerts.length} item(s) with short expiry (<6 months)`);
      if (coldChainBreaches.length > 0) parts.push(`${coldChainBreaches.length} cold chain breach(es) detected`);
      if (supplierFlag) parts.push('Flag for supplier quality review');
      insight = parts.join('. ') + '.';
    }

    return {
      orderId,
      requested,
      dispatched,
      confirmed,
      gapRate,
      deliveryRate,
      requestFulfillmentRate,
      status,
      statusColor,
      insight,
      supplierFlag,
      expiryAlerts,
      coldChainBreaches,
      batchCount: batchData.length,
      isPartialFulfillment: confirmed < requested,
      timestamp: new Date().toISOString(),
    };
  },

  voiceLine: (r) => {
    if (r.status === 'CRITICAL') {
      return `🔴 CRITICAL: Gap rate ${r.gapRate}%. ${r.insight}`;
    }
    if (r.status === 'DEGRADED') {
      return `⚠️ DEGRADED: Gap rate ${r.gapRate}%. ${r.insight}`;
    }
    if (r.coldChainBreaches?.length > 0) {
      return `🧊 COLD CHAIN BREACH: ${r.coldChainBreaches.length} item(s). Escalate to OSL.`;
    }
    return `✓ HEALTHY: Delivery rate ${r.deliveryRate}%. ${r.insight}`;
  },

  sass: "The difference between dispatched and received is where people die.",
};

export default moOslFulfilltrack004;
