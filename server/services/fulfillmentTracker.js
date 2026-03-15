/**
 * moscript://codex/v1
 * id:       mo-osl-fulfillsvc-001
 * name:     Fulfillment Tracker — Server-Side GRN Reconciliation
 * element:  🜃
 * trigger:  FULFILLMENT_RECONCILE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "The difference between dispatched and received
 *  is where people die."
 */

function reconcile({ orderId, requested = 0, dispatched = 0, confirmed = 0, batchData = [] }) {
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
  if (gapRate > 10) status = 'CRITICAL';
  else if (gapRate > 5) status = 'DEGRADED';

  // Batch expiry analysis
  const expiryAlerts = [];
  const coldChainBreaches = [];
  const now = new Date();

  for (const batch of batchData) {
    if (batch.expiryDate) {
      const monthsToExpiry = (new Date(batch.expiryDate) - now) / (30 * 24 * 3600000);
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
        });
      }
    }
  }

  const supplierFlag = gapRate > 5 || coldChainBreaches.length > 0;

  // Generate insight
  let insight = 'Fulfillment cycle healthy. All items received in good condition.';
  if (status !== 'HEALTHY' || expiryAlerts.length > 0 || coldChainBreaches.length > 0) {
    const parts = [];
    if (gapRate > 0) parts.push(`${gapRate}% gap between dispatched and received`);
    if (expiryAlerts.length > 0) parts.push(`${expiryAlerts.length} item(s) with short expiry`);
    if (coldChainBreaches.length > 0) parts.push(`${coldChainBreaches.length} cold chain breach(es)`);
    if (supplierFlag) parts.push('Flag for supplier quality review');
    insight = parts.join('. ') + '.';
  }

  return {
    orderId,
    requested, dispatched, confirmed,
    gapRate, deliveryRate, requestFulfillmentRate,
    status, insight, supplierFlag,
    expiryAlerts, coldChainBreaches,
    isPartialFulfillment: confirmed < requested,
    moScriptId: 'mo-osl-fulfilltrack-004',
    timestamp: new Date().toISOString(),
  };
}

module.exports = { reconcile };
