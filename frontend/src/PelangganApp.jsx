// Aplikasi Pelanggan - SIGAP
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useAuth } from "./context/AuthContext";
import { PelangganForgotPassword } from "./components/pelanggan/PelangganAuth";
import { PelangganShell } from "./components/pelanggan/PelangganLayout";
import usePelangganData from "./hooks/usePelangganData";
import PelangganHome from "./pages/pelanggan/PelangganHome";
import PelangganLanding from "./pages/pelanggan/PelangganLanding";
import PelangganLogin from "./pages/pelanggan/PelangganLogin";
import PelangganRegister from "./pages/pelanggan/PelangganRegister";
import PelangganReportGuide from "./pages/pelanggan/PelangganReportGuide";
import { PelangganAbout, PelangganContact, PelangganTerms } from "./pages/pelanggan/PelangganInfoPages";
import PelangganReportDetail from "./pages/pelanggan/PelangganReportDetail";
import { PelangganDashboard, PelangganEditProfile, PelangganNotifications, PelangganPassword } from "./pages/pelanggan/PelangganProfile";
import { deletePelangganPhoto, updatePelangganProfile, uploadPelangganPhoto } from "./services/api";

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const scrollToLatestReports = () => {
  window.setTimeout(() => {
    document.getElementById("laporan-terbaru")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

const scrollToPageTop = () => {
  window.setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }), 0);
};

function Toast({ toast, onClose }) {
  if (!toast?.message) return null;

  const typeClass = toast.type === "success"
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-red-100 bg-red-50 text-red-700";

  return (
    <div className={`fixed left-4 right-4 top-20 z-[90] flex max-w-none items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl sm:left-auto sm:top-24 sm:max-w-sm ${typeClass}`}>
      <span className="min-w-0 flex-1">{toast.message}</span>
      <button type="button" onClick={onClose} className="shrink-0 font-extrabold" aria-label="Tutup notifikasi">
        x
      </button>
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel = "Ya", cancelLabel = "Batal", loading = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-xl bg-white p-5 text-slate-700 shadow-2xl shadow-slate-950/25">
        <h2 className="text-lg font-extrabold text-[#12304f]">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-60">
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function StatusDialog({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-2xl bg-white px-6 py-7 text-center text-slate-700 shadow-2xl shadow-slate-950/25">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m20 6-11 11-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-[#12304f]">{title}</h2>
        {message ? <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{message}</p> : null}
        <button type="button" onClick={onClose} className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-colors hover:bg-[#1d4ed8]">
          Mengerti
        </button>
      </section>
    </div>
  );
}

const protectedPelangganPages = new Set(["dashboard", "edit-profile", "notifications", "password", "report-detail"]);

const pelangganPathByPage = {
  home: "/pelanggan/home",
  login: "/pelanggan/login",
  register: "/pelanggan/register",
  forgot: "/pelanggan/forgot-password",
  dashboard: "/pelanggan/profil",
  "edit-profile": "/pelanggan/edit-profile",
  notifications: "/pelanggan/notifications",
  password: "/pelanggan/password",
  "report-guide": "/pelanggan/report-guide",
  about: "/pelanggan/about",
  terms: "/pelanggan/terms",
  contact: "/pelanggan/contact",
};

const getPelangganRouteFromPath = (pathname = window.location.pathname) => {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/" || normalizedPath === "/pelanggan") {
    return { page: "home", activeNav: "home" };
  }

  if (normalizedPath === "/pelanggan/create-report") {
    return { page: "home", activeNav: "create-report" };
  }

  if (normalizedPath === "/pelanggan/dashboard" || normalizedPath === "/pelanggan/profile") {
    return { page: "dashboard", activeNav: "dashboard" };
  }

  const reportMatch = normalizedPath.match(/^\/pelanggan\/report\/(\d+)$/);
  if (reportMatch) {
    return { page: "report-detail", activeNav: "", reportId: Number(reportMatch[1]) };
  }

  const found = Object.entries(pelangganPathByPage).find(([, path]) => path === normalizedPath);
  if (!found) return { page: "home", activeNav: "home" };

  const [page] = found;
  return {
    page,
    activeNav: ["login", "register", "forgot", "report-detail"].includes(page) ? "" : page,
  };
};

const getPelangganPath = (page, activeNav, reportId) => {
  if (page === "home" && activeNav === "create-report") return "/pelanggan/create-report";
  if (page === "report-detail") return `/pelanggan/report/${reportId || 1}`;
  return pelangganPathByPage[page] || pelangganPathByPage.home;
};

export default function PelangganApp({ initialAuthenticated = false, onBackToInternalLogin }) {
  const { user, token, login, logout, refreshUser } = useAuth();
  const isAuthenticatedAsPelanggan = initialAuthenticated || user?.role === "pelanggan";
  const initialRoute = getPelangganRouteFromPath();
  const initialPage = !isAuthenticatedAsPelanggan && protectedPelangganPages.has(initialRoute.page) ? "login" : initialRoute.page;
  const initialActiveNav = initialPage === "login" ? "" : initialRoute.activeNav;
  const [page, setPage] = useState(initialPage);
  const [activeNav, setActiveNav] = useState(initialActiveNav);
  const [authenticatedState, setAuthenticated] = useState(isAuthenticatedAsPelanggan);
  const authenticated = authenticatedState || user?.role === "pelanggan";
  const [loginNotice, setLoginNotice] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(initialRoute.reportId || 1);
  const [detailBackPage, setDetailBackPage] = useState("home");
  const [toast, setToast] = useState({ type: "", message: "" });
  const [statusDialog, setStatusDialog] = useState({ open: false, title: "", message: "" });
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);
  const didSyncInitialPathRef = useRef(false);
  const isApplyingPopStateRef = useRef(false);
  const pelanggan = usePelangganData({ authenticated });
  const profile = {
    ...pelanggan.profile,
    id: user?.id || pelanggan.profile.id || null,
    nama: user?.nama_lengkap || pelanggan.profile.nama || "",
    username: user?.username || pelanggan.profile.username || "",
    email: user?.email || pelanggan.profile.email || "",
    noLangganan: user?.no_langganan || pelanggan.profile.noLangganan || "",
    telepon: user?.no_telp || pelanggan.profile.telepon || "",
    alamat: user?.alamat || pelanggan.profile.alamat || "",
    tanggalLahir: toDateInputValue(user?.tanggal_lahir) || pelanggan.profile.tanggalLahir || "",
    jenisKelamin: user?.jenis_kelamin || pelanggan.profile.jenisKelamin || "",
    bio: user?.bio || pelanggan.profile.bio || "",
    foto: user?.foto_base64 || pelanggan.profile.foto || "",
  };
  const isBlockedPelangganPage = !authenticated && (protectedPelangganPages.has(page) || activeNav === "create-report");
  const visiblePage = isBlockedPelangganPage ? "login" : page;
  const visibleActiveNav = isBlockedPelangganPage ? "" : activeNav;

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (visiblePage === "home" && visibleActiveNav === "create-report") return;
    scrollToPageTop();
  }, [authenticated, visibleActiveNav, visiblePage]);

  useEffect(() => {
    if (!toast.message) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast({ type: "", message: "" });
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!statusDialog.open) return undefined;

    const timeoutId = window.setTimeout(() => {
      setStatusDialog({ open: false, title: "", message: "" });
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [statusDialog.open]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      showToast("success", "Koneksi internet tersambung kembali.");
    };
    const handleOffline = () => {
      setOnline(false);
      showToast("error", "Koneksi internet terputus.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const nextPath = getPelangganPath(visiblePage, visibleActiveNav, selectedReportId);
    const currentPath = `${window.location.pathname}${window.location.hash}`;

    if (currentPath === nextPath) {
      didSyncInitialPathRef.current = true;
      isApplyingPopStateRef.current = false;
      return;
    }

    const historyMethod = didSyncInitialPathRef.current && !isApplyingPopStateRef.current ? "pushState" : "replaceState";
    window.history[historyMethod](
      { sigapPelangganPage: visiblePage, activeNav: visibleActiveNav, reportId: selectedReportId },
      "",
      nextPath
    );
    didSyncInitialPathRef.current = true;
    isApplyingPopStateRef.current = false;
  }, [selectedReportId, visibleActiveNav, visiblePage]);

  useEffect(() => {
    if (visiblePage !== "home" || visibleActiveNav !== "create-report") return;

    window.setTimeout(() => {
      document.getElementById("buat-laporan")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [visibleActiveNav, visiblePage]);

  const navigate = async (nextPage) => {
    if (nextPage === "logout") {
      setLogoutConfirmOpen(true);
      return;
    }
    if (!authenticated && nextPage === "create-report") {
      setPage("login");
      setActiveNav("");
      return;
    }
    if (nextPage === "home") {
      setPage("home");
      setActiveNav("home");
      scrollToPageTop();
      return;
    }
    if (nextPage === "create-report") {
      setPage("home");
      setActiveNav(nextPage);
      window.setTimeout(() => {
        document.getElementById("buat-laporan")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }
    if (nextPage === "internal-login") {
      onBackToInternalLogin?.();
      return;
    }
    setActiveNav(nextPage);
    setPage(nextPage);
  };

  const confirmLogout = async () => {
    setLogoutBusy(true);
    try {
      if (user) await logout();
      setAuthenticated(false);
      setPage("home");
      setActiveNav("home");
      setLogoutConfirmOpen(false);
      setStatusDialog({
        open: true,
        title: "Anda berhasil keluar",
        message: "Akses akun pada perangkat ini telah diakhiri.",
      });
      scrollToPageTop();
    } catch {
      setAuthenticated(false);
      setPage("home");
      setActiveNav("home");
      setLogoutConfirmOpen(false);
      setStatusDialog({
        open: true,
        title: "Anda sudah keluar",
        message: "Akses akun pada perangkat ini telah diakhiri.",
      });
      scrollToPageTop();
    } finally {
      setLogoutBusy(false);
    }
  };

  const handleLogin = async ({ identifier, password }) => {
    setLoginNotice("");
    await login(identifier, password);
    setAuthenticated(true);
    setPage("home");
    setActiveNav("home");
    setStatusDialog({
      open: true,
      title: "Anda berhasil masuk",
      message: "Selamat datang kembali di SIGAP.",
    });
    scrollToPageTop();
  };

  const handleRegisterSuccess = async ({ identifier, message } = {}) => {
    if (token || user) {
      await logout();
    }
    setAuthenticated(false);
    setLoginIdentifier(identifier || "");
    setLoginNotice(message || "Pendaftaran berhasil. Silakan cek email verifikasi sebelum masuk.");
    setPage("login");
    setActiveNav("");
  };

  const handleProfileSave = async (draft, photoFile = null, options = {}) => {
    const payload = {
      nama_lengkap: draft.nama,
      username: draft.username,
      email: draft.email,
      no_telp: draft.telepon,
      tanggal_lahir: draft.tanggalLahir,
      jenis_kelamin: draft.jenisKelamin,
      alamat: draft.alamat,
      bio: draft.bio,
    };

    const response = await updatePelangganProfile(payload);
    let nextUser = response?.data || await refreshUser();

    if (options.deletePhoto) {
      const deleteResponse = await deletePelangganPhoto();
      nextUser = deleteResponse?.data || nextUser;
    } else if (photoFile) {
      const photoResponse = await uploadPelangganPhoto(photoFile, {
        onProgress: options.onUploadProgress,
      });
      nextUser = photoResponse?.data || nextUser;
    }

    const refreshedUser = await refreshUser();
    nextUser = refreshedUser || nextUser;

    pelanggan.setProfile({
      nama: nextUser?.nama_lengkap || draft.nama,
      username: nextUser?.username || draft.username,
      email: nextUser?.email || draft.email,
      noLangganan: nextUser?.no_langganan || draft.noLangganan,
      telepon: nextUser?.no_telp || draft.telepon,
      tanggalLahir: toDateInputValue(nextUser?.tanggal_lahir) || draft.tanggalLahir,
      jenisKelamin: nextUser?.jenis_kelamin || draft.jenisKelamin,
      alamat: nextUser?.alamat || draft.alamat,
      bio: nextUser?.bio || draft.bio,
      foto: nextUser && Object.prototype.hasOwnProperty.call(nextUser, "foto_base64") ? nextUser.foto_base64 || "" : draft.foto,
    });
    await Promise.all([
      pelanggan.refreshMyReports({ silent: true }),
      pelanggan.refreshPublicReports({ silent: true }),
    ]);
    setPage("dashboard");
    setActiveNav("dashboard");
    showToast("success", "Profil berhasil diperbarui.");
    scrollToPageTop();
  };

  const requirePelangganLogin = () => {
    if (authenticated && user?.role === "pelanggan") return true;
    setPage("login");
    setActiveNav("");
    return false;
  };

  useEffect(() => {
    const handleBackButton = () => {
      const route = getPelangganRouteFromPath();
      const nextPage = !authenticated && protectedPelangganPages.has(route.page) ? "login" : route.page;
      isApplyingPopStateRef.current = true;
      setPage(nextPage);
      setActiveNav(nextPage === "login" ? "" : route.activeNav);
      if (route.reportId) setSelectedReportId(route.reportId);
    };

    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [authenticated]);

  useEffect(() => {
    if (!loginNotice) return undefined;

    const timeoutId = window.setTimeout(() => {
      setLoginNotice("");
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [loginNotice]);

  if (visiblePage === "register") {
    return (
      <PelangganRegister
        onBack={() => setPage("home")}
        onRegistered={handleRegisterSuccess}
      />
    );
  }

  if (visiblePage === "forgot") {
    return <PelangganForgotPassword onBack={() => setPage("login")} />;
  }

  if (visiblePage === "login" && !authenticated) {
    return (
      <PelangganLogin
        onBack={() => setPage("home")}
        onLogin={handleLogin}
        onRegister={() => {
          setLoginNotice("");
          setLoginIdentifier("");
          setPage("register");
        }}
        onForgot={() => setPage("forgot")}
        successMessage={loginNotice}
        initialIdentifier={loginIdentifier}
      />
    );
  }

  const detailReports = [...pelanggan.myReports, ...pelanggan.reports];
  const report = detailReports.find((item) => item.id === selectedReportId) || detailReports[0];
  const handleReportCreated = async () => {
    await Promise.all([
      pelanggan.refreshPublicReports({ silent: true }),
      pelanggan.refreshMyReports({ silent: true }),
    ]);
    showToast("success", "Laporan berhasil dikirim.");
  };
  const homePageProps = {
    reports: pelanggan.reports,
    totalReports: pelanggan.totalReports,
    totalReportCount: pelanggan.totalReportCount,
    loadingReports: pelanggan.publicReportsLoading,
    canViewMoreReports: pelanggan.canViewMoreReports,
    loadingMoreReports: pelanggan.loadingMoreReports,
    onViewMoreReports: pelanggan.loadMoreReports,
    onLikeReport: pelanggan.likeReport,
    onCommentReport: pelanggan.commentReport,
    onRequireLogin: requirePelangganLogin,
    onNavigate: navigate,
    onReportClick: (id) => {
      setSelectedReportId(id);
      setDetailBackPage("home");
      setPage("report-detail");
      setActiveNav("");
    },
  };
  const pageMap = {
    home: authenticated
      ? <PelangganHome {...homePageProps} onReportCreated={handleReportCreated} />
      : <PelangganLanding {...homePageProps} />,
    dashboard: (
      <PelangganDashboard
        profile={profile}
        reports={pelanggan.myReports}
        totalReports={pelanggan.totalMyReports}
        loading={pelanggan.myReportsLoading}
        pagination={pelanggan.myReportPagination}
        onPageChange={pelanggan.changeMyReportPage}
        onDeleteReport={pelanggan.deleteReport}
        onToast={showToast}
        onNavigate={navigate}
        onReportClick={(id) => {
          setSelectedReportId(id);
          setDetailBackPage("dashboard");
          setPage("report-detail");
          setActiveNav("");
        }}
      />
    ),
    "edit-profile": <PelangganEditProfile key={profile.id || profile.email || "pelanggan-profile"} profile={profile} onSave={handleProfileSave} onNavigate={navigate} onToast={showToast} />,
    notifications: <PelangganNotifications profile={profile} onNavigate={navigate} />,
    password: <PelangganPassword profile={profile} onNavigate={navigate} />,
    "report-guide": <PelangganReportGuide onNavigate={navigate} />,
    about: <PelangganAbout />,
    terms: <PelangganTerms onNavigate={navigate} />,
    contact: <PelangganContact onNavigate={navigate} />,
    "report-detail": (
      <PelangganReportDetail
        key={report?.id || "report-detail"}
        report={report}
        onBack={() => {
          const backPage = detailBackPage || "home";
          setPage(backPage);
          setActiveNav(backPage === "dashboard" ? "" : backPage);
          if (backPage === "home") scrollToLatestReports();
        }}
        onLikeReport={pelanggan.likeReport}
        onCommentReport={pelanggan.commentReport}
        onRequireLogin={requirePelangganLogin}
      />
    ),
  };

  return (
    <PelangganShell
      user={profile}
      activePage={visibleActiveNav}
      authenticated={authenticated}
      flushHeader={visiblePage === "home"}
      onNavigate={navigate}
      onLoginClick={() => {
        setPage("login");
        setActiveNav("");
      }}
      onRegisterClick={() => {
        setLoginNotice("");
        setLoginIdentifier("");
        setPage("register");
        setActiveNav("");
      }}
    >
      <div className="w-full max-w-[100vw] overflow-x-clip bg-[#eef6ff]">
        {!online ? (
          <div className="sticky top-16 z-30 border-b border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-extrabold text-red-700 sm:top-20">
            Koneksi internet terputus.
            <button type="button" onClick={() => window.location.reload()} className="ml-3 rounded-lg bg-red-600 px-3 py-1 text-xs text-white">
              Coba Lagi
            </button>
          </div>
        ) : null}
        {pageMap[visiblePage] || pageMap.home}
      </div>
      <Toast toast={toast} onClose={() => setToast({ type: "", message: "" })} />
      <StatusDialog
        open={statusDialog.open}
        title={statusDialog.title}
        message={statusDialog.message}
        onClose={() => setStatusDialog({ open: false, title: "", message: "" })}
      />
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Keluar dari akun?"
        message="Anda akan keluar dari akun pada perangkat ini."
        confirmLabel="Keluar"
        loading={logoutBusy}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={confirmLogout}
      />
      {/* <div className="fixed bottom-4 left-4 z-40">
        <button onClick={() => navigate("internal-login")} className="px-4 py-2 bg-white border border-gray-300 rounded-full shadow text-xs font-semibold text-gray-600 hover:bg-gray-50">
          Login Admin/Kepala Teknisi
        </button>
      </div> */}
    </PelangganShell>
  );
}
