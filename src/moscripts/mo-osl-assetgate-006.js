/**
 * moscript://codex/v1
 * id:       mo-osl-assetgate-006
 * name:     Asset Gate — Capital Equipment Validator
 * element:  🜃
 * trigger:  ASSET_VALIDATE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Vehicles are not stationery.
 *  Someone with authority signs for them."
 */

const CAPITAL_THRESHOLD = 10000; // USD

const moOslAssetgate006 = {
  id: 'mo-osl-assetgate-006',
  name: 'Asset Gate',
  trigger: 'ASSET_VALIDATE',
  element: 'earth',
  inputs: ['items', 'estimatedValue', 'requestorRole', 'countryDirectorApproval'],

  logic: ({ items = [], estimatedValue = 0, requestorRole, countryDirectorApproval }) => {
    const isCapital = estimatedValue > CAPITAL_THRESHOLD;
    const hasDirectorApproval = countryDirectorApproval === true;

    // Classify asset categories
    const assetCategories = items.map(item => {
      const category = (item.category || '').toLowerCase();
      if (category.includes('vehicle') || category.includes('ambulance')) return 'VEHICLE';
      if (category.includes('cold chain') || category.includes('refriger')) return 'COLD_CHAIN';
      if (category.includes('generator') || category.includes('power')) return 'POWER';
      if (category.includes('communication') || category.includes('radio')) return 'COMMS';
      return 'EQUIPMENT';
    });

    const uniqueCategories = [...new Set(assetCategories)];

    if (isCapital && !hasDirectorApproval) {
      return {
        approved: false,
        reason: 'DIRECTOR_APPROVAL_REQUIRED',
        message: `Asset value exceeds $${CAPITAL_THRESHOLD.toLocaleString()} USD. Country Director sign-off required before submission.`,
        approvalLevel: 'CAPITAL',
        estimatedValue,
        threshold: CAPITAL_THRESHOLD,
        requiredSignatories: ['Country Director', 'OSL Regional Coordinator'],
        assetCategories: uniqueCategories,
        itemCount: items.length,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      approved: true,
      reason: 'ASSET_CLEARED',
      message: isCapital
        ? 'Capital asset request cleared — all required approvals present.'
        : 'Operational asset request cleared for submission.',
      approvalLevel: isCapital ? 'CAPITAL' : 'OPERATIONAL',
      estimatedValue,
      threshold: CAPITAL_THRESHOLD,
      requiredSignatories: isCapital
        ? ['Country Director', 'OSL Regional Coordinator']
        : ['OSL Team Lead'],
      assetCategories: uniqueCategories,
      itemCount: items.length,
      timestamp: new Date().toISOString(),
    };
  },

  voiceLine: (r) => r.approved
    ? `✓ Asset gate cleared. Approval level: ${r.approvalLevel}. ${r.itemCount} item(s).`
    : `🔒 Asset gate held. ${r.message}`,

  sass: "Vehicles are not stationery. Someone with authority signs for them.",
};

export default moOslAssetgate006;
