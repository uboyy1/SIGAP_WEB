// Aplikasi Pelanggan - SIGAP: Halaman detail laporan pelanggan.
import { useState } from "react";
import { API_ORIGIN, getPelangganLaporanComments } from "../../services/api";

const reportStatusStyles = {
  menunggu: "bg-amber-50 text-amber-700 ring-amber-200",
  divalidasi: "bg-sky-50 text-sky-700 ring-sky-200",
  dalam_penanganan: "bg-blue-50 text-blue-700 ring-blue-200",
  selesai: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ditolak: "bg-red-50 text-red-700 ring-red-200",
};

function DetailIcon({ name, filled = false }) {
  const commonProps = {
    className: "h-4 w-4 shrink-0",
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "heart") {
    return (
      <svg {...commonProps}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
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

  if (name === "share") {
    return (
      <svg {...commonProps}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="m16 6-4-4-4 4" />
        <path d="M12 2v13" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...commonProps}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function getAvatarSrc(value = "") {
  if (!value) return "";
  return value.startsWith("data:image") ? value : `data:image/jpeg;base64,${value}`;
}

function getPhotoUrl(value = "") {
  if (!value) return "";
  if (/^(https?:|data:)/.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/uploads/laporan/${value}`}`;
}

function formatCommentDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mapComment(comment) {
  return {
    id: comment.id,
    text: comment.komentar || "",
    author: comment.user?.nama_lengkap || "Pelanggan",
    avatar: comment.user?.foto_base64 || "",
    date: formatCommentDate(comment.created_at || comment.createdAt),
  };
}

function DetailAvatar({ src, name }) {
  const imageSrc = getAvatarSrc(src);

  if (imageSrc) {
    return <img src={imageSrc} alt={name} className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-sky-100" />;
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0D6EFD] ring-2 ring-sky-100">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    </span>
  );
}

const isUnauthorizedInteraction = (error) => {
  const message = error?.message || "";
  return message.includes("Sesi habis") || message.includes("Token") || message.includes("Akses ditolak") || message.includes("login");
};

const COMMENT_SUCCESS_MESSAGE = "Komentar berhasil terkirim.";

export default function PelangganReportDetail({
  report,
  onBack,
  onLikeReport,
  onCommentReport,
  onRequireLogin,
}) {
  const [commentsList, setCommentsList] = useState([]);
  const [commentsStatus, setCommentsStatus] = useState("idle");
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [statOverride, setStatOverride] = useState({ reportId: 0 });

  const reportId = Number(report?.id);
  const baseStats = {
    likes: report?.likes || 0,
    comments: report?.comments || 0,
    liked: Boolean(report?.liked),
  };
  const localStats = statOverride.reportId === reportId
    ? { ...baseStats, ...statOverride }
    : baseStats;
  const isLiked = Boolean(localStats.liked);
  const statusClass = reportStatusStyles[report?.rawStatus] || "bg-slate-50 text-slate-700 ring-slate-200";
  const photoUrl = getPhotoUrl(report?.photo);

  const loadComments = async (targetId = reportId) => {
    const id = Number(targetId);
    if (!Number.isInteger(id) || id <= 0) return;

    setCommentsStatus("loading");
    try {
      const response = await getPelangganLaporanComments(id);
      setCommentsList((response?.data || []).map(mapComment));
      setCommentsStatus("ready");
    } catch (error) {
      console.error("Gagal memuat komentar laporan:", error);
      setCommentsStatus("error");
    }
  };

  if (!report) {
    return (
      <main className="bg-[#eef6ff] px-5 py-14 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-sky-200 bg-white px-5 py-10 text-center text-sm font-semibold text-slate-500">
          Laporan tidak ditemukan.
          <div className="mt-5">
            <button type="button" onClick={onBack} className="inline-flex min-h-10 items-center rounded-lg bg-[#0D6EFD] px-5 text-sm font-bold text-white hover:bg-[#075bd8]">
              Kembali
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleLike = async () => {
    if (!onRequireLogin?.()) return;

    setActionStatus({ type: "", message: "" });
    try {
      const response = await onLikeReport?.(report.id);
      const nextData = response?.data || {};
      const nextLiked = nextData.liked ?? !isLiked;
      setStatOverride((current) => ({
        ...current,
        reportId,
        liked: nextLiked,
        likes: nextData.like_count ?? Math.max(localStats.likes + (nextLiked ? 1 : -1), 0),
      }));
      if (nextLiked) {
        setLikePulse(true);
        window.setTimeout(() => setLikePulse(false), 420);
      }
    } catch (error) {
      if (isUnauthorizedInteraction(error)) {
        setActionStatus({ type: "", message: "" });
        onRequireLogin?.();
        return;
      }
      setActionStatus({ type: "error", message: error.message || "Gagal menyimpan suka." });
    }
  };

  const handleComment = async () => {
    if (!onRequireLogin?.()) return;

    if (!commentText.trim()) {
      setActionStatus({ type: "error", message: "Komentar tidak boleh kosong." });
      return;
    }

    setSubmittingComment(true);
    setActionStatus({ type: "", message: "" });
    try {
      const response = await onCommentReport?.(report.id, commentText.trim());
      const savedComment = response?.data?.komentar;
      if (savedComment) {
        setCommentsList((current) => [mapComment(savedComment), ...current]);
        setCommentsStatus("ready");
      } else {
        await loadComments(report.id);
      }
      setStatOverride((current) => ({
        ...current,
        reportId,
        comments: response?.data?.comment_count ?? localStats.comments + 1,
      }));
      setCommentText("");
      setShowComments(true);
      setActionStatus({ type: "success", message: COMMENT_SUCCESS_MESSAGE });
      window.setTimeout(() => {
        setActionStatus((current) => (
          current.message === COMMENT_SUCCESS_MESSAGE ? { type: "", message: "" } : current
        ));
      }, 5000);
    } catch (error) {
      if (isUnauthorizedInteraction(error)) {
        setActionStatus({ type: "", message: "" });
        onRequireLogin?.();
        return;
      }
      setActionStatus({ type: "error", message: error.message || "Gagal menyimpan komentar." });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentToggle = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);
    setActionStatus({ type: "", message: "" });

    if (nextShow && commentsStatus === "idle") {
      await loadComments(report.id);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#laporan-${report.id}`;
    const shareData = {
      title: report.title || report.category || "Laporan SIGAP",
      text: `${report.category || "Laporan Gangguan"} di ${report.location || "lokasi pelanggan"}`,
      url: shareUrl,
    };

    setShareStatus("");
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Link laporan berhasil dibagikan.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Link laporan disalin.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      setShareStatus("Gagal membagikan laporan.");
    }
  };

  return (
    <main className="bg-[#eef6ff] px-4 py-8 sm:px-8 lg:px-16 lg:py-10 xl:px-24">
      <article id={`laporan-${report.id}`} className="mx-auto max-w-[1180px] overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_14px_38px_rgba(15,58,125,0.08)] ring-1 ring-white">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <DetailAvatar src={report.avatar} name={report.author} />
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#0D6EFD]">{report.author}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{report.date}</p>
              </div>
            </div>
            <span className={`inline-flex min-h-8 w-fit items-center rounded-full px-3 text-xs font-extrabold ring-1 ${statusClass}`}>
              {report.status}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-extrabold text-[#12304f]">Kategori gangguan:</p>
              <p className="mt-2 break-words text-sm font-normal leading-7 text-slate-600">{report.category}</p>
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#12304f]">Deskripsi Gangguan:</p>
              <p className="mt-2 whitespace-pre-line break-words text-sm font-normal leading-7 text-slate-600">{report.excerpt}</p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-extrabold text-[#12304f]">Lokasi gangguan:</p>
              <p className="mt-2 flex min-w-0 items-center gap-2 text-sm font-normal leading-7 text-slate-600">
                <span className="text-[#0D6EFD]">
                  <DetailIcon name="location" />
                </span>
                <span className="break-words">{report.location}</span>
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-sky-100 bg-sky-50/50 p-3">
              <p className="mb-3 text-sm font-extrabold text-[#12304f]">Foto Gangguan:</p>
              {photoUrl ? (
                <img src={photoUrl} alt="Foto gangguan" className="mx-auto max-h-[420px] max-w-full rounded-lg border border-sky-100 bg-white object-contain shadow-sm" loading="lazy" />
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-sky-200 bg-white text-center text-xs font-semibold text-slate-400">
                  <svg className="mb-2 h-8 w-8 text-sky-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 8h.01" />
                    <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z" />
                    <path d="m3 16 5-5c.9-.9 2.1-.9 3 0l1 1 2-2c.9-.9 2.1-.9 3 0l4 4" />
                  </svg>
                  Tidak ada foto gangguan
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 border-y border-slate-100 py-4 text-sm font-semibold text-slate-500 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleLike}
                aria-pressed={isLiked}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                  isLiked
                    ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    : "bg-slate-50 text-slate-500 hover:bg-sky-50 hover:text-[#0D6EFD]"
                } ${likePulse ? "scale-105 shadow-[0_8px_20px_rgba(220,38,38,0.22)]" : ""}`}
              >
                <span className={`inline-flex transition-transform duration-200 ${likePulse ? "scale-125" : ""}`}>
                  <DetailIcon name="heart" filled={isLiked} />
                </span>
                {localStats.likes} suka
              </button>
              <button type="button" onClick={handleCommentToggle} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-50 px-3 transition-colors hover:bg-sky-50 hover:text-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-sky-200">
                <DetailIcon name="message" />
                {localStats.comments} komentar
              </button>
              <button type="button" onClick={handleShare} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-50 px-3 transition-colors hover:bg-sky-50 hover:text-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-sky-200">
                <DetailIcon name="share" />
                Bagikan
              </button>
            </div>
            {shareStatus ? <p className="text-xs font-semibold text-emerald-600 sm:text-right">{shareStatus}</p> : null}
          </div>

          {actionStatus.message ? (
            <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${actionStatus.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {actionStatus.message}
            </p>
          ) : null}

          {showComments ? (
            <section id="komentar-laporan" className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-[#12304f]">Tulis Komentar</h2>
                  <p className="text-xs font-semibold text-slate-500">{localStats.comments} komentar pada laporan ini</p>
                </div>
              </div>

              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                className="h-24 w-full resize-none rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="Tulis komentar..."
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={handleComment} disabled={submittingComment} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0D6EFD] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-70">
                  {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-extrabold text-[#12304f]">Semua Komentar</h3>
                <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-lg border border-sky-100 bg-white p-3">
                  {commentsStatus === "loading" ? (
                    <p className="text-xs font-semibold text-slate-500">Memuat komentar...</p>
                  ) : null}
                  {commentsStatus === "error" ? (
                    <p className="text-xs font-semibold text-red-600">Komentar gagal dimuat.</p>
                  ) : null}
                  {commentsStatus === "ready" && commentsList.length === 0 ? (
                    <p className="text-xs font-semibold text-slate-500">Belum ada komentar.</p>
                  ) : null}
                  {commentsList.map((comment) => (
                    <div key={comment.id} className="flex min-h-[58px] gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <DetailAvatar src={comment.avatar} name={comment.author} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="truncate text-xs font-extrabold text-[#12304f]">{comment.author}</p>
                          {comment.date ? <p className="text-[11px] font-semibold text-slate-400">{comment.date}</p> : null}
                        </div>
                        <p className="mt-1 whitespace-pre-line break-words text-sm font-normal leading-6 text-slate-600">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

        </div>
      </article>

      <div className="mx-auto mt-5 flex max-w-[1180px] justify-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#2563eb] px-7 text-center text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-[0_16px_34px_rgba(37,99,235,0.30)] focus:outline-none focus:ring-4 focus:ring-sky-200 sm:w-auto sm:text-base"
        >
          <DetailIcon name="back" />
          Kembali Ke Beranda
        </button>
      </div>
    </main>
  );
}
