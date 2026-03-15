/**
 * moscript://codex/v1
 * id:       mo-osl-signalroute-001
 * name:     Signal Routes — Disease Intelligence API
 * element:  🜂
 * trigger:  HTTP_GET
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 */

const express = require('express');
const router = express.Router();
const signalService = require('../services/signalService');

// GET /api/signals — All active disease signals
router.get('/', async (req, res) => {
  try {
    const signals = await signalService.getActiveSignals();
    res.json({
      success: true,
      data: signals,
      count: signals.length,
      moScriptId: 'mo-osl-signalbridge-002',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Signals] Error fetching signals:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch signals' });
  }
});

// GET /api/signals/risk/:country — Risk level for a country
router.get('/risk/:country', async (req, res) => {
  try {
    const riskLevel = await signalService.getRiskLevel(req.params.country);
    res.json({
      success: true,
      data: {
        country: req.params.country.toUpperCase(),
        riskLevel,
      },
      moScriptId: 'mo-osl-signalbridge-002',
    });
  } catch (err) {
    console.error('[Signals] Error fetching risk level:', err.message);
    res.status(500).json({ success: false, message: 'Failed to determine risk level' });
  }
});

// GET /api/signals/:country — Signals for a specific country
router.get('/:country', async (req, res) => {
  try {
    const signals = await signalService.getSignalsByCountry(req.params.country);
    res.json({
      success: true,
      data: signals,
      count: signals.length,
      country: req.params.country.toUpperCase(),
      moScriptId: 'mo-osl-signalbridge-002',
    });
  } catch (err) {
    console.error('[Signals] Error fetching country signals:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch country signals' });
  }
});

module.exports = router;
