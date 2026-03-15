import { getNavItems } from '../constants';
import NotificationBell from './NotificationBell';
import '../styles/Header.css';

function Header({ currentUser, activeTab, setActiveTab, onLogout, onProfileSettings, onOrderClick }) {
  const navItems = getNavItems(currentUser.role);

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header-container">
        {/* Logo & Title */}
        <div className="header-brand">
          <div className="header-logo">
            <img src="/images/en.png" alt="WHO Logo" />
          </div>
          <div>
            <h1 className="header-title">Health Commodity Order Management</h1>
            <p className="header-subtitle">HCOMS Portal</p>
          </div>
        </div>

        {/* User Info */}
        <div className="header-user">
          <div className="header-user-info">
            <div className="header-user-name">
              {currentUser.name}
              {currentUser.country && <span className="header-user-country">, {currentUser.country}</span>}
            </div>
            <div className="header-user-role">{currentUser.role}</div>
          </div>
          <NotificationBell onOrderClick={onOrderClick} />
          <button onClick={onProfileSettings} className="header-profile-btn" title="Profile Settings">
            ⚙️
          </button>
          <button onClick={onLogout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <div className="header-nav-container">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`header-nav-btn ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;

