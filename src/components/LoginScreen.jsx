import { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import '../styles/LoginScreen.css';

const DEV_MODE = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';
const UNLOCK_ROLES = import.meta.env.VITE_DEV_UNLOCK_ROLES === 'true';
const TEST_ACCOUNTS = [
  { email: 'super.admin@who.int', role: 'Super Admin', description: 'Full system access' },
  { email: 'admin.nigeria@who.int', role: 'Country Office', description: 'Create & manage orders' },
  { email: 'lab.reviewer@who.int', role: 'Laboratory Team', description: 'Review commodities' },
  { email: 'osl.admin@who.int', role: 'OSL Team', description: 'Approve & allocate' },
];
const TEST_PASSWORD = 'Password123!';

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        onLogin(response.data.user);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">WHO</div>
          <h1 className="login-title">HCOMS Portal</h1>
          <p className="login-subtitle">Health Commodity Order Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="login-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="login-form-group">
            <div className="login-label-row">
              <label className="login-label">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="forgot-password-link"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="login-input"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? '\u{1F441}' : '\u{1F441}\u200D\u{1F5E8}'}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="login-button"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Info */}
        {/*<div className="login-info">
          <div className="login-info-title">System Access:</div>
          <ul className="login-info-list">
            <li><strong>Country Office</strong> – Create orders with PATEO</li>
            <li><strong>Laboratory Team</strong> – Review & forward to OSL</li>
            <li><strong>OSL Team</strong> – Approve based on availability</li>
          </ul>
        </div>*/}

        {/* Dev Quick Login */}
        {DEV_MODE && UNLOCK_ROLES ? (
          <div className="dev-mode-panel">
            <div className="dev-mode-header">
              <span className="dev-mode-badge">🧪 Development Mode</span>
              <p className="dev-mode-subtitle">Pre-filled test credentials for testing</p>
            </div>
            <div className="dev-mode-content">
              <div className="dev-mode-current">
                <p className="dev-mode-label">Currently Selected:</p>
                <p className="dev-mode-email">{email}</p>
                <p className="dev-mode-password">Password: <code>{TEST_PASSWORD}</code></p>
              </div>
              <div className="dev-mode-divider"></div>
              <div className="dev-mode-accounts">
                <p className="dev-mode-label">Quick Select Test Accounts:</p>
                <div className="dev-mode-buttons">
                  {TEST_ACCOUNTS.map(acc => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => { setEmail(acc.email); setPassword(TEST_PASSWORD); }}
                      className={`dev-mode-button ${email === acc.email ? 'active' : ''}`}
                      title={acc.description}
                    >
                      <span className="dev-mode-role">{acc.role}</span>
                      <span className="dev-mode-desc">{acc.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="dev-mode-footer">
              <p className="dev-mode-warning">⚠️ This mode will be removed when proper role management is implemented</p>
            </div>
          </div>
        ) : null}
        {/* Demo Accounts Note */}
        <div className="login-demo-note">
          <p>Contact your administrator for account access.</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}

export default LoginScreen;
