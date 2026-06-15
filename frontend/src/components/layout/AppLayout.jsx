// Fungsi: Komponen layout untuk navigasi dan kerangka halaman aplikasi.
// frontend/src/components/layout/AppLayout.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getPageTitleConfig } from './NavItems';

function ConfirmDialog({ open, title, message, confirmLabel = 'Ya', cancelLabel = 'Batal', loading = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-700 shadow-2xl shadow-slate-950/30 dark:bg-gray-800 dark:text-gray-200">
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-gray-500 dark:text-gray-300">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusDialog({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1210] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-2xl bg-white px-6 py-7 text-center text-gray-700 shadow-2xl shadow-slate-950/30 dark:bg-gray-800 dark:text-gray-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-900/20">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m20 6-11 11-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
        {message ? <p className="mt-2 text-sm font-medium leading-6 text-gray-500 dark:text-gray-300">{message}</p> : null}
        <button type="button" onClick={onClose} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-primary-600 px-6 text-sm font-bold text-white transition-colors hover:bg-primary-700">
          Mengerti
        </button>
      </section>
    </div>
  );
}

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dark, toggleDark] = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, title: '', message: '' });
  
  const userRole = user?.role || 'admin';
  const { title, sub } = getPageTitleConfig(userRole, location.pathname);

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
    setSidebarOpen(false);
  };

  const confirmLogout = async () => {
    const loginPath = userRole === 'kepala_teknisi' ? '/kepala-teknisi/login' : '/admin/login';
    setLogoutBusy(true);
    try {
      await logout();
    } finally {
      setLogoutBusy(false);
      setLogoutConfirmOpen(false);
      setStatusDialog({
        open: true,
        title: 'Anda berhasil keluar',
        message: 'Akses akun pada perangkat ini telah diakhiri.',
      });
      window.setTimeout(() => navigate(loginPath, { replace: true }), 950);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 overflow-hidden">
      <Sidebar
        activePath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        dark={dark}
        toggleDark={() => toggleDark(!dark)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          title={title}
          sub={sub}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          userRole={userRole}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Keluar dari akun?"
        message="Anda akan keluar dari akun pada perangkat ini."
        confirmLabel="Keluar"
        loading={logoutBusy}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
      <StatusDialog
        open={statusDialog.open}
        title={statusDialog.title}
        message={statusDialog.message}
        onClose={() => setStatusDialog({ open: false, title: '', message: '' })}
      />
    </div>
  );
}
