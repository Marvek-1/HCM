import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import '../styles/NotificationBell.css';

function NotificationBell({ onOrderClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notification count periodically
  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await chatAPI.getNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getNotifications(20, false);
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await chatAPI.markNotificationRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    // Navigate to order if it's an order notification
    if (notification.referenceType === 'order' && onOrderClick) {
      onOrderClick(notification.referenceId);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await chatAPI.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_message': return '💬';
      case 'order_update': return '📋';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={handleBellClick}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {isLoading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">🔔</span>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    {notification.message && (
                      <div className="notification-message">
                        {notification.message.substring(0, 80)}
                        {notification.message.length > 80 ? '...' : ''}
                      </div>
                    )}
                    <div className="notification-time">
                      {formatDateTime(notification.createdAt, { short: true })}
                    </div>
                  </div>
                  {!notification.isRead && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
