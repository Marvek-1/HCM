/**
 * moscript://codex/v1
 * id:       mo-osl-assetroute-001
 * name:     Asset Routes — Capital Equipment API
 * element:  🜃
 * trigger:  HTTP_REQUEST
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const CAPITAL_THRESHOLD = parseInt(process.env.ASSET_CAPITAL_THRESHOLD || '10000', 10);

const HIGH_VALUE_CATEGORIES = [
  'Emergency Vehicles',
  'Cold Chain Equipment',
  'Logistics Equipment',
  'Communication',
  'Diagnostic Equipment',
];

// POST /api/assets/validate — Validate a capital asset request
router.post('/validate', authenticate, (req, res) => {
  try {
    const { items = [], estimatedValue = 0, countryDirectorApproval } = req.body;
    const requestorRole = req.user.role;
    const isCapital = estimatedValue > CAPITAL_THRESHOLD;
    const hasDirectorApproval = countryDirectorApproval === true;

    if (isCapital && !hasDirectorApproval) {
      return res.json({
        success: true,
        data: {
          approved: false,
          reason: 'DIRECTOR_APPROVAL_REQUIRED',
          message: `Asset value exceeds $${CAPITAL_THRESHOLD.toLocaleString()} USD. Country Director sign-off required.`,
          approvalLevel: 'CAPITAL',
          requiredSignatories: ['Country Director', 'OSL Regional Coordinator'],
        },
        moScriptId: 'mo-osl-assetgate-006',
      });
    }

    res.json({
      success: true,
      data: {
        approved: true,
        reason: 'ASSET_CLEARED',
        approvalLevel: isCapital ? 'CAPITAL' : 'OPERATIONAL',
        requiredSignatories: isCapital
          ? ['Country Director', 'OSL Regional Coordinator']
          : ['OSL Team Lead'],
      },
      moScriptId: 'mo-osl-assetgate-006',
    });
  } catch (err) {
    console.error('[Assets] Validation error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to validate asset' });
  }
});

// GET /api/assets/catalogue — High-value items filtered from commodity catalogue
router.get('/catalogue', authenticate, async (req, res) => {
  try {
    const { query: dbQuery } = require('../config/database');
    const result = await dbQuery(
      `SELECT id, name, who_code, category, unit_of_measure, description
       FROM commodities
       WHERE category = ANY($1)
       ORDER BY category, name`,
      [HIGH_VALUE_CATEGORIES]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      categories: HIGH_VALUE_CATEGORIES,
      capitalThreshold: CAPITAL_THRESHOLD,
    });
  } catch (err) {
    console.error('[Assets] Catalogue error:', err.message);
    // Fallback with empty list — don't crash
    res.json({
      success: true,
      data: [],
      count: 0,
      categories: HIGH_VALUE_CATEGORIES,
      capitalThreshold: CAPITAL_THRESHOLD,
    });
  }
});

module.exports = router;
