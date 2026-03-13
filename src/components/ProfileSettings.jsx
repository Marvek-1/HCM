import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import '../styles/ProfileSettings.css';

function ProfileSettings({ currentUser, onProfileUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    role: currentUser?.role || '',
    country: currentUser?.country || ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loginHistory, setLoginHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await adminAPI.getProfile();
        if (response.success) {
          setProfile({
            name: response.data.user.name,
            username: response.data.user.username || '',
            email: response.data.user.email,
            role: response.data.user.role,
            country: response.data.user.country || ''
          });
          setLoginHistory(response.data.loginHistory || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!profile.name || profile.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    // Validate username if provided
    if (profile.username && !/^[a-zA-Z0-9_]{3,20}$/.test(profile.username)) {
      toast.error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminAPI.updateProfile({ 
        name: profile.name.trim(),
        username: profile.username ? profile.username.trim() : null
      });
      if (response.success) {
        toast.success('Profile updated successfully');
        if (onProfileUpdate) {
          onProfileUpdate({ 
            ...currentUser, 
            name: profile.name.trim(),
            username: profile.username ? profile.username.trim() : null
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwords.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwords.newPassword || passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminAPI.changePassword(passwords.currentPassword, passwords.newPassword);
      if (response.success) {
        toast.success('Password changed successfully');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg profile-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Profile Settings</h2>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <div className="profile-content">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
            <button
              className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              📋 Login History
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="form-input"
                  placeholder="Choose a username (optional)"
                  disabled={isLoading}
                />
                <small className="form-hint">3-20 characters, letters, numbers, and underscores only</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  className="form-input disabled"
                  disabled
                />
                <small className="form-hint">Email address cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    className="form-input disabled"
                    disabled
                  />
                </div>
                {profile.country && (
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      value={profile.country}
                      className="form-input disabled"
                      disabled
                    />
                    <small className="form-hint">Country cannot be changed</small>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  onClick={handleUpdateProfile}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <h3 className="section-title">Change Password</h3>
              
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="form-input"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="password-toggle-btn"
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPasswords.current ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="form-input"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="password-toggle-btn"
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPasswords.new ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
                  </button>
                </div>
                <small className="form-hint">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="form-input"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="password-toggle-btn"
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPasswords.confirm ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleChangePassword}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>

              <div className="security-info">
                <h4>Password Requirements</h4>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>Contains at least one uppercase letter</li>
                  <li>Contains at least one lowercase letter</li>
                  <li>Contains at least one number</li>
                </ul>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="profile-section">
              <h3 className="section-title">Recent Login Activity</h3>
              
              {loginHistory.length === 0 ? (
                <p className="no-data">No login history available</p>
              ) : (
                <div className="login-history">
                  {loginHistory.map((log, index) => (
                    <div key={index} className={`login-entry ${log.status}`}>
                      <div className="login-entry-main">
                        <span className={`login-status ${log.status}`}>
                          {log.status === 'success' ? '✓' : '✗'}
                        </span>
                        <div className="login-details">
                          <span className="login-time">{formatDateTime(log.login_time || log.created_at)}</span>
                          {log.failure_reason && (
                            <span className="login-reason">{log.failure_reason}</span>
                          )}
                        </div>
                      </div>
                      <div className="login-meta">
                        <span className="login-ip">{log.ip_address || 'Unknown IP'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
