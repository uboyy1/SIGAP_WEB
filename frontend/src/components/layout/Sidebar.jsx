// Fungsi: Komponen layout untuk navigasi dan kerangka halaman aplikasi.
// frontend/src/components/layout/Sidebar.jsx
import logoSigap from '../../assets/logo_sigap.png';
import { getNavItemsByRole, iconComponents } from './NavItems';

export default function Sidebar({ 
  activePath,
  onNavigate, 
  onLogout,
  dark, 
  toggleDark, 
  isOpen, 
  onClose, 
  collapsed, 
  onToggleCollapse,
  userRole 
}) {
  const navItems = getNavItemsByRole(userRole);
  const NavIcon = ({ name }) => {
    const Icon = iconComponents[name];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const renderNavItem = (item, isCollapsed = false) => (
    <button
      key={item.id}
      onClick={() => { onNavigate(item.path); onClose?.(); }}
      title={isCollapsed ? item.label : ""}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
        ${isCollapsed ? 'justify-center' : ''}
        ${activePath === item.path
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
          : 'text-white/65 hover:bg-white/10 hover:text-white hover:shadow-md'
        }`}
    >
      <span className="shrink-0"><NavIcon name={item.icon} /></span>
      <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
        {item.label}
      </span>
    </button>
  );

  const renderDarkModeButton = (isCollapsed = false) => (
    <button
      onClick={toggleDark}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
        ${dark ? 'bg-primary-600/20 text-primary-300' : 'bg-white/10 text-white/70 hover:bg-white/20'}
        ${isCollapsed ? 'justify-center' : ''}`}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="shrink-0">
        <NavIcon name={dark ? "sun" : "moon"} />
      </span>
      <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 text-xs ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
        {dark ? 'Light Mode' : 'Dark Mode'}
      </span>
      <span className={`ml-auto shrink-0 relative w-9 h-5 rounded-full transition-colors duration-300
        ${dark ? 'bg-primary-500' : 'bg-white/30'}
        ${isCollapsed ? 'hidden' : ''}`}>
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300
            ${dark ? 'left-4' : 'left-0.5'}`}
        />
      </span>
    </button>
  );

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar with Collapse */}
      <div className="hidden lg:flex h-full relative">
        <aside
          className={`h-full bg-sidebar dark:bg-gray-900 text-white flex flex-col z-50 transition-all duration-300 ease-in-out
            ${collapsed ? 'w-20' : 'w-60'}`}
        >
          {/* Logo */}
          <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 transition-all duration-300 ${collapsed ? 'justify-center px-2' : ''}`}>
            <img loading="lazy" decoding="async" src={logoSigap} alt="SIGAP" className="w-10 h-10 object-contain shrink-0" />
            <div className={`flex flex-col leading-tight overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <span className="text-base font-extrabold tracking-wide text-white">SIGAP</span>
              <span className="text-[11px] text-white/50 font-medium -mt-0.5">
                {userRole === 'admin' ? 'Admin Panel' : 'Kepala Teknisi'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => renderNavItem(item, collapsed))}
            <div className="border-t border-white/10 my-2" />
            <button
              onClick={onLogout}
              title={collapsed ? 'Keluar' : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200
                ${collapsed ? 'justify-center' : ''}`}
            >
              <span className="shrink-0"><NavIcon name="logout" /></span>
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                Keluar
              </span>
            </button>
          </nav>

          {/* Dark Mode Toggle */}
          <div className="border-t border-white/10 px-3 py-4">
            {renderDarkModeButton(collapsed)}
          </div>
        </aside>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="group flex items-center justify-center w-5 h-10 absolute top-1/2 -translate-y-1/2 right-0 translate-x-full bg-sidebar dark:bg-gray-900 text-white/60 hover:text-white border border-l-0 border-white/10 dark:border-gray-700 rounded-r-lg transition-all duration-300 z-10"
          title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            {collapsed ? <NavIcon name="collapseRight" /> : <NavIcon name="collapseLeft" />}
          </span>
        </button>
      </div>

      {/* Mobile Sidebar (tanpa collapse) */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full bg-sidebar dark:bg-gray-900 text-white flex flex-col z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-60`}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <img loading="lazy" decoding="async" src={logoSigap} alt="SIGAP" className="w-10 h-10 object-contain shrink-0" />
          <div>
            <span className="text-base font-extrabold tracking-wide text-white">SIGAP</span>
            <span className="text-[11px] text-white/50 font-medium block -mt-0.5">
              {userRole === 'admin' ? 'Admin Panel' : 'Kepala Teknisi'}
            </span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item, false))}
          <div className="border-t border-white/10 my-2" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <span className="shrink-0"><NavIcon name="logout" /></span>
            <span>Keluar</span>
          </button>
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          {renderDarkModeButton(false)}
        </div>
      </aside>
    </>
  );
}