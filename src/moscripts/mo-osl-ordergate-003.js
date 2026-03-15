/**
 * moscript://codex/v1
 * id:       mo-osl-ordergate-003
 * name:     Order Gate — Allocation Intelligence
 * element:  🜂
 * trigger:  ORDER_VALIDATE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "The system doesn't ask what you want.
 *  It says: your need is covered. Confirm dispatch."
 */

const moOslOrdergate003 = {
  id: 'mo-osl-ordergate-003',
  name: 'Order Gate',
  trigger: 'ORDER_VALIDATE',
  element: 'fire',
  inputs: ['country', 'items', 'activeSignals', 'dispatchHistory', 'sessionId'],

  logic: ({ country, items = [], activeSignals = [], dispatchHistory = [], sessionId }) => {
    const countrySignals = activeSignals.filter(
      s => s.country === country || (s.affectedCountries || []).includes(country)
    );

    const hasCritical = countrySignals.some(s => s.riskLevel === 'CRITICAL');
    const hasElevated = countrySignals.some(s => s.riskLevel === 'ELEVATED');

    // Check if items match any active disease protocol
    const matchedProtocols = [];
    for (const signal of countrySignals) {
      const protocolItems = signal.protocolItems || [];
      const matchedItems = items.filter(i =>
        protocolItems.includes(i.itemCode || i.code)
      );
      if (matchedItems.length > 0) {
        matchedProtocols.push({
          disease: signal.disease,
          riskLevel: signal.riskLevel,
          matchedItems: matchedItems.length,
          totalProtocolItems: protocolItems.length,
        });
      }
    }

    // Check recent dispatch history for this country (pattern detection)
    const recentDispatches = dispatchHistory.filter(d =>
      d.country === country &&
      (Date.now() - new Date(d.dispatchedAt).getTime()) < 30 * 24 * 3600000
    );

    const isRepeatRequest = recentDispatches.some(d => {
      const previousItems = (d.items || []).map(i => i.itemCode);
      const currentItems = items.map(i => i.itemCode || i.code);
      const overlap = currentItems.filter(c => previousItems.includes(c));
      return overlap.length > currentItems.length * 0.7;
    });

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
      rationale = `Elevated ${matchedProtocols[0].disease} signal in ${country}. Protocol items match active outbreak. Priority processing.`;
    } else if (isRepeatRequest) {
      recommendation = 'PATTERN';
      priority = 2;
      rationale = `Pattern detected: similar request dispatched within 30 days. Verify consumption rate before duplicate dispatch.`;
    } else if (countrySignals.length > 0) {
      recommendation = 'FAST-TRACK';
      priority = 2;
      rationale = `Active signals detected for ${country}, but items don't match standard protocol kits. Verify clinical justification.`;
    }

    // Hub assignment (based on country geography)
    const eastAfricaCountries = ['KEN', 'UGA', 'TZA', 'ETH', 'SOM', 'SSD', 'RWA', 'BDI', 'ERI', 'DJI', 'COD', 'MDG', 'MOZ', 'MWI', 'ZMB', 'ZWE'];
    const primaryHub = eastAfricaCountries.includes(country) ? 'Nairobi' : 'Dakar';
    const fallbackHub = primaryHub === 'Nairobi' ? 'Dakar' : 'Nairobi';

    return {
      recommendation,
      priority,
      rationale,
      country,
      activeSignals: countrySignals.length,
      matchedProtocols,
      isRepeatRequest,
      primaryHub,
      fallbackHub,
      hubFailoverHours: 4,
      itemCount: items.length,
      sessionId: sessionId || null,
      riskLevel: hasCritical ? 'CRITICAL' : hasElevated ? 'ELEVATED' : 'BASELINE',
      timestamp: new Date().toISOString(),
    };
  },

  voiceLine: (r) => {
    if (r.recommendation === 'FAST-TRACK') {
      return `🔴 FAST-TRACK: ${r.rationale} Hub: ${r.primaryHub}.`;
    }
    if (r.recommendation === 'PATTERN') {
      return `⚠️ PATTERN: ${r.rationale}`;
    }
    return `✓ STANDARD: ${r.rationale} Hub: ${r.primaryHub}.`;
  },

  sass: "I don't process orders. I interrogate them.",
};

export default moOslOrdergate003;
