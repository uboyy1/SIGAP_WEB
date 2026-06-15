// Fungsi: Komponen layout untuk navigasi dan kerangka halaman aplikasi.
// frontend/src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNavItemsByRole, iconComponents } from './NavItems';
import { useAuth } from '../../context/AuthContext';
import { getRecentNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteAllNotifications, formatRelativeTime } from '../../services/api';

const NavIcon = ({ name }) => {
  const Icon = iconComponents[name];
  return Icon ? <Icon className="w-4 h-4" /> : null;
};

export default function Topbar({ title, sub, onMenuClick, onLogout, userRole }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetPendingCount, setResetPendingCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItemsByRole(userRole);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Helper untuk mendapatkan token
  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
        setDeleteConfirmOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getRecentNotifications({ limit: 8 });
        if (response.success && response.data) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unread_count || 0);
        }
      } catch (error) {
        console.error('Gagal memuat notifikasi:', error);
      }
    };

    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 60000);
    return () => window.clearInterval(interval);
  }, []);

  // Polling untuk cek jumlah permintaan reset password (khusus admin)
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchResetRequestCount = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/reset-password?status=pending&limit=1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data.pagination) {
          setResetPendingCount(data.data.pagination.total);
        }
      } catch (error) {
        console.error('Failed to fetch reset request count:', error);
      }
    };
    
    fetchResetRequestCount();
    const interval = setInterval(fetchResetRequestCount, 30000);
    return () => clearInterval(interval);
  }, [user, API_BASE]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout?.();
  };

  const handleNavigate = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setNotificationOpen(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Gagal mengubah mode layar penuh:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, is_read: true } : item
        )));
        setUnreadCount((current) => Math.max(current - 1, 0));
      } catch (error) {
        console.error('Gagal menandai notifikasi:', error);
      }
    }

    if (userRole === 'admin' && notification.title?.toLowerCase().includes('reset password')) {
      handleNavigate('/admin/reset-password');
      return;
    }

    if (userRole === 'kepala_teknisi') {
      if (notification.type === 'pengajuan') {
        handleNavigate('/kepala-teknisi/laporan-masuk');
        return;
      }
      if (notification.type === 'laporan_darurat') {
        handleNavigate('/kepala-teknisi/laporan-darurat');
        return;
      }
      if (['pengambilan_tugas', 'selesai'].includes(notification.type)) {
        handleNavigate('/kepala-teknisi/riwayat-pelaporan');
        return;
      }
    }

    if (notification.laporan_id) {
      handleNavigate(userRole === 'kepala_teknisi' ? '/kepala-teknisi/riwayat-pelaporan' : '/admin/dashboard');
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Gagal menandai semua notifikasi:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Gagal menghapus semua notifikasi:', error);
    }
  };

  const getUserInitials = () => {
    const name = user?.username || user?.nama_lengkap || '';
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getProfilePhoto = () => {
    if (user?.foto_base64) return user.foto_base64;
    return null;
  };

  const photoBase64 = getProfilePhoto();

  const getRoleDisplay = () => {
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'kepala_teknisi') return 'Kepala Teknisi';
    return 'User';
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 focus:outline-none transition-all duration-200"
          aria-label="Buka menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight truncate">{title}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
          title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isFullscreen ? (
              <>
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </>
            ) : (
              <>
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
              </>
            )}
          </svg>
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setNotificationOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
            aria-label="Notifikasi"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-800">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-black/10 animate-fadeIn dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/30">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">Notifikasi</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} belum dibaca</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsAsRead}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/30"
                    >
                      Baca semua
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      Hapus semua
                    </button>
                  )}
                </div>
              </div>
              {deleteConfirmOpen && (
                <div className="border-b border-red-100 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-200">Hapus semua notifikasi?</p>
                  <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-200/80">Notifikasi yang dihapus tidak akan tampil lagi.</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-white dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAllNotifications}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      Hapus semua
                    </button>
                  </div>
                </div>
              )}
              <div className="max-h-96 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Belum ada notifikasi</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Aktivitas penting akan muncul di sini.</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-gray-700/50 ${
                        notification.is_read ? '' : 'bg-primary-50/70 dark:bg-primary-900/20'
                      }`}
                    >
                      <div className="flex gap-3">
                        <span className={`mt-1 h-2 w-2 rounded-full ${notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-500'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-800 dark:text-white">{notification.title}</span>
                          <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500 dark:text-gray-400">{notification.message}</span>
                          <span className="mt-1 block text-[11px] text-gray-400 dark:text-gray-500">{formatRelativeTime(notification.created_at)}</span>
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-md overflow-hidden flex-shrink-0">
              {photoBase64 ? (
                <img src={photoBase64} alt="Avatar" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">{user?.username || user?.nama_lengkap}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{getRoleDisplay()}</div>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 shadow-xl shadow-black/10 animate-fadeIn dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/30">
              <div className="px-4 pb-3 pt-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-md flex items-center justify-center">
                    {photoBase64 ? (
                      <img src={photoBase64} alt="Avatar" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <span>{getUserInitials()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">{user?.nama_lengkap || user?.username || 'User'}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{user?.email || '-'}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {getRoleDisplay()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="py-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <span className="text-gray-400 dark:text-gray-500"><NavIcon name={item.icon} /></span>
                    <span>{item.label}</span>
                    {item.id === 'reset-password' && resetPendingCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {resetPendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <span className="text-red-400"><NavIcon name="logout" /></span>
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
