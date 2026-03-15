/**
 * moscript://codex/v1
 * id:       mo-osl-sessiongate-001
 * name:     Session Gate — Concurrent Access Controller
 * element:  🜄
 * trigger:  SESSION_INIT
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Two countries cannot promise the same life-saving stock.
 *  The first to commit gets the reservation;
 *  the second gets transparency."
 */

const moOslSessiongate001 = {
  id: 'mo-osl-sessiongate-001',
  name: 'Session Gate',
  trigger: 'SESSION_INIT',
  element: 'water',

  SESSION_TTL: 900,         // 15 minutes in seconds
  MAX_EXTENSIONS: 2,
  EXTENSION_MINUTES: 5,

  activeSessions: new Map(),

  logic(inputs) {
    const { countryCode, diseaseSignal, protocolItems = [], timestamp = Date.now() } = inputs;

    // Purge expired sessions first
    this.releaseExpired();

    const conflicts = this.checkConflicts(protocolItems, countryCode);

    if (conflicts.length > 0) {
      const priority = this.calculatePriority(inputs);
      const queuePosition = this.getQueuePosition(conflicts, priority);
      return {
        sessionId: `SESS-${countryCode}-${Date.now()}`,
        status: 'QUEUED',
        queuePosition,
        estimatedWaitMinutes: queuePosition * 8,
        activeReservations: conflicts.length,
        // NEVER expose other country names — data sovereignty
        voiceLine: `Session queued. Position ${queuePosition}. Estimated wait: ${queuePosition * 8} minutes.`,
        timestamp: new Date().toISOString(),
      };
    }

    const sessionId = `SESS-${countryCode}-${Date.now()}`;
    const expiresAt = timestamp + (this.SESSION_TTL * 1000);

    this.activeSessions.set(sessionId, {
      countryCode,
      protocolItems,
      expiresAt,
      priority: this.calculatePriority(inputs),
      status: 'ACTIVE',
      extensions: 0,
    });

    return {
      sessionId,
      status: 'RESERVED',
      expiresAt,
      timeRemaining: this.SESSION_TTL,
      protocolItems,
      maxExtensions: this.MAX_EXTENSIONS,
      extensionMinutes: this.EXTENSION_MINUTES,
      voiceLine: `Session active. ${protocolItems.length} protocol items reserved for 15 minutes.`,
      timestamp: new Date().toISOString(),
    };
  },

  calculatePriority(inputs) {
    const severityWeights = { CRITICAL: 1.0, ELEVATED: 0.6, WATCH: 0.3 };
    const severity = severityWeights[inputs.diseaseSignal?.riskLevel] ?? 0.5;
    const population = Math.min((inputs.populationAffected ?? 0) / 1000000, 1);
    const recency = Math.min((inputs.hoursSinceLastOrder ?? 72) / 168, 1);
    return (severity * 0.4) + (population * 0.3) + (recency * 0.2) + (Math.random() * 0.1);
  },

  checkConflicts(protocolItems, requestingCountry) {
    const conflicts = [];
    const now = Date.now();
    for (const [id, session] of this.activeSessions) {
      if (session.countryCode === requestingCountry) continue;
      if (session.status !== 'ACTIVE') continue;
      if (session.expiresAt < now) continue;
      const overlap = protocolItems.filter(i => session.protocolItems.includes(i));
      if (overlap.length > 0) {
        conflicts.push({ sessionId: id, expiresAt: session.expiresAt, priority: session.priority });
      }
    }
    return conflicts;
  },

  getQueuePosition(conflicts, myPriority) {
    return conflicts.filter(c => c.priority > myPriority).length + 1;
  },

  extendSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return { success: false, reason: 'NOT_FOUND' };
    if (session.extensions >= this.MAX_EXTENSIONS) {
      return { success: false, reason: 'MAX_EXTENSIONS_REACHED' };
    }
    session.extensions += 1;
    session.expiresAt += this.EXTENSION_MINUTES * 60 * 1000;
    return {
      success: true,
      newExpiresAt: session.expiresAt,
      extensionsRemaining: this.MAX_EXTENSIONS - session.extensions,
    };
  },

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
      extensionsRemaining: this.MAX_EXTENSIONS - session.extensions,
    };
  },

  releaseSession(sessionId) {
    return this.activeSessions.delete(sessionId);
  },

  releaseExpired() {
    const now = Date.now();
    for (const [id, session] of this.activeSessions) {
      if (session.expiresAt < now) {
        this.activeSessions.delete(id);
      }
    }
  },

  getQueueStatus(protocolItems) {
    const active = Array.from(this.activeSessions.values())
      .filter(s => s.status === 'ACTIVE' && s.expiresAt > Date.now())
      .filter(s => protocolItems.some(item => s.protocolItems.includes(item)));
    return {
      activeReservations: active.length,
      estimatedWaitMinutes: active.length * 8,
    };
  },

  voiceLine: (result) => result.voiceLine,
  sass: "Stock is a promise. Two countries cannot promise the same box to two different patients.",
};

export default moOslSessiongate001;
