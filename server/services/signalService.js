/**
 * moscript://codex/v1
 * id:       mo-osl-signalsvc-001
 * name:     Signal Service — Disease Intelligence Ingestion
 * element:  🜂
 * trigger:  SIGNAL_FETCH
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "I see the signals before the outbreak sees you."
 */

const SEED_SIGNALS = [
  {
    id: 'SIG-001', disease: 'CHOLERA', country: 'NGA',
    countryName: 'Nigeria', riskLevel: 'CRITICAL',
    source: 'AFRO-STORM', reportedCases: 847, reportedDeaths: 23,
    affectedCountries: ['NGA', 'NER', 'CMR'],
    protocolItems: ['MED-ORS-001', 'WTR-PUR-001', 'MED-ZNC-001', 'MED-IVF-001'],
    detectedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    summary: 'Cholera outbreak escalating in Borno State. Cross-border risk to Niger and Cameroon.',
  },
  {
    id: 'SIG-002', disease: 'MPOX', country: 'COD',
    countryName: 'DR Congo', riskLevel: 'CRITICAL',
    source: 'EIOS', reportedCases: 312, reportedDeaths: 8,
    affectedCountries: ['COD', 'UGA', 'RWA'],
    protocolItems: ['PPE-CVR-001', 'PPE-GLV-001', 'MED-ISO-001'],
    detectedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    summary: 'Mpox clade Ib confirmed in eastern DRC provinces. Cross-border risk active.',
  },
  {
    id: 'SIG-003', disease: 'EBOLA', country: 'GIN',
    countryName: 'Guinea', riskLevel: 'ELEVATED',
    source: 'IDSR', reportedCases: 14, reportedDeaths: 6,
    affectedCountries: ['GIN', 'SLE', 'LBR'],
    protocolItems: ['PPE-CVR-001', 'PPE-GLV-001', 'MED-BSF-001', 'HAZ-KIT-001'],
    detectedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    summary: 'Suspected EVD cluster in Nzérékoré. Contact tracing underway.',
  },
  {
    id: 'SIG-004', disease: 'MEASLES', country: 'ETH',
    countryName: 'Ethiopia', riskLevel: 'ELEVATED',
    source: 'AFRO-STORM', reportedCases: 2103, reportedDeaths: 41,
    affectedCountries: ['ETH', 'SOM', 'SSD'],
    protocolItems: ['VAC-MSL-001', 'MED-SYR-001', 'COL-BOX-001'],
    detectedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    summary: 'Measles surge across Oromia region. Vaccination campaign logistics required.',
  },
  {
    id: 'SIG-005', disease: 'MENINGITIS', country: 'BFA',
    countryName: 'Burkina Faso', riskLevel: 'ELEVATED',
    source: 'IDSR', reportedCases: 156, reportedDeaths: 19,
    affectedCountries: ['BFA', 'MLI', 'GHA'],
    protocolItems: ['VAC-MEN-001', 'MED-ANT-001', 'MED-SYR-001'],
    detectedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    summary: 'Meningitis belt activation. Meningococcal A surge in Burkina Faso.',
  },
];

async function getActiveSignals() {
  const url = process.env.SIGNAL_SOURCE_URL;
  const key = process.env.SIGNAL_API_KEY;

  if (url && key) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${url}/active`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : SEED_SIGNALS;
      }
    } catch (err) {
      console.log('[SignalService] Live API unavailable, using seed data:', err.message);
    }
  }

  return SEED_SIGNALS;
}

async function getSignalsByCountry(iso3) {
  const all = await getActiveSignals();
  const code = iso3.toUpperCase();
  return all.filter(
    s => s.country === code || (s.affectedCountries || []).includes(code)
  );
}

async function getRiskLevel(iso3) {
  const signals = await getSignalsByCountry(iso3);
  if (signals.some(s => s.riskLevel === 'CRITICAL')) return 'CRITICAL';
  if (signals.some(s => s.riskLevel === 'ELEVATED')) return 'ELEVATED';
  return 'BASELINE';
}

module.exports = { getActiveSignals, getSignalsByCountry, getRiskLevel, SEED_SIGNALS };
