/**
 * moscript://codex/v1
 * id:       mo-osl-sessionsvc-001
 * name:     Session Service — Reservation Manager
 * element:  🜄
 * trigger:  SESSION_MANAGE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Stock is a promise. Two countries cannot promise
 *  the same box to two different patients."
 */

const SESSION_TTL = parseInt(process.env.SESSION_TTL_SECONDS || '900', 10);
const MAX_EXTENSIONS = parseInt(process.env.SESSION_MAX_EXTENSIONS || '2', 10);
const EXTENSION_MINUTES = 5;

class SessionService {
  constructor() {
    // Dev: in-memory Map. Production: swap for Redis.
    this.activeSessions = new Map();
    // Cleanup expired sessions every 60 seconds
    this.cleanupInterval = setInterval(() => this.releaseExpired(), 60000);
  }

  createSession({ countryCode, diseaseSignal, protocolItems = [], populationAffected, hoursSinceLastOrder }) {
    this.releaseExpired();

    const timestamp = Date.now();
    const conflicts = this.checkConflicts(protocolItems, countryCode);
    const priority = this.calculatePriority({ diseaseSignal, populationAffected, hoursSinceLastOrder });

    if (conflicts.length > 0) {
      const queuePosition = conflicts.filter(c => c.priority > priority).length + 1;
      return {
        sessionId: `SESS-${countryCode}-${timestamp}`,
        status: 'QUEUED',
        queuePosition,
        estimatedWaitMinutes: queuePosition * 8,
        activeReservations: conflicts.length,
        // NEVER expose other country names — data sovereignty
      };
    }

    const sessionId = `SESS-${countryCode}-${timestamp}`;
    const expiresAt = timestamp + (SESSION_TTL * 1000);

    this.activeSessions.set(sessionId, {
      countryCode,
      protocolItems,
      expiresAt,
      priority,
      status: 'ACTIVE',
      extensions: 0,
    });

    return {
      sessionId,
      status: 'RESERVED',
      expiresAt,
      timeRemaining: SESSION_TTL,
      protocolItems,
      maxExtensions: MAX_EXTENSIONS,
    };
  }

  validateSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return { valid: false, reason: 'NOT_FOUND' };
    if (session.expiresAt < Date.now()) {
      this.activeSessions.delete(sessionId);
      return { valid: false, reason: 'EXPIRED' };
    }
    return {
      valid: true,
      timeRemaining: Math.floor((session.expiresAt - Date.now()) / 1000),
      extensionsRemaining: MAX_EXTENSIONS - session.extensions,
    };
  }

  extendSession(sessionId, minutes = EXTENSION_MINUTES) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return { success: false, reason: 'NOT_FOUND' };
    if (session.extensions >= MAX_EXTENSIONS) {
      return { success: false, reason: 'MAX_EXTENSIONS_REACHED' };
    }
    session.extensions += 1;
    session.expiresAt += minutes * 60 * 1000;
    return {
      success: true,
      newExpiresAt: session.expiresAt,
      extensionsRemaining: MAX_EXTENSIONS - session.extensions,
      timeRemaining: Math.floor((session.expiresAt - Date.now()) / 1000),
    };
  }

  releaseSession(sessionId) {
    return this.activeSessions.delete(sessionId);
  }

  getQueueStatus(protocolItems = []) {
    const now = Date.now();
    const active = Array.from(this.activeSessions.values())
      .filter(s => s.status === 'ACTIVE' && s.expiresAt > now)
      .filter(s => protocolItems.some(item => s.protocolItems.includes(item)));
    return {
      activeReservations: active.length,
      estimatedWaitMinutes: active.length * 8,
    };
  }

  releaseExpired() {
    const now = Date.now();
    let released = 0;
    for (const [id, session] of this.activeSessions) {
      if (session.expiresAt < now) {
        this.activeSessions.delete(id);
        released++;
      }
    }
    if (released > 0) {
      console.log(`[SessionService] Released ${released} expired session(s)`);
    }
  }

  calculatePriority({ diseaseSignal, populationAffected, hoursSinceLastOrder }) {
    const severityWeights = { CRITICAL: 1.0, ELEVATED: 0.6, WATCH: 0.3 };
    const severity = severityWeights[diseaseSignal?.riskLevel] ?? 0.5;
    const population = Math.min((populationAffected ?? 0) / 1000000, 1);
    const recency = Math.min((hoursSinceLastOrder ?? 72) / 168, 1);
    return (severity * 0.4) + (population * 0.3) + (recency * 0.2) + (Math.random() * 0.1);
  }

  checkConflicts(protocolItems, requestingCountry) {
    const conflicts = [];
    const now = Date.now();
    for (const [id, session] of this.activeSessions) {
      if (session.countryCode === requestingCountry) continue;
      if (session.status !== 'ACTIVE') continue;
      if (session.expiresAt < now) continue;
      const overlap = protocolItems.filter(i => session.protocolItems.includes(i));
      if (overlap.length > 0) {
        conflicts.push({ sessionId: id, priority: session.priority });
      }
    }
    return conflicts;
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

module.exports = new SessionService();
