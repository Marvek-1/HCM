import { LayoutGrid, Package, ShoppingCart, Settings, LogOut, ChevronRight, User } from 'lucide-react';
import { getNavItems } from '../constants';
import '../styles/Sidebar.css';

function Sidebar({ currentUser, activeTab, setActiveTab, onLogout, onProfileSettings }) {
  const navItems = getNavItems(currentUser.role);

  const getIcon = (id) => {
    switch (id) {
      case 'dashboard': return <LayoutGrid className="w-5 h-5 nav-icon" />;
      case 'catalog': return <Package className="w-5 h-5 nav-icon" />;
      case 'orders': return <ShoppingCart className="w-5 h-5 nav-icon" />;
      case 'admin': return <Settings className="w-5 h-5 nav-icon" />;
      default: return <ChevronRight className="w-5 h-5 nav-icon" />;
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen z-20 flex-shrink-0 sidebar-container">
      <div className="pt-8 pb-8 flex-1 flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center gap-4 mb-12 px-8">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#009ADE] font-black text-2xl shadow-lg">
            W
          </div>
          <div className="flex flex-col text-white">
            <span className="text-xl font-black tracking-tighter leading-none">HCOMS</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-80">WHO AFRO OSL</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 nav-menu">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span>
                  {getIcon(item.id)}
                </span>
                <span className="text-sm tracking-wide relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="mt-auto pt-8 px-6">
          <button
            onClick={onProfileSettings}
            className="w-full p-4 rounded-3xl flex items-center gap-3 transition-transform duration-300 group profile-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#009ADE]">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start overflow-hidden text-white">
              <span className="text-sm font-bold truncate w-full text-left line-clamp-1">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                {currentUser?.role || 'Role'}
              </span>
            </div>
            <div className="ml-auto text-white/50 group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
