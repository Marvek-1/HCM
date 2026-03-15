/**
 * moscript://codex/v1
 * id:       mo-osl-sessionroute-001
 * name:     Session Routes — Reservation Management API
 * element:  🜄
 * trigger:  HTTP_REQUEST
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 */

const express = require('express');
const router = express.Router();
const sessionService = require('../services/sessionService');
const { authenticate } = require('../middleware/auth');

// All session routes require authentication
router.use(authenticate);

// POST /api/sessions/init — Create a new reservation session
router.post('/init', (req, res) => {
  try {
    const { diseaseSignal, protocolItems, populationAffected, hoursSinceLastOrder } = req.body;
    const countryCode = req.user.country || req.body.countryCode;

    if (!countryCode) {
      return res.status(400).json({ success: false, message: 'Country code required' });
    }

    const result = sessionService.createSession({
      countryCode,
      diseaseSignal,
      protocolItems: protocolItems || [],
      populationAffected,
      hoursSinceLastOrder,
    });

    res.json({
      success: true,
      ...result,
      moScriptId: 'mo-osl-sessiongate-001',
    });
  } catch (err) {
    console.error('[Sessions] Init error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
});

// GET /api/sessions/validate/:sessionId — Validate a session is still active
router.get('/validate/:sessionId', (req, res) => {
  const result = sessionService.validateSession(req.params.sessionId);
  res.json({ success: true, ...result });
});

// POST /api/sessions/extend/:sessionId — Extend a session
router.post('/extend/:sessionId', (req, res) => {
  const minutes = req.body.minutes || 5;
  const result = sessionService.extendSession(req.params.sessionId, minutes);
  res.json({ success: true, ...result });
});

// DELETE /api/sessions/release/:sessionId — Release a session
router.delete('/release/:sessionId', (req, res) => {
  sessionService.releaseSession(req.params.sessionId);
  res.json({ success: true, released: true });
});

// GET /api/sessions/queue/:protocol — Queue status for a protocol
router.get('/queue/:protocol', (req, res) => {
  const result = sessionService.getQueueStatus([req.params.protocol]);
  res.json({ success: true, ...result });
});

module.exports = router;
