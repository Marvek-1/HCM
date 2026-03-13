/**
 * ═══════════════════════════════════════════════════════════════════════════
 * mo-osl-signalbridge-002 — Signal Bridge
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Signal Bridge", layer: "osl", version: "2026.03.12" }
 *
 * @capabilities
 *   - outbreak_signal_detection
 *   - severity_assessment
 *   - protocol_alert_generation
 *
 * @intents
 *   - { id: "signal.check", input: "protocolName", output: "signal_status" }
 *   - { id: "signal.alert", input: "commodity", output: "alert_level" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "I see the signals before the outbreak sees you."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { getSignalsForProtocol, hasActiveEmergency } from '../data/signals.js';

const moOslSignalbridge002 = {
  id: "mo-osl-signalbridge-002",
  name: "Signal Bridge",
  trigger: "SIGNAL_CHECK",
  inputs: ["protocolName", "commodity"],

  logic: ({ protocolName, commodity }) => {
    const signals = protocolName ? getSignalsForProtocol(protocolName) : [];
    const isEmergency = protocolName ? hasActiveEmergency(protocolName) : false;
    
    // Check if commodity is in any active protocol
    let commodityAlerts = [];
    if (commodity && commodity.protocols) {
      commodity.protocols.forEach(protocol => {
        const protocolSignals = getSignalsForProtocol(protocol);
        if (protocolSignals.length > 0) {
          commodityAlerts.push({
            protocol,
            signals: protocolSignals,
            severity: Math.max(...protocolSignals.map(s => s.severity)),
          });
        }
      });
    }

    return {
      protocolName,
      signals,
      isEmergency,
      activeSignalCount: signals.length,
      commodityAlerts,
      alertLevel: isEmergency ? 'CRITICAL' : signals.length > 0 ? 'WARNING' : 'NORMAL',
      timestamp: new Date().toISOString(),
    };
  },

  voiceLine: (r) => {
    if (r.isEmergency) {
      return `🔴 EMERGENCY: ${r.protocolName} has severity 4+ outbreak. Priority response required.`;
    }
    if (r.activeSignalCount > 0) {
      return `⚠️ ${r.activeSignalCount} active signal(s) for ${r.protocolName}. Monitor closely.`;
    }
    return `✓ No active signals for ${r.protocolName}. Status normal.`;
  },

  sass: "I see the signals before the outbreak sees you.",
};

export default moOslSignalbridge002;
