import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Invalid password reset link.');
      navigate('/');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate]);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
      isValid: minLength && hasLower && hasUpper && hasNumber,
      minLength,
      hasLower,
      hasUpper,
      hasNumber
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      toast.error('Password does not meet the requirements.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword(token, newPassword);

      if (response.success) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        {/* Logo */}
        <div className="reset-password-header">
          <div className="reset-password-logo">WHO</div>
          <h1 className="reset-password-title">Reset Password</h1>
          <p className="reset-password-subtitle">Create a new password for your account</p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit}>
          <div className="reset-password-form-group">
            <label className="reset-password-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="reset-password-input"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="password-toggle-btn"
                disabled={isLoading}
              >
                {passwordVisible ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="password-requirements">
                <div className={`requirement ${passwordValidation.minLength ? 'met' : ''}`}>
                  {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
                </div>
                <div className={`requirement ${passwordValidation.hasLower ? 'met' : ''}`}>
                  {passwordValidation.hasLower ? '✓' : '○'} One lowercase letter
                </div>
                <div className={`requirement ${passwordValidation.hasUpper ? 'met' : ''}`}>
                  {passwordValidation.hasUpper ? '✓' : '○'} One uppercase letter
                </div>
                <div className={`requirement ${passwordValidation.hasNumber ? 'met' : ''}`}>
                  {passwordValidation.hasNumber ? '✓' : '○'} One number
                </div>
              </div>
            )}
          </div>

          <div className="reset-password-form-group">
            <label className="reset-password-label">Confirm Password</label>
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="reset-password-input"
              required
              disabled={isLoading}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <span className="password-mismatch">Passwords do not match</span>
            )}
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
            className="reset-password-button"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="back-to-login">
          <button onClick={() => navigate('/')} className="back-link">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
