/**
 * moscript://codex/v1
 * id:       mo-osl-notifysvc-001
 * name:     Notification Service — Tiered Alert Engine
 * element:  🜁
 * trigger:  NOTIFY
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Not every status change deserves an email.
 *  Ebola does. An order moving from stage 2 to 3 does not."
 */

const NOTIFICATION_RULES = {
  SIGNAL_CRITICAL: {
    notify: ['country_office_affected', 'osl_team', 'super_admin'],
    channel: ['in_app', 'email'],
    frequency: 'IMMEDIATE',
  },
  SIGNAL_ELEVATED: {
    notify: ['country_office_affected', 'osl_team'],
    channel: ['in_app'],
    frequency: 'IMMEDIATE',
  },
  ORDER_SUBMITTED: {
    notify: ['osl_team'],
    channel: ['in_app'],
    frequency: 'BATCHED_30MIN',
  },
  ORDER_STATUS_CHANGE: {
    notify: ['order_requestor'],
    channel: ['in_app'],
    frequency: 'BATCHED_30MIN',
  },
  FAST_TRACK_ASSIGNED: {
    notify: ['osl_team', 'order_requestor'],
    channel: ['in_app', 'email'],
    frequency: 'IMMEDIATE',
  },
  FAST_TRACK_UNACTIONED: {
    notify: ['osl_team', 'super_admin'],
    channel: ['in_app', 'email'],
    frequency: 'IMMEDIATE',
    triggerAfterHours: 2,
  },
  RESERVATION_EXPIRING: {
    notify: ['session_owner'],
    channel: ['in_app'],
    frequency: 'IMMEDIATE',
    triggerAtSeconds: 180, // 3 min before expiry
  },
  EMERGENCY_OVERRIDE: {
    notify: ['all_affected', 'super_admin'],
    channel: ['in_app', 'email'],
    frequency: 'IMMEDIATE',
  },
  COLD_CHAIN_BREACH: {
    notify: ['osl_team', 'hub_coordinator'],
    channel: ['in_app', 'email'],
    frequency: 'IMMEDIATE',
  },
  HUB_FAILOVER: {
    notify: ['osl_team', 'super_admin', 'hub_coordinator'],
    channel: ['in_app', 'email'],
    frequency: 'IMMEDIATE',
  },
};

// In-memory notification queue (would be Redis/DB in production)
const notificationQueue = [];

function queueNotification({ type, data, recipients = [], moScriptId }) {
  const rule = NOTIFICATION_RULES[type];
  if (!rule) {
    console.warn(`[NotificationService] Unknown notification type: ${type}`);
    return;
  }

  const notification = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    channels: rule.channel,
    frequency: rule.frequency,
    recipients: recipients.length > 0 ? recipients : rule.notify,
    data,
    moScriptId,
    createdAt: new Date().toISOString(),
    delivered: false,
  };

  if (rule.frequency === 'IMMEDIATE') {
    deliverNotification(notification);
  } else {
    notificationQueue.push(notification);
  }

  return notification;
}

function deliverNotification(notification) {
  // For now: log to console. In production: send via channels.
  notification.delivered = true;
  notification.deliveredAt = new Date().toISOString();

  for (const channel of notification.channels) {
    switch (channel) {
      case 'in_app':
        console.log(`[Notification:IN_APP] ${notification.type}: ${JSON.stringify(notification.data)}`);
        break;
      case 'email':
        console.log(`[Notification:EMAIL] ${notification.type} → ${notification.recipients.join(', ')}`);
        // In production: integrate with emailService
        break;
      default:
        break;
    }
  }

  return notification;
}

function processBatchedNotifications() {
  const pending = notificationQueue.filter(n => !n.delivered);
  if (pending.length === 0) return;

  // Group by type + recipient for batching
  const grouped = {};
  for (const notification of pending) {
    const key = `${notification.type}-${notification.recipients.join(',')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(notification);
  }

  for (const [key, notifications] of Object.entries(grouped)) {
    // Deliver as a batch
    const batch = {
      type: notifications[0].type,
      channels: notifications[0].channels,
      recipients: notifications[0].recipients,
      count: notifications.length,
      items: notifications.map(n => n.data),
      deliveredAt: new Date().toISOString(),
    };

    console.log(`[Notification:BATCH] ${batch.type} × ${batch.count} → ${batch.recipients.join(', ')}`);

    for (const n of notifications) {
      n.delivered = true;
      n.deliveredAt = batch.deliveredAt;
    }
  }
}

// Process batched notifications every 30 minutes
setInterval(processBatchedNotifications, 30 * 60 * 1000);

function getNotificationRules() {
  return NOTIFICATION_RULES;
}

module.exports = { queueNotification, processBatchedNotifications, getNotificationRules };
