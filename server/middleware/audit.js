/**
 * moscript://codex/v1
 * id:       mo-osl-auditmw-001
 * name:     Audit Middleware — Immutable Action Logger
 * element:  🜃
 * trigger:  HTTP_MUTATION
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 */

const auditService = require('../services/auditService');

function auditMiddleware(entityType) {
  return (req, res, next) => {
    // Only audit mutations (POST, PUT, PATCH, DELETE)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Log successful mutations
      if (res.statusCode < 400 && req.user) {
        auditService.logAction({
          userId: req.user.id,
          userRole: req.user.role,
          country: req.user.country || req.user.countryCode,
          action: `${req.method} ${req.originalUrl}`,
          entityType: entityType || req.params.entityType || 'unknown',
          entityId: req.params.id || req.params.orderId || req.params.sessionId || null,
          previousState: null,
          newState: data,
          ipAddress: req.ip,
          moScriptId: req.body?.moScriptId || null,
          justification: req.body?.justification || req.body?.reason || null,
        }).catch(() => {}); // Never block response on audit
      }
      return originalJson(data);
    };

    next();
  };
}

module.exports = auditMiddleware;
