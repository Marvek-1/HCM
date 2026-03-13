import { useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import '../../styles/modals/ForgotPasswordModal.css';

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);

      if (response.success) {
        setEmailSent(true);
        toast.success('Password reset link sent! Check your email.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content forgot-password-modal">
        <div className="modal-header">
          <h2 className="modal-title">Reset Password</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <p className="forgot-password-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="form-input"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading || !email}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="forgot-password-success">
            <div className="success-icon">✓</div>
            <h3 className="success-title">Check Your Email</h3>
            <p className="success-message">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="success-note">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
