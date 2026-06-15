// Aplikasi Pelanggan - SIGAP
import { useCallback, useEffect, useRef, useState } from "react";
import logoSigap from "../../assets/logo_sigap.png";
import {
  deleteAllPelangganNotifications,
  formatRelativeTime,
  getPelangganNotifications,
  markAllPelangganNotificationsAsRead,
  markPelangganNotificationAsRead,
} from "../../services/api";

const footerLogos = {
  googlePlay: "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
  appStore: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg",
  instagram: "https://cdn.simpleicons.org/instagram/E4405F",
  facebook: "https://cdn.simpleicons.org/facebook/1877F2",
  x: "https://cdn.simpleicons.org/x/111111",
};

const navItems = [
  { id: "home", label: "Beranda" },
  { id: "report-guide", label: "Cara Pelaporan" },
  { id: "create-report", label: "Buat Laporan" },
  { id: "about", label: "Tentang SIGAP" },
  { id: "terms", label: "Ketentuan Layanan" },
];

const activeTextNavIds = ["home", "report-guide", "about", "terms"];

const profileMenuItems = [
  { id: "dashboard", label: "Profil Saya", icon: "profile" },
  { id: "notifications", label: "Notifikasi", icon: "bell" },
  { id: "edit-profile", label: "Ubah Profil", icon: "edit" },
  { id: "password", label: "Ubah Password", icon: "lock" },
];

function getProfileInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function ProfileMenuIcon({ name }) {
  const commonProps = {
    className: "h-4 w-4",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "edit") {
    return (
      <svg {...commonProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...commonProps}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg {...commonProps}>
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

  if (name === "contact") {
    return (
      <svg {...commonProps}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...commonProps}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function PdamLogo() {
  return (
    <svg viewBox="0 0 260 180" className="w-full h-full" role="img" aria-label="PDAM">
      <defs>
        <radialGradient id="pdamFooterGlow" cx="45%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#d7eef9" />
          <stop offset="42%" stopColor="#5ca6d1" />
          <stop offset="100%" stopColor="#00618e" />
        </radialGradient>
        <filter id="pdamFooterShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#002b45" floodOpacity="0.28" />
        </filter>
      </defs>
      <path d="M45 104C38 54 89 23 154 30c57 6 91 36 83 75-9 42-58 66-116 61-40-3-68-22-76-62Z" fill="url(#pdamFooterGlow)" stroke="#004e77" strokeWidth="2" filter="url(#pdamFooterShadow)" />
      <text x="83" y="101" fill="#f8fbff" stroke="#395364" strokeWidth="1.5" fontSize="49" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif">pdam</text>
      <path d="M42 122c39-5 70-1 103 7 36 9 60 6 89-8-8 15-25 27-49 32-27 5-54 2-91-7-22-5-40-7-54-6Z" fill="#00638d" />
      <path d="M50 144c34 13 70 16 111 9 29-5 52-14 70-27-12 24-41 43-77 50-38 7-74-3-104-32Z" fill="#004b73" />
      <path d="M55 137c31 7 60 10 91 6 28-3 53-11 75-23" fill="none" stroke="#bde9ff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function PamTkLogo() {
  return (
    <svg viewBox="0 0 220 220" className="w-full h-full" role="img" aria-label="PAM Tirta Karajae Kota Parepare">
      <path d="M110 18 188 158H32Z" fill="none" stroke="#073aa6" strokeWidth="12" />
      <path d="M88 82h31l-23 31 23 31H88l-23-31Z" fill="#073aa6" />
      <path d="M112 82h25l-23 31 23 31h-25l-23-31Z" fill="#1ee83a" />
      <path d="M137 82h25l-23 31 23 31h-25l-23-31Z" fill="#073aa6" />
      <text x="110" y="180" textAnchor="middle" fill="#073aa6" fontSize="20" fontWeight="700" fontFamily="Georgia, 'Times New Roman', serif">PAM TIRTA KARAJAE</text>
      <text x="110" y="201" textAnchor="middle" fill="#073aa6" fontSize="20" fontWeight="700" fontFamily="Georgia, 'Times New Roman', serif">KOTA PAREPARE</text>
    </svg>
  );
}

export function PelangganHeader({ user, activePage = "home", onNavigate, onLoginClick, onRegisterClick, authenticated }) {
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationBusy, setNotificationBusy] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
        setNotificationOpen(false);
        setDeleteConfirmOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!authenticated) return;

    try {
      const response = await getPelangganNotifications({ limit: 5 });
      setNotifications(response?.data?.notifications || []);
      setUnreadCount(response?.data?.unread_count || 0);
    } catch (error) {
      console.error("Gagal memuat notifikasi pelanggan:", error);
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) {
      const timeoutId = window.setTimeout(() => {
        setNotifications([]);
        setUnreadCount(0);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      loadNotifications();
    }, 0);
    const intervalId = window.setInterval(loadNotifications, 30000);
    window.addEventListener("pelanggan-notifications-refresh", loadNotifications);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("pelanggan-notifications-refresh", loadNotifications);
    };
  }, [authenticated, loadNotifications]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHidden(currentScrollY > lastScrollY.current && currentScrollY > 90);
      lastScrollY.current = Math.max(currentScrollY, 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHidden(false);
      if (window.scrollY === 0) {
        lastScrollY.current = 0;
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activePage]);

  const profileName = user?.nama || user?.username || user?.email || "Pelanggan";
  const profileUsername = user?.username || user?.email || profileName;
  const profileIdentifier = user?.noLangganan ? `No langganan: ${user.noLangganan}` : "No langganan belum tersedia";
  const profileMeta = profileIdentifier;
  const profileInitials = getProfileInitials(profileUsername);
  const latestNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notification) => {
    if (!notification?.id || notification.is_read) return;

    try {
      await markPelangganNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      console.error("Gagal menandai notifikasi pelanggan:", error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (unreadCount === 0) return;

    setNotificationBusy("read-all");
    try {
      await markAllPelangganNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Gagal membaca semua notifikasi pelanggan:", error);
    } finally {
      setNotificationBusy("");
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    setNotificationBusy("delete-all");
    try {
      await deleteAllPelangganNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Gagal menghapus notifikasi pelanggan:", error);
    } finally {
      setNotificationBusy("");
    }
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-40 w-full max-w-[100vw] border-b border-white/10 bg-[#0646a8] text-white shadow-[0_12px_32px_rgba(3,26,72,0.24)] transition-transform duration-500 ease-out ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="mx-auto flex h-16 w-full max-w-[1720px] items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-3">
          <img src={logoSigap} alt="SIGAP" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
          <span className="text-left leading-tight">
            <span className="block text-xl font-extrabold tracking-wide sm:text-2xl">SIGAP</span>
            <span className="hidden text-[11px] font-semibold text-white/75 sm:block">Sistem Informasi Gangguan Air PDAM</span>
          </span>
        </button>
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {navItems.map((item) => {
            const active = activeTextNavIds.includes(item.id) && activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors duration-200 ${
                  active
                    ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]"
                    : "text-white/72 hover:text-[#4FC3F7]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        {authenticated ? (
          <div ref={ref} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen((value) => {
                  const nextOpen = !value;
                  if (!nextOpen) setDeleteConfirmOpen(false);
                  return nextOpen;
                });
                setOpen(false);
              }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Buka notifikasi"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-[#0646a8]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {notificationOpen ? (
              <div className="fixed left-3 right-3 top-[4.5rem] z-50 mt-0 overflow-hidden rounded-2xl border border-sky-100 bg-white text-slate-700 shadow-2xl shadow-sky-950/20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(380px,calc(100vw-24px))]">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-extrabold text-[#12304f]">Notifikasi</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">{unreadCount} belum dibaca</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {notifications.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsAsRead}
                        disabled={unreadCount === 0 || Boolean(notificationBusy)}
                        className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-extrabold leading-none text-[#0D6EFD] transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Tandai semua notifikasi sudah dibaca"
                      >
                        {notificationBusy === "read-all" ? "Baca..." : "Baca"}
                      </button>
                    ) : null}
                    {notifications.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={Boolean(notificationBusy)}
                        className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-extrabold leading-none text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Hapus semua notifikasi"
                      >
                        Hapus
                      </button>
                    ) : null}
                  </div>
                </div>
                {deleteConfirmOpen ? (
                  <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-extrabold text-red-700">Hapus semua notifikasi?</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-red-600/80">Notifikasi yang dihapus tidak akan tampil lagi di akun ini.</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAllNotifications}
                        disabled={notificationBusy === "delete-all"}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {notificationBusy === "delete-all" ? "Menghapus..." : "Hapus semua"}
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-[#0D6EFD]">
                        <ProfileMenuIcon name="bell" />
                      </div>
                      <p className="text-sm font-extrabold text-[#12304f]">Belum ada notifikasi</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Perkembangan laporan akan muncul di sini.</p>
                    </div>
                  ) : latestNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-sky-50 ${notification.is_read ? "bg-white" : "bg-sky-50/70"}`}
                    >
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.is_read ? "bg-slate-300" : "bg-red-500"}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold text-[#12304f]">{notification.title}</span>
                        <span className="mt-1 line-clamp-2 block text-xs font-semibold leading-5 text-slate-500">{notification.message}</span>
                        <span className="mt-1 block text-[11px] font-semibold text-slate-400">{formatRelativeTime(notification.created_at)}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(false);
                    setDeleteConfirmOpen(false);
                    onNavigate("notifications");
                  }}
                  className="w-full border-t border-slate-100 px-4 py-3 text-center text-xs font-extrabold text-[#0D6EFD] transition-colors hover:bg-sky-50"
                >
                  Lihat semua notifikasi
                </button>
              </div>
            ) : null}

            <button
              onClick={() => {
                setOpen((v) => !v);
                setNotificationOpen(false);
                setDeleteConfirmOpen(false);
              }}
              className="flex min-w-0 items-center gap-3 rounded-full px-2 py-1.5 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Buka menu profil"
            >
              {user.foto ? (
                <img src={user.foto} alt={profileName} className="h-10 w-10 shrink-0 rounded-full border border-white/80 bg-gray-100 object-cover shadow-inner" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white text-sm font-extrabold text-[#0D6EFD] shadow-inner">
                  {profileInitials}
                </span>
              )}
              <span className="hidden min-w-0 max-w-[180px] text-left leading-tight sm:block">
                <span className="truncate text-base font-bold">{profileUsername}</span>
              </span>
              <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {open && (
              <div className="fixed left-3 right-3 top-[4.5rem] z-50 mt-0 max-h-[calc(100vh-5.25rem)] overflow-y-auto rounded-2xl border border-sky-100 bg-white text-slate-700 shadow-2xl shadow-sky-950/20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(340px,calc(100vw-24px))] sm:max-h-[calc(100vh-6rem)]">
                <div className="bg-gradient-to-br from-[#0D6EFD] to-[#0646a8] px-4 py-4 text-white">
                  <div className="flex min-w-0 items-center gap-3">
                    {user.foto ? (
                      <img src={user.foto} alt={profileName} className="h-12 w-12 shrink-0 rounded-full border-2 border-white/80 bg-white object-cover shadow-md" />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-white text-base font-extrabold text-[#0D6EFD] shadow-md">
                        {profileInitials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{profileUsername}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-white/75">{profileMeta}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onNavigate(item.id);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-600 transition-colors hover:bg-sky-50 hover:text-[#0D6EFD]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0D6EFD]">
                        <ProfileMenuIcon name={item.icon} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onNavigate("logout");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-extrabold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <ProfileMenuIcon name="logout" />
                    </span>
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden items-center gap-3 text-sm font-bold sm:flex">
            <button onClick={onLoginClick} className="rounded-lg border border-white/55 px-5 py-2.5 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg lg:px-6 lg:py-3">Masuk</button>
            <button onClick={onRegisterClick} className="rounded-lg bg-[#0D6EFD] px-5 py-2.5 shadow-lg shadow-blue-950/20 transition-all hover:-translate-y-0.5 hover:bg-[#1E88E5] lg:px-6 lg:py-3">Daftar</button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 lg:hidden"
          aria-label="Buka menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#063e9f]/95 px-4 pb-5 pt-2 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 text-sm font-semibold">
            {navItems.map((item) => {
              const active = activeTextNavIds.includes(item.id) && activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileOpen(false);
                    onNavigate(item.id);
                  }}
                  className={`rounded-xl px-3 py-3 text-left transition-colors duration-200 ${
                    active
                      ? "text-white"
                      : "text-white/72 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {!authenticated && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button onClick={() => { setMobileOpen(false); onLoginClick?.(); }} className="rounded-xl border border-white/55 px-4 py-3 font-bold">Masuk</button>
                <button onClick={() => { setMobileOpen(false); onRegisterClick?.(); }} className="rounded-xl bg-[#0D6EFD] px-4 py-3 font-bold">Daftar</button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PelangganFooter({ activePage, onNavigate }) {
  const footerNavItems = [
    ["home", "BERANDA"],
    ["report-guide", "CARA PELAPORAN"],
    ["terms", "KETENTUAN LAYANAN"],
    ["about", "TENTANG KAMI"],
    ["contact", "HUBUNGI KAMI"],
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-7 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs text-gray-700 items-center">
        <div>
          <p className="mb-3">Download aplikasi mobile SIGAP!</p>
          <div className="flex min-h-16 flex-wrap items-center justify-center gap-2">
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center transition-transform hover:scale-105 sm:h-14">
              <img src={footerLogos.googlePlay} alt="Get it on Google Play" className="h-full w-auto object-contain" />
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center transition-transform hover:scale-105 sm:h-10">
              <img src={footerLogos.appStore} alt="Download on the App Store" className="h-full w-auto object-contain" />
            </a>
          </div>
        </div>
        <div>
          <p className="mb-3">Dikelola Oleh</p>
          <div className="flex h-16 justify-center items-center gap-4">
            <a href="https://www.pdamparepare.com/" target="_blank" rel="noreferrer" className="flex h-16 w-20 items-center justify-center overflow-visible transition-transform hover:scale-105">
              <PdamLogo />
            </a>
            <a href="https://www.pdamparepare.com/" target="_blank" rel="noreferrer" className="flex h-16 w-16 items-center justify-center overflow-visible transition-transform hover:scale-105">
              <PamTkLogo />
            </a>
          </div>
        </div>
        <div>
          <p className="mb-3">Lebih Dekat Dengan Kami</p>
          <div className="flex h-16 justify-center items-center gap-5">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center hover:scale-110 transition-transform">
              <img src={footerLogos.instagram} alt="" className="h-6 w-6" />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center hover:scale-110 transition-transform">
              <img src={footerLogos.facebook} alt="" className="h-6 w-6" />
            </a>
            <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X" className="flex h-10 w-10 items-center justify-center hover:scale-110 transition-transform">
              <img src={footerLogos.x} alt="" className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center pb-5 text-[11px] text-gray-600">
        <div className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-2 font-bold">
          {footerNavItems.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={`transition-colors hover:text-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                activePage === id ? "text-[#0D6EFD]" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        Copyright 2026. <span className="text-sky-600">PDAM Tirta Karajae</span>. Hak cipta dilindungi Undang-Undang.
      </div>
    </footer>
  );
}

export function PelangganShell({ children, user, activePage, onNavigate, authenticated, onLoginClick, onRegisterClick, flushHeader = false }) {
  return (
    <div className={`pelanggan-app-root min-h-screen w-full max-w-[100vw] overflow-x-clip bg-[#eef6ff] text-gray-800 ${flushHeader ? "pt-0" : "pt-16 sm:pt-20"}`}>
      <PelangganHeader
        user={user}
        activePage={activePage}
        onNavigate={onNavigate}
        authenticated={authenticated}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />
      {children}
      <PelangganFooter activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
}

export function WaveHero({ title, subtitle, compact = false }) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-[#258fe4] to-[#0e54c8] text-white ${compact ? "h-44" : "h-64"}`}>
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_51%)] bg-[size:160px_160px]" />
      <div className="absolute left-0 right-0 bottom-0 h-24 bg-white/20 rounded-[50%_50%_0_0/100%_100%_0_0] translate-y-10" />
      <div className="absolute left-0 right-0 bottom-3 h-16 border-t-[10px] border-white/60 rounded-[50%]" />
      <div className="relative max-w-6xl mx-auto px-4 pt-14 text-center">
        <h1 className="font-bold text-2xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-white/85">{subtitle}</p>}
      </div>
    </section>
  );
}
