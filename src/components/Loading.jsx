import '../styles/Loading.css';

function Loading({ message = 'Loading...', fullPage = false, size = 'medium' }) {
  return (
    <div className={`loading-container ${fullPage ? 'loading-fullpage' : ''}`}>
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default Loading;
