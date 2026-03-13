/**
 * ═══════════════════════════════════════════════════════════════════════════
 * signals.js — Disease Outbreak Signal Database
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Signal Database", layer: "data", version: "2026.03.12" }
 *
 * @capabilities
 *   - disease_signal_storage
 *   - severity_classification
 *   - protocol_signal_filtering
 *   - emergency_detection
 *
 * @intents
 *   - { id: "signal.lookup", input: "protocolName", output: "active_signals" }
 *   - { id: "signal.emergency", input: "protocolName", output: "boolean" }
 *   - { id: "signal.summary", input: "void", output: "signal_statistics" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "I don't predict outbreaks. I track them."
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const diseaseSignals = [
  {
    id: 'sig-001',
    disease: 'Cholera',
    country: 'NGA',
    severity: 4,
    active: true,
    cases: 1247,
    deaths: 89,
    lastUpdate: '2026-03-10T14:30:00Z',
    source: 'WHO-AFRO-EBS',
    description: 'Ongoing cholera outbreak in northern states'
  },
  {
    id: 'sig-002',
    disease: 'Mpox',
    country: 'COD',
    severity: 5,
    active: true,
    cases: 3421,
    deaths: 234,
    lastUpdate: '2026-03-11T09:15:00Z',
    source: 'WHO-AFRO-EBS',
    description: 'Clade I mpox outbreak - emergency response active'
  },
  {
    id: 'sig-003',
    disease: 'Measles',
    country: 'SDN',
    severity: 3,
    active: true,
    cases: 892,
    deaths: 12,
    lastUpdate: '2026-03-09T16:45:00Z',
    source: 'WHO-EMRO-EBS',
    description: 'Measles outbreak in displacement camps'
  },
  {
    id: 'sig-004',
    disease: 'Yellow Fever',
    country: 'BRA',
    severity: 2,
    active: true,
    cases: 45,
    deaths: 3,
    lastUpdate: '2026-03-08T11:20:00Z',
    source: 'WHO-PAHO-EBS',
    description: 'Localized yellow fever cases in Amazon region'
  },
  {
    id: 'sig-005',
    disease: 'Ebola',
    country: 'UGA',
    severity: 4,
    active: true,
    cases: 23,
    deaths: 9,
    lastUpdate: '2026-03-12T07:00:00Z',
    source: 'WHO-AFRO-EBS',
    description: 'Sudan ebolavirus - contact tracing ongoing'
  },
  {
    id: 'sig-006',
    disease: 'Malaria',
    country: 'GLOBAL',
    severity: 1,
    active: false,
    cases: null,
    deaths: null,
    lastUpdate: '2026-03-01T00:00:00Z',
    source: 'WHO-GMP',
    description: 'Routine surveillance - no acute outbreaks'
  }
];

/**
 * Get active signals for a specific disease protocol
 */
export function getSignalsForProtocol(protocolName) {
  return diseaseSignals.filter(
    signal => signal.disease === protocolName && signal.active
  );
}

/**
 * Check if any protocol has active high-severity signals
 */
export function hasActiveEmergency(protocolName) {
  const signals = getSignalsForProtocol(protocolName);
  return signals.some(s => s.severity >= 4);
}

/**
 * Get all active protocols (diseases with active signals)
 */
export function getActiveProtocols() {
  return [...new Set(
    diseaseSignals
      .filter(s => s.active)
      .map(s => s.disease)
  )];
}

/**
 * Get signal summary for console display
 */
export function getSignalSummary() {
  const active = diseaseSignals.filter(s => s.active);
  const emergency = active.filter(s => s.severity >= 4);
  
  return {
    total: diseaseSignals.length,
    active: active.length,
    emergency: emergency.length,
    protocols: getActiveProtocols()
  };
}
