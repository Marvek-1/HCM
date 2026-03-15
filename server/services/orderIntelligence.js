/**
 * moscript://codex/v1
 * id:       mo-osl-orderintelsvc-001
 * name:     Order Intelligence — Server-Side Gate Logic
 * element:  🜂
 * trigger:  ORDER_VALIDATE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "I don't process orders. I interrogate them."
 */

const signalService = require('./signalService');

// Hub assignment based on country geography
const EAST_AFRICA = [
  'KEN', 'UGA', 'TZA', 'ETH', 'SOM', 'SSD', 'RWA', 'BDI', 'ERI', 'DJI',
  'COD', 'MDG', 'MOZ', 'MWI', 'ZMB', 'ZWE', 'BWA', 'LSO', 'SWZ', 'NAM',
  'ZAF', 'COM', 'MUS', 'SYC', 'AGO',
];

async function validateOrder({ country, items = [], sessionId }) {
  const signals = await signalService.getActiveSignals();
  const countrySignals = signals.filter(
    s => s.country === country || (s.affectedCountries || []).includes(country)
  );

  const hasCritical = countrySignals.some(s => s.riskLevel === 'CRITICAL');
  const hasElevated = countrySignals.some(s => s.riskLevel === 'ELEVATED');

  // Match items against disease protocol kits
  const matchedProtocols = [];
  for (const signal of countrySignals) {
    const protocolItems = signal.protocolItems || [];
    const matched = items.filter(i => protocolItems.includes(i.itemCode || i.code));
    if (matched.length > 0) {
      matchedProtocols.push({
        disease: signal.disease,
        riskLevel: signal.riskLevel,
        matchedItems: matched.length,
        totalProtocolItems: protocolItems.length,
        source: signal.source,
      });
    }
  }

  // Determine recommendation
  let recommendation = 'STANDARD';
  let priority = 3;
  let rationale = 'No active disease signals for this country. Standard processing.';

  if (hasCritical && matchedProtocols.length > 0) {
    recommendation = 'FAST-TRACK';
    priority = 1;
    rationale = `Active ${matchedProtocols[0].disease} signal (CRITICAL) in ${country}. ${matchedProtocols[0].matchedItems} protocol items detected. Immediate dispatch recommended.`;
  } else if (hasElevated && matchedProtocols.length > 0) {
    recommendation = 'FAST-TRACK';
    priority = 2;
    rationale = `Elevated ${matchedProtocols[0].disease} signal in ${country}. Priority processing.`;
  } else if (countrySignals.length > 0) {
    recommendation = 'FAST-TRACK';
    priority = 2;
    rationale = `Active signals for ${country} but items don't match standard protocol kits. Verify clinical justification.`;
  }

  // Hub routing
  const primaryHub = EAST_AFRICA.includes(country) ? 'Nairobi' : 'Dakar';
  const fallbackHub = primaryHub === 'Nairobi' ? 'Dakar' : 'Nairobi';

  return {
    recommendation,
    priority,
    rationale,
    country,
    activeSignals: countrySignals.length,
    matchedProtocols,
    primaryHub,
    fallbackHub,
    hubFailoverHours: parseInt(process.env.HUB_FAILOVER_TIMEOUT_HOURS || '4', 10),
    riskLevel: hasCritical ? 'CRITICAL' : hasElevated ? 'ELEVATED' : 'BASELINE',
    itemCount: items.length,
    sessionId: sessionId || null,
    moScriptId: 'mo-osl-ordergate-003',
    timestamp: new Date().toISOString(),
  };
}

module.exports = { validateOrder };
