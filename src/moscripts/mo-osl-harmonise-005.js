/**
 * ═══════════════════════════════════════════════════════════════════════════
 * mo-osl-harmonise-005 — Stock Harmonisation
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Stock Harmoniser", layer: "osl", version: "2026.03.12" }
 *
 * @capabilities
 *   - multi_warehouse_aggregation
 *   - stock_level_classification
 *   - reorder_threshold_detection
 *
 * @intents
 *   - { id: "stock.harmonise", input: "commodity", output: "stock_summary" }
 *   - { id: "stock.classify", input: "totalStock", output: "stock_status" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "Two warehouses. One truth. Zero confusion."
 * ═══════════════════════════════════════════════════════════════════════════
 */

const moOslHarmonise005 = {
  id: "mo-osl-harmonise-005",
  name: "Stock Harmoniser",
  trigger: "STOCK_HARMONISE",
  inputs: ["commodity", "threshold"],

  logic: ({ commodity, threshold = { critical: 100, low: 1000 } }) => {
    const nboStock = commodity.nboStock || 0;
    const dkrStock = commodity.dkrStock || 0;
    const totalStock = nboStock + dkrStock;

    // Classify stock level
    let status = 'ADEQUATE';
    let color = '#4ade80'; // green
    if (totalStock <= threshold.critical) {
      status = 'CRITICAL';
      color = '#ef4444'; // red
    } else if (totalStock <= threshold.low) {
      status = 'LOW';
      color = '#fbbf24'; // yellow
    }

    // Calculate distribution percentage
    const nboPercent = totalStock > 0 ? ((nboStock / totalStock) * 100).toFixed(1) : 0;
    const dkrPercent = totalStock > 0 ? ((dkrStock / totalStock) * 100).toFixed(1) : 0;

    // Detect imbalance
    const imbalanced = Math.abs(nboStock - dkrStock) > (totalStock * 0.7);

    return {
      commodity: commodity.name,
      whoCode: commodity.whoCode,
      nboStock,
      dkrStock,
      totalStock,
      status,
      color,
      distribution: {
        nbo: { stock: nboStock, percent: nboPercent },
        dkr: { stock: dkrStock, percent: dkrPercent },
      },
      imbalanced,
      reorderNeeded: status === 'CRITICAL' || status === 'LOW',
      timestamp: new Date().toISOString(),
    };
  },

  voiceLine: (r) => {
    if (r.status === 'CRITICAL') {
      return `🔴 CRITICAL: ${r.commodity} at ${r.totalStock} units. Reorder immediately.`;
    }
    if (r.status === 'LOW') {
      return `⚠️ LOW STOCK: ${r.commodity} at ${r.totalStock} units. Plan reorder.`;
    }
    if (r.imbalanced) {
      return `⚖️ Stock imbalance detected: NBO ${r.distribution.nbo.percent}% / DKR ${r.distribution.dkr.percent}%`;
    }
    return `✓ ${r.commodity}: ${r.totalStock} units across both warehouses. Status adequate.`;
  },

  sass: "Two warehouses. One truth. Zero confusion.",
};

export default moOslHarmonise005;
