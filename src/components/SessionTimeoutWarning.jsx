import '../styles/SessionTimeoutWarning.css';

function SessionTimeoutWarning({ secondsLeft, onStayLoggedIn, onLogout }) {
  return (
    <div className="timeout-overlay">
      <div className="timeout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="timeout-icon">&#9888;</div>
        <h3 className="timeout-title">Session Expiring</h3>
        <p className="timeout-message">
          Your session will expire due to inactivity.
        </p>
        <div className="timeout-countdown">
          <span className="timeout-seconds">{secondsLeft}</span>
          <span className="timeout-label">seconds remaining</span>
        </div>
        <div className="timeout-actions">
          <button onClick={onStayLoggedIn} className="timeout-btn-stay">
            Stay Logged In
          </button>
          <button onClick={onLogout} className="timeout-btn-logout">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeoutWarning;
