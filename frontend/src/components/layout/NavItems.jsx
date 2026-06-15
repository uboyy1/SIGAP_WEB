// Fungsi: Komponen layout untuk navigasi dan kerangka halaman aplikasi.
// frontend/src/components/layout/NavItems.jsx

// Admin Navigation Items
export const adminNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/admin/dashboard" },
  { id: "kelola-akun", label: "Kelola Akun", icon: "users", path: "/admin/kelola-akun" },
  { id: "reset-password", label: "Reset Password", icon: "reset", path: "/admin/reset-password" },
  { id: "generate-laporan", label: "Generate Laporan", icon: "report", path: "/admin/generate-laporan" },
  { id: "profil", label: "Profil", icon: "user", path: "/admin/profil" },
];

// Kepala Teknisi Navigation Items
export const kepalaTeknisiNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/kepala-teknisi/dashboard" },
  { id: "laporan-masuk", label: "Laporan Masuk", icon: "inbox", path: "/kepala-teknisi/laporan-masuk" },
  { id: "riwayat-pelaporan", label: "Riwayat Pelaporan", icon: "history", path: "/kepala-teknisi/riwayat-pelaporan" },
  { id: "analisis-kinerja", label: "Analisis Kinerja", icon: "chart", path: "/kepala-teknisi/analisis-kinerja" },
  { id: "laporan-darurat", label: "Laporan Darurat", icon: "alert", path: "/kepala-teknisi/laporan-darurat" },
  { id: "profil", label: "Profil", icon: "user", path: "/kepala-teknisi/profil" },
];

// Helper function to create SVG elements without JSX
const createIcon = (path, viewBox = "0 0 24 24", strokeWidth = "2") => {
  return (props) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", strokeWidth);
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    if (props.className) svg.setAttribute("class", props.className);
    svg.innerHTML = path;
    return svg;
  };
};

// Icon Components - Return SVG elements as React components
export const iconComponents = {
  // Dashboard icon
  dashboard: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    );
  },

  // Users icon (for admin - Kelola Akun)
  users: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  },

  // Reset password icon
  reset: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    );
  },

  // Report / Generate Laporan icon
  report: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  },

  // User profile icon
  user: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  },

  // Inbox icon (for Kepala Teknisi - Laporan Masuk)
  inbox: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M22 12h-4l-3 9H9l-3-9H2" />
        <path d="M5 3h14l-3 9h-8L5 3z" />
      </svg>
    );
  },

  // History icon (for Kepala Teknisi - Riwayat Pelaporan)
  history: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 3v6h6" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  },

  // Chart icon (for Kepala Teknisi - Analisis Kinerja)
  chart: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="5" />
        <rect x="12" y="8" width="3" height="9" />
        <rect x="17" y="5" width="3" height="12" />
      </svg>
    );
  },

  // Alert icon (for Kepala Teknisi - Laporan Darurat)
  alert: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  },

  // Logout icon
  logout: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    );
  },

  // Collapse left icon (for sidebar collapse)
  collapseLeft: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <polyline points="15 18 9 12 15 6" />
      </svg>
    );
  },

  // Collapse right icon (for sidebar expand)
  collapseRight: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    );
  },

  // Sun icon (light mode)
  sun: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  },

  // Moon icon (dark mode)
  moon: (props) => {
    const { className, ...rest } = props;
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  },
};

// Helper function to get navigation items based on user role
export const getNavItemsByRole = (role) => {
  if (role === 'admin') return adminNavItems;
  if (role === 'kepala_teknisi') return kepalaTeknisiNavItems;
  return [];
};

// Helper function to get page title and subtitle based on role and current path
export const getPageTitleConfig = (role, pathname) => {
  const pageConfigs = {
    admin: {
      "/admin/dashboard": { title: "Dashboard Analytics", sub: "Analisis data dan statistik sistem" },
      "/admin/kelola-akun": { title: "Kelola Akun", sub: "Kelola semua pengguna sistem" },
      "/admin/reset-password": { title: "Reset Password", sub: "Kelola permintaan reset password" },
      "/admin/generate-laporan": { title: "Generate Laporan", sub: "Ekspor dan kelola data laporan" },
      "/admin/profil": { title: "Profil Admin", sub: "Kelola profil administrator" },
      "/admin/edit-profil": { title: "Edit Profil", sub: "Perbarui informasi profil" },
    },
    kepala_teknisi: {
      "/kepala-teknisi/dashboard": { title: "Dashboard Kepala Teknisi", sub: "Monitoring dan statistik sistem" },
      "/kepala-teknisi/laporan-masuk": { title: "Laporan Masuk", sub: "Kelola laporan gangguan baru" },
      "/kepala-teknisi/riwayat-pelaporan": { title: "Riwayat Pelaporan", sub: "Riwayat laporan yang telah diproses" },
      "/kepala-teknisi/analisis-kinerja": { title: "Analisis Kinerja Teknisi", sub: "Analisis kinerja tim teknisi" },
      "/kepala-teknisi/laporan-darurat": { title: "Laporan Darurat", sub: "Laporan darurat dari teknisi" },
      "/kepala-teknisi/profil": { title: "Profil Kepala Teknisi", sub: "Informasi profil kepala teknisi" },
      "/kepala-teknisi/edit-profil": { title: "Edit Profil", sub: "Perbarui informasi profil" },
    },
  };
  
  return pageConfigs[role]?.[pathname] || { title: "SIGAP", sub: "Sistem Informasi Gangguan Air PDAM" };
};