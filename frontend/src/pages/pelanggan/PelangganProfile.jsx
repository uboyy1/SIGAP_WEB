// Aplikasi Pelanggan - SIGAP
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteAllPelangganNotifications,
  formatRelativeTime,
  getPelangganNotifications,
  markAllPelangganNotificationsAsRead,
  markPelangganNotificationAsRead,
  updatePelangganPassword,
} from "../../services/api";

const reportStatusStyles = {
  menunggu: "bg-amber-50 text-amber-700 ring-amber-200",
  divalidasi: "bg-sky-50 text-sky-700 ring-sky-200",
  dalam_penanganan: "bg-blue-50 text-blue-700 ring-blue-200",
  selesai: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ditolak: "bg-red-50 text-red-700 ring-red-200",
};

const statusTabs = ["Semua", "Belum Diproses", "Sedang Diproses", "Selesai"];

function getPhotoSrc(value = "") {
  if (!value) return "";
  return value.startsWith("data:image") ? value : `data:image/jpeg;base64,${value}`;
}

function getProfileDisplayName(profile = {}) {
  return profile.username || profile.email || profile.nama || "Pelanggan";
}

function getProfileInitials(value = "") {
  const name = String(value || "Pelanggan").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function ProfileAvatar({ profile, previewSrc = "", className = "h-24 w-24" }) {
  const displayName = getProfileDisplayName(profile);
  const imageSrc = previewSrc || getPhotoSrc(profile?.foto);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={displayName}
        className={`${className} shrink-0 rounded-full border-4 border-white bg-white object-cover shadow-xl ring-1 ring-white/70`}
      />
    );
  }

  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full border-4 border-white bg-white text-2xl font-extrabold text-[#0D6EFD] shadow-xl ring-1 ring-white/70`}>
      {getProfileInitials(displayName)}
    </span>
  );
}

function ProfileInfoItem({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-sky-100 bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,58,125,0.05)]">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold leading-6 text-[#12304f]">{value || "-"}</p>
      {detail ? <p className="mt-1 break-words text-xs font-extrabold leading-5 text-[#0D6EFD]">{detail}</p> : null}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function ReportMetaIcon({ name }) {
  const commonProps = {
    className: "h-4 w-4 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "location") {
    return (
      <svg {...commonProps}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg {...commonProps}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ReportAvatar({ src, name }) {
  const imageSrc = getPhotoSrc(src);

  if (imageSrc) {
    return <img src={imageSrc} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-sky-100" />;
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-extrabold text-[#0D6EFD] ring-2 ring-sky-100">
      {getProfileInitials(name)}
    </span>
  );
}

function ProfileReportCard({ report, onClick, onDelete }) {
  const statusClass = reportStatusStyles[report.rawStatus] || "bg-slate-50 text-slate-700 ring-slate-200";
  const canDelete = report.rawStatus === "menunggu";

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onClick(report.id)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onClick(report.id);
      }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_14px_38px_rgba(15,58,125,0.08)] ring-1 ring-white transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_20px_48px_rgba(13,110,253,0.14)] focus:outline-none focus:ring-4 focus:ring-sky-200"
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <ReportAvatar src={report.avatar} name={report.author} />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#0D6EFD]">{report.author}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex min-h-8 w-fit items-center rounded-full px-3 text-xs font-extrabold ring-1 ${statusClass}`}>
              {report.status}
            </span>
            {canDelete ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(report);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                aria-label="Hapus laporan"
                title="Hapus laporan"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        <div className="text-sm">
          <p className="font-extrabold text-[#12304f]">Kategori gangguan:</p>
          <p className="mt-1 break-words text-slate-700">{report.category}</p>
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#12304f]">Deskripsi Gangguan:</p>
          <p className="mt-2 line-clamp-3 text-sm font-normal leading-6 text-slate-600">{report.excerpt}</p>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <span className="flex min-w-0 items-center gap-1.5">
              <ReportMetaIcon name="location" />
              <span className="truncate">{report.location}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ReportMetaIcon name="time" />
              Dilaporkan: {report.date}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <ReportMetaIcon name="message" />
            {report.comments} komentar
          </span>
        </div>
      </div>
    </article>
  );
}

function ProfileHero({
  profile,
  actionLabel = "LIHAT PROFIL",
  onAction,
  hideIdentity = false,
  avatarPreviewSrc = "",
  avatarControls = null,
  avatarFooter = null,
}) {
  const displayName = getProfileDisplayName(profile);
  const subscriptionNumber = profile.noLangganan ? `No langganan: ${profile.noLangganan}` : "No langganan belum tersedia";

  return (
    <section className="relative overflow-hidden bg-[#0D6EFD] text-white shadow-sm">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0,rgba(255,255,255,0.05)_38%,transparent_39%),linear-gradient(135deg,transparent_0%,rgba(3,37,106,0.18)_51%,transparent_52%)] bg-[size:420px_420px,220px_220px]" />
      <div className="relative mx-auto flex min-h-[250px] max-w-6xl flex-col justify-end gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex w-fit shrink-0 flex-col items-center gap-2">
            <div className={`relative w-fit ${avatarControls ? "pb-3" : ""}`}>
              <ProfileAvatar profile={profile} previewSrc={avatarPreviewSrc} className="h-24 w-24 sm:h-28 sm:w-28" />
              {avatarControls ? (
                <div className="absolute bottom-0 right-0 flex items-center gap-2">
                  {avatarControls}
                </div>
              ) : null}
            </div>
            {avatarFooter ? <div className="flex justify-center">{avatarFooter}</div> : null}
          </div>
          {!hideIdentity ? (
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-extrabold sm:truncate sm:text-3xl">{displayName}</h1>
              <p className="mt-2 break-words text-sm font-extrabold text-sky-100">{subscriptionNumber}</p>
            </div>
          ) : null}
        </div>
        <button
          onClick={onAction}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg border border-white/80 px-6 text-xs font-extrabold tracking-wide text-white transition-colors hover:bg-white hover:text-[#164b9d] sm:w-auto"
        >
          {actionLabel}
        </button>
      </div>
    </section>
  );
}

function ProfileSideNav({ active, onNavigate }) {
  const items = active === "notifications"
    ? [
        ["notifications", "Notifikasi"],
        ["edit-profile", "Ubah Profil"],
        ["password", "Ubah Password"],
      ]
    : [
        ["edit-profile", "Ubah Profil"],
        ["password", "Ubah Password"],
      ];

  return (
    <aside className="h-fit overflow-hidden rounded-xl border border-sky-100 bg-white text-sm shadow-[0_12px_34px_rgba(15,58,125,0.06)]">
      {items.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`w-full px-5 py-3.5 text-left transition-colors ${
            active === id
              ? "border-l-4 border-[#0D6EFD] bg-sky-50/80 font-extrabold text-[#12304f]"
              : "border-l-4 border-transparent font-bold text-slate-600 hover:bg-sky-50 hover:text-[#0D6EFD]"
          }`}
        >
          {label}
        </button>
      ))}
    </aside>
  );
}

function StatusTabs({ active, onChange }) {
  return (
    <div className="flex w-full max-w-full gap-2 overflow-x-auto rounded-xl border border-sky-100 bg-white p-1 text-xs shadow-sm">
      {statusTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`min-h-10 shrink-0 rounded-lg px-4 font-extrabold transition-colors ${
            active === tab ? "bg-[#0D6EFD] text-white shadow-sm" : "text-slate-500 hover:bg-sky-50 hover:text-[#0D6EFD]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function ReportSkeletonList() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-sky-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sky-100" />
              <div className="h-3 w-32 rounded bg-sky-100" />
            </div>
            <div className="h-7 w-24 rounded-full bg-sky-100" />
          </div>
          <div className="mt-5 h-3 w-44 rounded bg-sky-100" />
          <div className="mt-3 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function NotificationSkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-sky-100 bg-white px-4 py-4">
          <div className="flex gap-4">
            <div className="mt-1 h-3 w-3 rounded-full bg-sky-100" />
            <div className="flex-1">
              <div className="h-3 w-44 rounded bg-sky-100" />
              <div className="mt-3 h-3 w-full rounded bg-slate-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfirmPanel({ title, message, loading, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl shadow-slate-950/25">
        <h3 className="text-lg font-extrabold text-[#12304f]">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{message}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            Batal
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-60">
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function PelangganDashboard({
  profile,
  reports = [],
  totalReports = 0,
  loading = false,
  pagination = { page: 1, totalPages: 1 },
  onNavigate,
  onReportClick,
  onPageChange,
  onDeleteReport,
  onToast,
}) {
  const [activeStatus, setActiveStatus] = useState("Semua");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const filteredReports = useMemo(() => {
    if (activeStatus === "Semua") return reports;
    if (activeStatus === "Belum Diproses") {
      return reports.filter((report) => report.rawStatus === "menunggu" || report.status === "Belum Diproses");
    }
    if (activeStatus === "Sedang Diproses") {
      return reports.filter((report) => (
        report.rawStatus === "divalidasi"
        || report.rawStatus === "dalam_penanganan"
        || report.status === "Sedang Diproses"
        || report.status === "Dalam Proses"
        || report.status === "Divalidasi"
      ));
    }
    return reports.filter((report) => report.rawStatus === "selesai" || report.status === "Selesai");
  }, [activeStatus, reports]);
  const reportCounts = useMemo(() => ({
    total: totalReports || reports.length,
    waiting: reports.filter((report) => report.rawStatus === "menunggu" || report.status === "Belum Diproses").length,
    progress: reports.filter((report) => report.rawStatus === "divalidasi" || report.rawStatus === "dalam_penanganan" || report.status === "Sedang Diproses" || report.status === "Dalam Proses").length,
    done: reports.filter((report) => report.rawStatus === "selesai" || report.status === "Selesai").length,
  }), [reports, totalReports]);
  const canPaginate = activeStatus === "Semua" && (pagination?.totalPages || 1) > 1;

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);
    try {
      await onDeleteReport?.(deleteTarget.id);
      setDeleteTarget(null);
      onToast?.("success", "Laporan berhasil dihapus.");
    } catch (error) {
      onToast?.("error", error.message || "Gagal menghapus laporan.");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <ProfileHero profile={profile} actionLabel="UBAH" onAction={() => onNavigate("edit-profile")} />
      <main className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-6">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,58,125,0.07)]">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-[#12304f]">Data Pelanggan</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Informasi akun pelanggan SIGAP.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileInfoItem label="Nama Lengkap" value={profile.nama} />
              <ProfileInfoItem label="Username" value={profile.username || profile.email} />
              <ProfileInfoItem label="No Langganan" value={profile.noLangganan} />
              <ProfileInfoItem label="Email" value={profile.email} />
              <ProfileInfoItem label="No Telepon" value={profile.telepon} />
              <ProfileInfoItem label="Alamat" value={profile.alamat} />
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,58,125,0.07)]">
            <h2 className="text-lg font-extrabold text-[#12304f]">Riwayat Laporan</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Status laporan yang pernah anda buat.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
              {[
                ["Semua", reportCounts.total],
                ["Belum Diproses", reportCounts.waiting],
                ["Sedang Diproses", reportCounts.progress],
                ["Selesai", reportCounts.done],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-sky-50/70 px-4 py-3 ring-1 ring-sky-100">
                  <p className="text-2xl font-extrabold text-[#0D6EFD]">{value}</p>
                  <p className="mt-1 text-xs font-extrabold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-sky-100 bg-white/60 p-4 shadow-[0_14px_38px_rgba(15,58,125,0.06)] sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-[#12304f]">Data Laporan Pelanggan</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Pilih status untuk melihat laporan anda.</p>
          </div>
          <StatusTabs active={activeStatus} onChange={setActiveStatus} />
          <div className="mt-5 space-y-4">
            {loading ? (
              <ReportSkeletonList />
            ) : filteredReports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-white/80 px-5 py-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
                Belum ada laporan pada status ini.
              </div>
            ) : (
              filteredReports.map((report) => (
                <ProfileReportCard
                  key={report.id}
                  report={report}
                  onClick={onReportClick}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
          {canPaginate ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-extrabold text-slate-600">
              <button
                type="button"
                onClick={() => onPageChange?.((pagination.page || 1) - 1)}
                disabled={loading || (pagination.page || 1) <= 1}
                className="rounded-lg border border-sky-100 bg-white px-4 py-2 text-[#0D6EFD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span>Halaman {pagination.page || 1} dari {pagination.totalPages || 1}</span>
              <button
                type="button"
                onClick={() => onPageChange?.((pagination.page || 1) + 1)}
                disabled={loading || (pagination.page || 1) >= (pagination.totalPages || 1)}
                className="rounded-lg border border-sky-100 bg-white px-4 py-2 text-[#0D6EFD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </section>
      </main>
      {deleteTarget ? (
        <ConfirmPanel
          title="Hapus laporan?"
          message={`Laporan "${deleteTarget.title || ""}" akan dihapus permanen.`}
          loading={deleteBusy}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

const validateProfileField = (key, value = "") => {
  const text = String(value || "").trim();

  if (key === "nama" && (text.length < 2 || text.length > 100)) return "Nama lengkap harus 2-100 karakter.";
  if (key === "username" && text && !/^[a-zA-Z0-9._-]{3,50}$/.test(text)) return "Username harus 3-50 karakter dan hanya memakai huruf, angka, titik, garis bawah, atau tanda hubung.";
  if (key === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Format email tidak valid.";
  if (key === "telepon" && text && !/^(?:\+?62|0)?8\d{8,11}$/.test(text)) return "Nomor telepon Indonesia tidak valid.";
  if (key === "alamat" && text.length > 500) return "Alamat maksimal 500 karakter.";
  if (key === "bio" && text.length > 300) return "Bio maksimal 300 karakter.";
  return "";
};

const validateProfileDraft = (draft) => {
  const fields = ["nama", "username", "email", "telepon", "alamat", "bio"];
  return Object.fromEntries(
    fields
      .map((field) => [field, validateProfileField(field, draft[field])])
      .filter(([, message]) => message)
  );
};

export function PelangganEditProfile({ profile, onSave, onNavigate, onToast }) {
  const [draft, setDraft] = useState(profile);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoMarkedForDelete, setPhotoMarkedForDelete] = useState(false);
  const [deletePhotoConfirmOpen, setDeletePhotoConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const input = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#0D6EFD] focus:ring-4 focus:ring-sky-100";
  const inputErrorClass = "border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-100";
  const textarea = "min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-700 outline-none transition-colors focus:border-[#0D6EFD] focus:ring-4 focus:ring-sky-100";
  const fieldRow = "grid grid-cols-1 gap-2 text-sm sm:grid-cols-[170px_1fr] sm:items-start";
  const labelClass = "pt-2.5 font-bold text-slate-500";
  const avatarProfile = photoMarkedForDelete ? { ...draft, foto: "" } : draft;
  const canDeletePhoto = !photoMarkedForDelete && Boolean(photoPreview || draft.foto);
  const fieldErrorText = "mt-1.5 text-xs font-semibold text-red-600";
  const getInputClass = (field) => `${input} ${fieldErrors[field] ? inputErrorClass : ""}`;
  const getTextareaClass = (field) => `${textarea} ${fieldErrors[field] ? inputErrorClass : ""}`;

  const updateDraft = (key, value) => {
    const nextValue = key === "telepon" ? value.replace(/[^\d+]/g, "").slice(0, 15) : value;
    setDraft((current) => ({ ...current, [key]: nextValue }));
    setFieldErrors((current) => ({
      ...current,
      [key]: validateProfileField(key, nextValue),
    }));
    if (error) setError("");
  };

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format foto tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2MB.");
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoMarkedForDelete(false);
    setUploadProgress(0);
    setError("");
  };

  const handleDeletePhoto = () => {
    if (saving || !canDeletePhoto) return;
    setDeletePhotoConfirmOpen(true);
  };

  const confirmDeletePhoto = () => {
    if (saving || !canDeletePhoto) return;

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoMarkedForDelete(Boolean(draft.foto));
    setDeletePhotoConfirmOpen(false);
    setUploadProgress(0);
    setError("");
  };

  const handleCancelDeletePhoto = () => {
    if (saving) return;

    setPhotoMarkedForDelete(false);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    const nextErrors = validateProfileDraft(draft);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError("Periksa kembali data profil yang ditandai merah.");
      return;
    }

    setSaving(true);
    setUploadProgress(photoFile ? 1 : 0);
    try {
      await onSave(draft, photoFile, {
        deletePhoto: photoMarkedForDelete,
        onUploadProgress: setUploadProgress,
      });
    } catch (err) {
      const message = err.message || "Gagal menyimpan profil.";
      setError(message);
      onToast?.("error", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileHero
        profile={avatarProfile}
        avatarPreviewSrc={photoPreview}
        hideIdentity
        onAction={() => onNavigate("dashboard")}
        avatarControls={(
          <button
            type="button"
            onClick={() => !saving && fileInputRef.current?.click()}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0D6EFD] text-white shadow-lg transition-colors hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Ganti foto profil"
            title="Ganti foto profil"
          >
            <CameraIcon />
          </button>
        )}
        avatarFooter={canDeletePhoto || photoMarkedForDelete ? (
          <button
            type="button"
            onClick={photoMarkedForDelete ? handleCancelDeletePhoto : handleDeletePhoto}
            disabled={saving}
            className={`inline-flex min-h-9 items-center justify-center rounded-lg border px-4 text-xs font-extrabold backdrop-blur transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              photoMarkedForDelete
                ? "border-white/75 bg-white/10 text-white hover:bg-white/20"
                : "border-white/75 bg-transparent text-white hover:border-red-100 hover:bg-red-500/20"
            }`}
          >
            {photoMarkedForDelete ? "Batal Hapus" : "Hapus"}
          </button>
        ) : null}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handlePhotoChange}
        disabled={saving}
      />
      {photoFile ? <p className="sr-only">Foto dipilih: {photoFile.name}</p> : null}
      {photoMarkedForDelete ? <p className="sr-only">Foto profil akan dihapus setelah disimpan.</p> : null}
      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-[190px_1fr] md:gap-8">
        <ProfileSideNav active="edit-profile" onNavigate={onNavigate} />
        <section className="rounded-xl border border-sky-100 bg-white p-5 shadow-[0_14px_38px_rgba(15,58,125,0.07)] sm:p-7">
          <h1 className="border-b border-sky-100 pb-3 text-2xl font-extrabold text-[#12304f] sm:text-3xl">Ubah Profil</h1>
          <div className="space-y-7 pt-6">
            {error ? <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
            {saving && uploadProgress > 0 ? (
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <div className="flex justify-between text-xs font-extrabold text-[#0D6EFD]">
                  <span>Mengunggah foto</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#0D6EFD] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}
            <div className="space-y-5">
              <h2 className="font-extrabold text-[#12304f]">Informasi Publik</h2>
              <label className={fieldRow}>
                <span className={labelClass}>Nama Lengkap</span>
                <span>
                  <input className={getInputClass("nama")} value={draft.nama || ""} onChange={(event) => updateDraft("nama", event.target.value)} />
                  {fieldErrors.nama ? <p className={fieldErrorText}>{fieldErrors.nama}</p> : null}
                </span>
              </label>
              <label className={fieldRow}>
                <span className={labelClass}>Username</span>
                <span>
                  <input className={getInputClass("username")} value={draft.username || ""} onChange={(event) => updateDraft("username", event.target.value)} />
                  {fieldErrors.username ? <p className={fieldErrorText}>{fieldErrors.username}</p> : null}
                </span>
              </label>
              <label className={fieldRow}>
                <span className={labelClass}>Bio</span>
                <span>
                  <textarea className={getTextareaClass("bio")} value={draft.bio || ""} onChange={(event) => updateDraft("bio", event.target.value)} />
                  {fieldErrors.bio ? <p className={fieldErrorText}>{fieldErrors.bio}</p> : null}
                </span>
              </label>
            </div>

            <div className="space-y-5 border-t border-sky-100 pt-6">
              <h2 className="font-extrabold text-[#12304f]">Data Pribadi</h2>
              <label className={fieldRow}>
                <span className={labelClass}>No Langganan</span>
                <input className={`${input} cursor-not-allowed bg-slate-100 text-slate-500`} value={draft.noLangganan || ""} disabled readOnly />
              </label>
              <label className={fieldRow}>
                <span className={labelClass}>Email</span>
                <span>
                  <input type="email" className={getInputClass("email")} value={draft.email || ""} onChange={(event) => updateDraft("email", event.target.value)} />
                  {fieldErrors.email ? <p className={fieldErrorText}>{fieldErrors.email}</p> : null}
                </span>
              </label>
              <label className={fieldRow}>
                <span className={labelClass}>No Handphone</span>
                <span>
                  <input type="tel" className={getInputClass("telepon")} value={draft.telepon || ""} onChange={(event) => updateDraft("telepon", event.target.value)} />
                  {fieldErrors.telepon ? <p className={fieldErrorText}>{fieldErrors.telepon}</p> : null}
                </span>
              </label>
              <label className={fieldRow}>
                <span className={labelClass}>Tanggal Lahir</span>
                <input type="date" className={input} value={draft.tanggalLahir || ""} onChange={(event) => updateDraft("tanggalLahir", event.target.value)} />
              </label>
              <div className={fieldRow}>
                <span className={labelClass}>Jenis Kelamin</span>
                <div className="flex min-h-11 flex-wrap items-center gap-4 font-semibold text-slate-600">
                  <label className="inline-flex items-center">
                    <input type="radio" name="gender" className="mr-2 accent-[#0D6EFD]" checked={draft.jenisKelamin === "Laki-laki"} onChange={() => updateDraft("jenisKelamin", "Laki-laki")} />
                    Laki-laki
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="gender" className="mr-2 accent-[#0D6EFD]" checked={draft.jenisKelamin === "Perempuan"} onChange={() => updateDraft("jenisKelamin", "Perempuan")} />
                    Perempuan
                  </label>
                </div>
              </div>
              <label className={fieldRow}>
                <span className={labelClass}>Alamat</span>
                <span>
                  <textarea className={getTextareaClass("alamat")} value={draft.alamat || ""} onChange={(event) => updateDraft("alamat", event.target.value)} />
                  {fieldErrors.alamat ? <p className={fieldErrorText}>{fieldErrors.alamat}</p> : null}
                </span>
              </label>
            </div>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-sky-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0D6EFD] px-7 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(13,110,253,0.22)] transition-colors hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <SaveIcon />
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </section>
      </main>
      {deletePhotoConfirmOpen ? (
        <ConfirmPanel
          title="Hapus foto profil?"
          message="Foto profil akan dihapus setelah perubahan profil disimpan."
          loading={saving}
          onCancel={() => setDeletePhotoConfirmOpen(false)}
          onConfirm={confirmDeletePhoto}
        />
      ) : null}
    </>
  );
}

export function PelangganNotifications({ profile, onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (!silent) setMessage({ type: "", text: "" });

    try {
      const response = await getPelangganNotifications({ limit: 50 });
      setNotifications(response?.data?.notifications || []);
      setUnreadCount(response?.data?.unread_count || 0);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal memuat notifikasi." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadNotifications();
    }, 0);
    const intervalId = window.setInterval(() => {
      loadNotifications({ silent: true });
    }, 30000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification?.id || notification.is_read) return;

    try {
      await markPelangganNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal membaca notifikasi." });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setBusy("read-all");
    try {
      await markAllPelangganNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      setDeleteConfirmOpen(false);
      setMessage({ type: "success", text: "Semua notifikasi sudah dibaca." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal membaca semua notifikasi." });
    } finally {
      setBusy("");
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    setBusy("delete-all");
    try {
      await deleteAllPelangganNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setDeleteConfirmOpen(false);
      setMessage({ type: "success", text: "Semua notifikasi berhasil dihapus." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Gagal menghapus notifikasi." });
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <ProfileHero profile={profile} onAction={() => onNavigate("dashboard")} />
      <main className="mx-auto min-h-[300px] max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_16px_42px_rgba(15,58,125,0.08)]">
          <div className="flex flex-col gap-4 border-b border-sky-100 bg-gradient-to-r from-white to-sky-50/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-[#12304f] sm:text-3xl">Notifikasi</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">{unreadCount} notifikasi belum dibaca</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || busy === "read-all"}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0D6EFD] px-4 text-xs font-extrabold text-white shadow-[0_10px_22px_rgba(13,110,253,0.18)] transition-colors hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === "read-all" ? "Membaca..." : "Baca Semua"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={notifications.length === 0 || Boolean(busy)}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-extrabold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hapus Semua
              </button>
            </div>
          </div>

          {message.text ? (
            <div className={`mx-5 mt-5 rounded-lg border px-4 py-3 text-sm font-semibold sm:mx-6 ${message.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          ) : null}

          {deleteConfirmOpen ? (
            <div className="mx-5 mt-5 rounded-xl border border-red-100 bg-red-50 p-4 sm:mx-6">
              <p className="font-bold text-red-700">Hapus semua notifikasi?</p>
              <p className="mt-1 text-sm text-red-600/80">Notifikasi yang dihapus tidak akan tampil lagi.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                  Batal
                </button>
                <button type="button" onClick={handleDeleteAll} disabled={busy === "delete-all"} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {busy === "delete-all" ? "Menghapus..." : "Hapus Semua"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="p-5 sm:p-6">
            {loading ? (
              <NotificationSkeletonList />
            ) : notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 px-5 py-12 text-center">
                <p className="text-sm font-extrabold text-[#12304f]">Tidak ada notifikasi.</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Informasi terbaru akan muncul di sini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`group flex w-full gap-4 rounded-xl border px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_32px_rgba(13,110,253,0.12)] ${
                      notification.is_read ? "border-slate-100 bg-white" : "border-sky-100 bg-sky-50/80"
                    }`}
                  >
                    <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${notification.is_read ? "bg-slate-300 ring-slate-100" : "bg-[#0D6EFD] ring-sky-100"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-sm font-extrabold text-[#12304f]">{notification.title}</span>
                      <span className="mt-1 block break-words text-sm leading-6 text-slate-600">{notification.message}</span>
                      <span className="mt-3 block text-xs font-bold text-slate-400">{formatRelativeTime(notification.created_at)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function validatePasswordRules(value = "") {
  const errors = [];

  if (value.length < 8) errors.push("Minimal 8 karakter.");
  if (!/[A-Za-z]/.test(value)) errors.push("Memuat huruf.");
  if (!/[0-9]/.test(value)) errors.push("Memuat angka.");

  return errors;
}

export function PelangganPassword({ profile = {}, onNavigate = () => {} }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const input = "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#0D6EFD] focus:ring-4 focus:ring-sky-100";
  const errorInput = "border-red-300 focus:border-red-500 focus:ring-red-100";
  const newPasswordErrors = validatePasswordRules(form.new_password);
  const showNewPasswordErrors = Boolean(touched.new_password && form.new_password) && newPasswordErrors.length > 0;
  const showNewPasswordSuccess = Boolean(touched.new_password && form.new_password) && newPasswordErrors.length === 0 && !fieldErrors.new_password;
  const confirmPasswordError = touched.confirm_password && form.confirm_password && form.new_password !== form.confirm_password
    ? "Konfirmasi password baru tidak sesuai."
    : "";
  const getInputClass = (hasError) => `${input} ${hasError ? errorInput : ""}`;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    setFieldErrors((current) => {
      const next = { ...current, [field]: "" };
      if (field === "current_password" || field === "new_password") next.new_password = "";
      if (field === "new_password") next.confirm_password = "";
      return next;
    });
    if (message.type === "error") setMessage({ type: "", text: "" });
  };

  const handleUpdatePassword = async () => {
    setMessage({ type: "", text: "" });
    setFieldErrors({});
    const currentPassword = form.current_password;
    const newPassword = form.new_password;
    const confirmPassword = form.confirm_password;
    const nextErrors = {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      if (!currentPassword) nextErrors.current_password = "Password lama wajib diisi.";
      if (!newPassword) nextErrors.new_password = "Password baru wajib diisi.";
      if (!confirmPassword) nextErrors.confirm_password = "Konfirmasi password wajib diisi.";
      setFieldErrors(nextErrors);
      setTouched({ current_password: true, new_password: true, confirm_password: true });
      setMessage({ type: "error", text: "Semua kolom password wajib diisi." });
      return;
    }

    if (newPassword === currentPassword) {
      setFieldErrors({ new_password: "Password baru tidak boleh sama dengan password lama." });
      setTouched((current) => ({ ...current, new_password: true }));
      setMessage({ type: "error", text: "Password baru tidak boleh sama dengan password lama." });
      return;
    }

    const submitPasswordErrors = validatePasswordRules(newPassword);
    if (submitPasswordErrors.length > 0) {
      setTouched((current) => ({ ...current, new_password: true }));
      setMessage({ type: "error", text: "Password baru minimal 8 karakter dan wajib memuat huruf serta angka." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirm_password: "Konfirmasi password baru tidak sesuai." });
      setTouched((current) => ({ ...current, confirm_password: true }));
      setMessage({ type: "error", text: "Konfirmasi password baru tidak sesuai." });
      return;
    }

    setSaving(true);
    try {
      await updatePelangganPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setMessage({ type: "success", text: "Password berhasil diperbarui." });
    } catch (error) {
      const errorText = error.message || "Gagal memperbarui password.";
      const normalizedError = errorText.toLowerCase();
      if (normalizedError.includes("password saat ini salah") || normalizedError.includes("password lama")) {
        setFieldErrors({ current_password: "Password lama tidak sesuai." });
        setTouched((current) => ({ ...current, current_password: true }));
        setMessage({ type: "error", text: "Password lama tidak sesuai." });
      } else {
        setMessage({ type: "error", text: errorText });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileHero profile={profile} onAction={() => onNavigate("dashboard")} />
      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-[190px_1fr] md:gap-8">
        <ProfileSideNav active="password" onNavigate={onNavigate} />
        <section className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_16px_42px_rgba(15,58,125,0.08)]">
        <div className="border-b border-sky-100 bg-gradient-to-r from-white to-sky-50/80 px-5 py-5 sm:px-7">
          <h1 className="text-2xl font-extrabold text-[#12304f] sm:text-3xl">Kelola Password</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Perbarui password akun pelanggan Anda secara langsung dan aman.</p>
        </div>

        <div className="p-5 sm:p-7">
          {message.text ? (
            <div className={`mb-5 rounded-lg border px-4 py-3 text-sm font-semibold ${message.type === "success" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-red-100 bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-[#12304f] md:col-span-2">
              Password Lama*
              <input
                type="password"
                value={form.current_password}
                onChange={(event) => updateField("current_password", event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, current_password: true }))}
                className={getInputClass(Boolean(fieldErrors.current_password))}
                autoComplete="current-password"
              />
              {fieldErrors.current_password ? <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.current_password}</p> : null}
            </label>
            <label className="text-sm font-bold text-[#12304f]">
              Password Baru*
              <input
                type="password"
                value={form.new_password}
                onChange={(event) => updateField("new_password", event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, new_password: true }))}
                className={getInputClass(Boolean(fieldErrors.new_password || showNewPasswordErrors))}
                autoComplete="new-password"
              />
              {fieldErrors.new_password ? <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.new_password}</p> : null}
              {!fieldErrors.new_password && showNewPasswordErrors ? (
                <div className="mt-2 space-y-1">
                  {newPasswordErrors.map((error) => (
                    <p key={error} className="text-xs font-semibold text-red-600">{error}</p>
                  ))}
                </div>
              ) : null}
              {showNewPasswordSuccess ? <p className="mt-2 text-xs font-semibold text-emerald-600">Password baru sudah memenuhi ketentuan.</p> : null}
            </label>
            <label className="text-sm font-bold text-[#12304f]">
              Konfirmasi Password*
              <input
                type="password"
                value={form.confirm_password}
                onChange={(event) => updateField("confirm_password", event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, confirm_password: true }))}
                className={getInputClass(Boolean(fieldErrors.confirm_password || confirmPasswordError))}
                autoComplete="new-password"
              />
              {fieldErrors.confirm_password || confirmPasswordError ? (
                <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.confirm_password || confirmPasswordError}</p>
              ) : null}
            </label>
          </div>

          <div className="mt-7 flex justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0D6EFD] px-8 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(13,110,253,0.22)] transition-colors hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Menyimpan..." : "Ubah Password"}
            </button>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
