  // Aplikasi Pelanggan - SIGAP
  import { useEffect, useMemo, useState } from "react";
  import heroBanner from "../../assets/Hero Banner Sigap.png";
  import monitoringImage from "../../assets/features/Monitoring laporan.png";
  import multiPlatformImage from "../../assets/features/Multi Platfrom.png";
  import notificationImage from "../../assets/features/Nontifikasi status.png";
  import onlineReportImage from "../../assets/features/Pelaporan online.png";
  import uploadProofImage from "../../assets/features/Upload bukti foto.png";
  import { API_ORIGIN, getPelangganKategori, getPelangganLaporanComments, uploadPelangganLaporan } from "../../services/api";

  const reportFlowSteps = [
    {
      number: "1",
      icon: "clipboard",
      title: "Buat Laporan",
      text: "Pelanggan mengirim laporan gangguan melalui SIGAP.",
    },
    {
      number: "2",
      icon: "checklist",
      title: "Verifikasi Laporan",
      text: "Data laporan dicek agar informasi lokasi dan gangguan jelas.",
    },
    {
      number: "3",
      icon: "user",
      title: "Penugasan Teknisi",
      text: "Kepala Teknisi menugaskan teknisi untuk tindak lanjut.",
    },
    {
      number: "4",
      icon: "tool",
      title: "Penanganan",
      text: "Teknisi menangani gangguan langsung di lokasi.",
    },
    {
      number: "5",
      icon: "file",
      title: "Laporan Selesai",
      text: "Pelanggan menerima status penyelesaian laporan.",
    },
  ];

  function FlowIcon({ name }) {
    const iconClass = "h-7 w-7";

    if (name === "checklist") {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <path d="m3 6 1.5 1.5L7 4" />
          <path d="m3 12 1.5 1.5L7 10" />
          <path d="m3 18 1.5 1.5L7 16" />
        </svg>
      );
    }

    if (name === "user") {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );
    }

    if (name === "tool") {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.5 2.5-2-2 2.5-2.5Z" />
        </svg>
      );
    }

    if (name === "file") {
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v5h5" />
          <path d="m9 15 2 2 4-5" />
        </svg>
      );
    }

    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 9h16" />
        <path d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path d="m9 15 2 2 4-5" />
      </svg>
    );
  }

  function ReportFlowPanel() {
    return (
      <section id="cara-pelaporan" className="bg-[#eef6ff] px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-24 2xl:px-28">
        <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-2xl border border-white/80 bg-white px-4 py-7 text-center text-[#12304f] shadow-[0_24px_70px_rgba(5,42,124,0.12)] ring-1 ring-sky-100 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">Alur Pelaporan SIGAP</h2>
            <p className="mt-2 text-xs font-semibold text-slate-500 sm:text-sm">Proses pelaporan yang mudah dan transparan</p>
          </div>

          <div className="relative mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-[84px] z-0 hidden h-0.5 bg-sky-200 lg:block">
              {[25, 50, 75].map((position) => (
                <span
                  key={position}
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-sky-300 bg-white"
                  style={{ left: `${position}%` }}
                />
              ))}
            </div>
            {reportFlowSteps.map((step) => (
              <div key={step.number} className="relative z-10 flex h-full flex-col items-center rounded-xl border border-sky-100 bg-white px-3 py-5 shadow-[0_12px_30px_rgba(13,110,253,0.07)] lg:border-transparent lg:bg-transparent lg:shadow-none">
                <div className="relative flex h-24 w-20 flex-col items-center justify-start">
                  <span className="relative z-10 mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0D6EFD] text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(13,110,253,0.32)]">
                    {step.number}
                  </span>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-100 bg-[#f4f9ff] text-[#0D6EFD] shadow-[0_14px_30px_rgba(13,110,253,0.10)]">
                    <FlowIcon name={step.icon} />
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-extrabold sm:text-base">{step.title}</h3>
                <p className="mt-2 max-w-[180px] text-xs font-semibold leading-5 text-slate-500">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function ReportCountBanner({ total = 0 }) {
    const value = Number.isFinite(Number(total)) ? String(Number(total)) : "0";

    return (
      <section className="relative isolate overflow-hidden bg-[#063b9f] px-5 py-8 text-center text-white sm:px-8 sm:py-10 lg:px-16 xl:px-24 2xl:px-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0D6EFD_0%,#0750c8_48%,#032f86_100%)]" />
        <div className="pointer-events-none absolute -left-16 top-0 -z-10 h-full w-[30%] skew-x-[-42deg] bg-[#38bdf8]/24" />
        <div className="pointer-events-none absolute left-[31%] top-0 -z-10 h-full w-[24%] skew-x-[-42deg] bg-[#0b3b91]/26" />
        <div className="pointer-events-none absolute right-[14%] top-0 -z-10 h-full w-[24%] skew-x-[42deg] bg-[#02276f]/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-white/20" />

        <div className="mx-auto max-w-[1420px]">
          <p className="text-sm font-extrabold uppercase tracking-wide sm:text-lg lg:text-xl">Jumlah Laporan Sekarang</p>
          <p className="mt-4 text-4xl font-extrabold leading-none tracking-normal sm:text-5xl lg:text-6xl">{value}</p>
        </div>
      </section>
    );
  }

  const reportStatusStyles = {
    menunggu: "bg-amber-50 text-amber-700 ring-amber-200",
    divalidasi: "bg-sky-50 text-sky-700 ring-sky-200",
    dalam_penanganan: "bg-blue-50 text-blue-700 ring-blue-200",
    selesai: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ditolak: "bg-red-50 text-red-700 ring-red-200",
  };

  function ReportMetaIcon({ name, filled = false }) {
    const commonProps = {
      className: "h-4 w-4 shrink-0",
      viewBox: "0 0 24 24",
      fill: filled ? "currentColor" : "none",
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

    if (name === "heart") {
      return (
        <svg {...commonProps}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
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

  function getAvatarSrc(value = "") {
    if (!value) return "";
    return value.startsWith("data:image") ? value : `data:image/jpeg;base64,${value}`;
  }

  const formatCommentDate = (value) => {
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
  };

  const mapComment = (comment) => ({
    id: comment.id,
    text: comment.komentar || "",
    author: comment.user?.nama_lengkap || "Pelanggan",
    avatar: comment.user?.foto_base64 || "",
    date: formatCommentDate(comment.created_at || comment.createdAt),
  });

  const getUploadedPhotoUrl = (value = "") => {
    if (!value) return "";
    if (/^(https?:|data:|blob:)/.test(value)) return value;
    return `${API_ORIGIN}${value.startsWith("/") ? value : `/uploads/laporan/${value}`}`;
  };

  function CustomerAvatar({ src, name }) {
    const imageSrc = getAvatarSrc(src);

    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt={name}
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-sky-100"
          loading="lazy"
        />
      );
    }

    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0D6EFD] ring-2 ring-sky-100">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

  function LatestReportCard({ report, onClick, onLike, onComment, onRequireLogin }) {
    const [showComments, setShowComments] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [commentsStatus, setCommentsStatus] = useState("idle");
    const [commentText, setCommentText] = useState("");
    const [actionStatus, setActionStatus] = useState({ type: "", message: "" });
    const [submittingComment, setSubmittingComment] = useState(false);
    const [likePulse, setLikePulse] = useState(false);
    const statusClass = reportStatusStyles[report.rawStatus] || "bg-slate-50 text-slate-700 ring-slate-200";
    const isLongDescription = (report.excerpt || "").length > 180;
    const isLiked = Boolean(report.liked);

    const openDetail = () => {
      onClick?.(report.id);
    };

    const isInteractiveTarget = (target) => Boolean(target?.closest?.("button, a, input, textarea, select, label, [data-report-interactive='true']"));

    const handleCardKeyDown = (event) => {
      if (isInteractiveTarget(event.target)) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openDetail();
    };

    const loadComments = async () => {
      setCommentsStatus("loading");
      try {
        const response = await getPelangganLaporanComments(report.id);
        setCommentsList((response?.data || []).map(mapComment));
        setCommentsStatus("ready");
      } catch (error) {
        console.error("Gagal memuat komentar laporan:", error);
        setCommentsStatus("error");
      }
    };

    const handleLike = async () => {
      if (!onRequireLogin?.()) return;

      setActionStatus({ type: "", message: "" });
      try {
        const response = await onLike(report.id);
        if (response?.data?.liked) {
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

    const handleCommentToggle = async () => {
      const nextShowComments = !showComments;
      setShowComments(nextShowComments);
      setActionStatus({ type: "", message: "" });

      if (nextShowComments && commentsStatus === "idle") {
        await loadComments();
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
        const response = await onComment(report.id, commentText.trim());
        const savedComment = response?.data?.komentar;
        if (savedComment) {
          setCommentsList((current) => [mapComment(savedComment), ...current]);
          setCommentsStatus("ready");
        } else {
          await loadComments();
        }
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

    return (
      <article
        id={`laporan-terbaru-${report.id}`}
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={handleCardKeyDown}
        className="group cursor-pointer overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_14px_38px_rgba(15,58,125,0.08)] ring-1 ring-white transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_20px_48px_rgba(13,110,253,0.14)] focus:outline-none focus:ring-4 focus:ring-sky-200"
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <CustomerAvatar src={report.avatar} name={report.author} />
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#0D6EFD]">{report.author}</p>
              </div>
            </div>
            <span className={`inline-flex min-h-8 w-fit items-center rounded-full px-3 text-xs font-extrabold ring-1 ${statusClass}`}>
              {report.status}
            </span>
          </div>

          <div className="text-sm">
            <p className="font-extrabold text-[#12304f]">Kategori gangguan:</p>
            <p className="mt-1 break-words text-slate-700">{report.category}</p>
          </div>

          <div>
            <p className="text-sm font-extrabold text-[#12304f]">Deskripsi Gangguan:</p>
            <p className="mt-2 line-clamp-3 text-sm font-normal leading-6 text-slate-600">{report.excerpt}</p>
            {isLongDescription ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openDetail();
                }}
                className="mt-1 text-sm font-extrabold text-[#0D6EFD] transition-colors hover:text-[#075bd8] hover:underline focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                Baca Lebih Lanjut
              </button>
            ) : null}
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
            <div className="flex flex-wrap items-center gap-2 text-slate-500 sm:justify-end">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleLike();
                }}
                aria-pressed={isLiked}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-full px-2 py-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                  isLiked
                    ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                    : "text-slate-500 hover:bg-sky-50 hover:text-[#0D6EFD]"
                } ${likePulse ? "scale-110 shadow-[0_8px_20px_rgba(220,38,38,0.22)]" : ""}`}
              >
                <span className={`inline-flex transition-transform duration-200 ${likePulse ? "scale-125" : ""}`}>
                  <ReportMetaIcon name="heart" filled={isLiked} />
                </span>
                {report.likes} suka
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCommentToggle();
                }}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-sky-50 hover:text-[#0D6EFD] focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                <ReportMetaIcon name="message" />
                {report.comments} komentar
              </button>
            </div>
          </div>

          {actionStatus.message ? (
            <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${actionStatus.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {actionStatus.message}
            </p>
          ) : null}

          {showComments ? (
            <div
              data-report-interactive="true"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="rounded-xl border border-sky-100 bg-sky-50/50 p-3"
            >
              {showComments ? (
                <div className="mb-3 max-h-52 space-y-3 overflow-y-auto rounded-lg border border-sky-100 bg-white p-3">
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
                    <div key={comment.id} className="flex gap-2.5 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                      <CustomerAvatar src={comment.avatar} name={comment.author} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="truncate text-xs font-extrabold text-[#12304f]">{comment.author}</p>
                          {comment.date ? <p className="text-[11px] font-semibold text-slate-400">{comment.date}</p> : null}
                        </div>
                        <p className="mt-1 whitespace-pre-line break-words text-xs font-normal leading-5 text-slate-600">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                className="h-20 w-full resize-none rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                placeholder="Tulis komentar..."
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowComments(false);
                  }}
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button type="button" onClick={handleComment} disabled={submittingComment} className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#0D6EFD] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:opacity-70">
                  {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  function ReviewItem({ title, value, className = "" }) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50/70 p-4 ${className}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 whitespace-pre-line text-sm font-normal leading-6 text-slate-700">{value || "Belum diisi"}</p>
      </div>
    );
  }

  function ValuesSection() {
    const values = [
      {
        title: "VISI",
        text: "Mewujudkan Perusahaan Yang Mandiri, Unggul, dan Terpercaya",
      },
      {
        title: "MOTTO",
        text: "Melayani Dengan Hati Yang Jernih",
      },
      {
        title: "MISI",
        text: "Kualitas, Kuantitas, Kontinuitas, Produksifitas, dan Profitabilitas",
      },
    ];

    return (
      <section className="relative z-10 -mt-6 bg-white px-5 pb-12 pt-8 sm:px-8 lg:px-16 xl:px-24 2xl:px-28">
        <div className="mx-auto grid max-w-[1420px] gap-8 text-center md:grid-cols-3 md:gap-10">
          {values.map((item) => (
            <div key={item.title} className="px-5 py-4">
              <h2 className="text-2xl font-medium tracking-wide text-slate-950">{item.title}</h2>
              <p className="mx-auto mt-4 max-w-md text-base font-normal leading-7 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const sigapFeatures = [
    {
      id: "pelaporan-online",
      title: "Pelaporan Online",
      text: "Laporkan gangguan air kapan saja melalui SIGAP tanpa perlu datang ke kantor pelayanan. Semua data laporan tersimpan rapi dan dapat dipantau kembali oleh pelanggan.",
      points: ["Form laporan digital", "Riwayat laporan tersimpan", "Pengiriman laporan lebih cepat"],
      image: onlineReportImage,
    },
    {
      id: "upload-bukti-foto",
      title: "Upload Bukti Foto",
      text: "Tambahkan foto kondisi gangguan agar petugas mendapatkan bukti visual yang jelas sebelum melakukan validasi dan tindak lanjut di lapangan.",
      points: ["Bukti visual lebih jelas", "Mempermudah proses validasi", "Informasi laporan lebih lengkap"],
      image: uploadProofImage,
    },
    {
      id: "notifikasi-status",
      title: "Notifikasi Status",
      text: "Dapatkan informasi perubahan status laporan secara berkala, mulai dari menunggu verifikasi, diproses petugas, hingga laporan dinyatakan selesai.",
      points: ["Update status laporan", "Informasi tindak lanjut", "Pelanggan lebih mudah memantau progres"],
      image: notificationImage,
    },
    {
      id: "monitoring-real-time",
      title: "Monitoring Real-Time",
      text: "Pantau perkembangan penanganan laporan secara transparan dari halaman pelanggan SIGAP, sehingga proses tindak lanjut dapat diketahui dengan lebih jelas.",
      points: ["Progres laporan transparan", "Pantau proses penanganan", "Status penanganan lebih mudah dipahami"],
      image: monitoringImage,
    },
    {
      id: "akses-multi-platform",
      title: "Akses Multi Platform",
      text: "Akses layanan SIGAP melalui perangkat yang kamu gunakan, baik dari web maupun perangkat mobile, sehingga pelaporan dan pemantauan tetap mudah dilakukan.",
      points: ["Tersedia melalui web", "Mendukung perangkat mobile", "Akses layanan lebih fleksibel"],
      image: multiPlatformImage,
    },
  ];

  function MainFeaturesSection() {
    const [activeFeatureId, setActiveFeatureId] = useState(sigapFeatures[0].id);
    const activeFeature = sigapFeatures.find((feature) => feature.id === activeFeatureId) || sigapFeatures[0];

    return (
      <section className="relative isolate overflow-hidden bg-[#063b9f] px-5 py-14 text-white sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#0D6EFD_0%,#0750c8_48%,#032f86_100%)]" />
        <div className="pointer-events-none absolute -left-16 top-0 -z-10 h-full w-[30%] skew-x-[-42deg] bg-[#38bdf8]/24" />
        <div className="pointer-events-none absolute left-[31%] top-0 -z-10 h-full w-[24%] skew-x-[-42deg] bg-[#0b3b91]/26" />
        <div className="pointer-events-none absolute right-[14%] top-0 -z-10 h-full w-[24%] skew-x-[42deg] bg-[#02276f]/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-white/20" />
        <div className="relative mx-auto max-w-[1180px]">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">Fitur Utama SIGAP</h2>
            <p className="mt-4 text-base font-semibold text-white/90 sm:text-lg">Tentukan sendiri sesuai kebutuhan pelaporanmu</p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:gap-5">
            {sigapFeatures.map((feature) => (
              <button
                type="button"
                key={feature.id}
                onClick={() => setActiveFeatureId(feature.id)}
                className={`min-h-11 w-full rounded-full px-5 text-sm font-extrabold transition-all sm:w-auto sm:px-6 sm:text-base ${
                  activeFeature.id === feature.id
                    ? "bg-white text-[#063b9f] shadow-[0_14px_30px_rgba(2,38,113,0.18)]"
                    : "text-white hover:bg-white/12"
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          <div className="group relative mx-auto mt-10 min-h-[420px] w-full max-w-[1060px] overflow-hidden rounded-2xl bg-[#022173] shadow-[0_30px_90px_rgba(2,38,113,0.24)] ring-1 ring-white/14 transition-transform duration-500 hover:-translate-y-1 sm:mt-12 sm:rounded-3xl lg:min-h-[430px]">
            <div className="relative h-[240px] overflow-hidden bg-[#022173] sm:h-[300px] lg:absolute lg:inset-0 lg:h-full">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(13,110,253,0.18)_0%,rgba(5,45,132,0.06)_52%,rgba(4,24,80,0.28)_100%)]" />
              <img
                key={activeFeature.image}
                src={activeFeature.image}
                alt={activeFeature.title}
                className="h-full w-full object-contain object-left-bottom transition-all duration-500 ease-out group-hover:scale-[1.015] lg:h-full"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,33,115,0)_0%,rgba(2,33,115,0.08)_44%,rgba(2,33,115,0.58)_100%)]" />
            </div>
            <div className="relative z-10 mx-3 mb-3 rounded-2xl bg-[#022173] px-4 py-6 text-white shadow-[0_24px_70px_rgba(3,18,60,0.28)] sm:mx-6 sm:mb-6 sm:rounded-3xl sm:px-8 sm:py-7 lg:absolute lg:right-10 lg:top-1/2 lg:mx-0 lg:mb-0 lg:w-[42%] lg:-translate-y-1/2 lg:px-7 lg:py-7 xl:right-20 xl:w-[38%]">
              <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-[34px]">{activeFeature.title}</h3>
              {activeFeature.text ? (
                <p className="mt-4 max-w-xl text-xs font-semibold leading-5 text-white/92 sm:text-sm">{activeFeature.text}</p>
              ) : null}
              {activeFeature.points.length ? (
                <div className="mt-6 space-y-3.5">
                  {activeFeature.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0D6EFD]">
                        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      </span>
                      <p className="pt-2 text-xs font-bold leading-5 text-white sm:text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function HeroSection({ showActions = true, onNavigate }) {
    const scrollToReport = () => {
      document.getElementById("buat-laporan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
      <section className="relative isolate min-h-[100svh] w-full max-w-[100vw] overflow-hidden bg-[#053a9a] text-white sm:min-h-[104svh] lg:min-h-[108svh]">
        <div className="absolute inset-0 h-full w-full overflow-hidden bg-gradient-to-br from-[#053a9a] via-[#0D6EFD] to-[#1E88E5] shadow-[0_24px_80px_rgba(13,110,253,0.28)]">
          <img
            src={heroBanner}
            alt="Pelanggan SIGAP menggunakan smartphone dan teknisi PDAM memperbaiki pipa"
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[74%_center] opacity-100"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-y-0 left-0 w-[72%] bg-[linear-gradient(90deg,rgba(2,32,96,0.98)_0%,rgba(4,58,146,0.88)_46%,rgba(5,64,163,0.34)_76%,transparent_100%)]" />
          <div className="absolute inset-y-0 right-0 w-[34%] bg-[linear-gradient(270deg,rgba(1,21,70,0.42)_0%,rgba(1,21,70,0.12)_46%,transparent_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,26,78,0.20)_0%,rgba(3,26,78,0)_32%,rgba(1,23,72,0.22)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#032a7c] via-[#053a9a]/62 to-transparent" />
            <div className="absolute bottom-[-116px] left-1/2 h-48 w-[124%] -translate-x-1/2 rounded-[100%] bg-white" />
            <div className="absolute bottom-[-70px] left-[6%] h-28 w-[58%] rounded-[100%] border-t border-white/35 bg-[#4FC3F7]/12 blur-[1px]" />
            <div className="absolute bottom-[-78px] right-[-10%] h-32 w-[62%] rounded-[100%] border-t border-white/25 bg-white/10 blur-[1px]" />
            <div className="absolute bottom-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/38 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1520px] grid-cols-1 items-center px-5 pb-24 pt-24 sm:min-h-[104svh] sm:px-8 sm:pb-28 sm:pt-32 lg:min-h-[108svh] lg:grid-cols-[0.9fr_1.1fr] lg:px-16 lg:pb-32 lg:pt-36 xl:px-24 2xl:px-28">
          <div className="max-w-2xl animate-fadeIn">
            <h1 className="text-[2rem] font-extrabold leading-[1.1] text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              Laporkan Gangguan Air dengan Cepat dan Mudah
            </h1>
            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-white/86 sm:mt-6 sm:text-lg sm:leading-8">
              SIGAP membantu pelanggan PDAM melaporkan gangguan air secara online kapanpun dan dimanapun, memantau progres penanganan, dan memperoleh informasi status laporan secara transparan dan real-time.
            </p>
            {showActions ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={scrollToReport}
                  className="group relative inline-flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#0D6EFD] to-[#28A8FF] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(13,110,253,0.30)] ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(13,110,253,0.38)] focus:outline-none focus:ring-4 focus:ring-sky-300/35 sm:w-auto sm:min-w-[252px]"
                >
                  <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.22)_42%,transparent_68%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/18 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span className="relative text-center sm:whitespace-nowrap">Buat Laporan Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.("report-guide")}
                  className="group relative inline-flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/45 bg-white/12 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_32px_rgba(2,38,113,0.20)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/65 hover:bg-white/18 focus:outline-none focus:ring-4 focus:ring-white/25 sm:w-auto sm:min-w-[270px]"
                >
                  <span className="absolute inset-0 bg-white/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white/14 ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-105">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
                    </svg>
                  </span>
                  <span className="relative text-center sm:whitespace-nowrap">Pelajari Cara Pelaporan</span>
                </button>
              </div>
            ) : null}
          </div>
          <div className="hidden min-h-[240px] lg:block" aria-hidden="true" />
        </div>
      </section>
    );
  }

  function ComplaintForm({ onReportCreated }) {
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [kategoriStatus, setKategoriStatus] = useState("loading");
    const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
    const [formErrors, setFormErrors] = useState({});
    const [successPopupOpen, setSuccessPopupOpen] = useState(false);
    const [successPhotoUrl, setSuccessPhotoUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
      categoryId: "",
      categoryName: "",
      customCategory: "",
      description: "",
      phone: "",
      location: "",
      date: "",
      photoName: "",
      photoFile: null,
      privacy: "tidak_ada",
    });
    const input = "mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-normal text-slate-700 shadow-sm transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100";
    const inputHeight = "h-11";
    const normalLabel = "block text-sm font-normal text-[#123b5a]";
    const errorText = "mt-1 text-xs font-semibold text-red-600";
    const inputClass = (field, extra = "") => `${input} ${extra} ${
      formErrors[field] ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100" : ""
    }`;
    const reviewCategory = isCustomCategory(formData.categoryName) ? formData.customCategory : formData.categoryName;
    const photoPreviewUrl = useMemo(() => (
      formData.photoFile ? URL.createObjectURL(formData.photoFile) : ""
    ), [formData.photoFile]);
    const sortedCategories = useMemo(() => (
      [...categories].sort((a, b) => {
        const aIsOther = isCustomCategory(a?.nama_kategori);
        const bIsOther = isCustomCategory(b?.nama_kategori);
        if (aIsOther === bIsOther) return 0;
        return aIsOther ? 1 : -1;
      })
    ), [categories]);
    const getFieldError = (field, value, data) => {
      const nextData = { ...data, [field]: value };
      const categoryIsOther = isCustomCategory(nextData.categoryName);

      if ((field === "categoryId" || field === "categoryName") && !nextData.categoryId) return "Kategori gangguan wajib dipilih.";
      if (field === "customCategory" && categoryIsOther && !String(nextData.customCategory || "").trim()) return "Jelaskan kategori gangguan lainnya.";
      if (field === "description") {
        const length = String(value || "").trim().length;
        if (length < 10 || length > 2000) return "Deskripsi harus 10-2000 karakter.";
      }
      if (field === "phone" && !/^\d{10,13}$/.test(String(value || "").trim())) return "Nomor telepon harus 10-13 digit angka.";
      if (field === "date") {
        if (!value) return "Tanggal kejadian wajib diisi.";
        if (value > new Date().toISOString().slice(0, 10)) return "Tanggal kejadian tidak boleh melebihi hari ini.";
      }
      if (field === "location") {
        const length = String(value || "").trim().length;
        if (length < 5 || length > 500) return "Lokasi harus 5-500 karakter.";
      }
      if (field === "photoFile" && !value) return "Foto gangguan wajib diunggah.";
      return "";
    };
    const updateForm = (field, value) => {
      const nextValue = field === "phone" ? value.replace(/\D/g, "").slice(0, 13) : value;
      setFormData((currentData) => {
        const nextFormData = { ...currentData, [field]: nextValue };
        setFormErrors((current) => {
          const next = { ...current };
          delete next[field];
          if (field === "categoryId" || field === "categoryName") {
            delete next.category;
            delete next.customCategory;
          }
          if (field === "photoFile") delete next.photo;
          const error = getFieldError(field, nextValue, nextFormData);
          if (error) {
            if (field === "categoryId" || field === "categoryName") next.category = error;
            else if (field === "photoFile") next.photo = error;
            else next[field] = error;
          }
          return next;
        });
        return nextFormData;
      });
    };
    const resetForm = () => {
      setStep(1);
      setFormData({
        categoryId: "",
        categoryName: "",
        customCategory: "",
        description: "",
        phone: "",
        location: "",
        date: "",
        photoName: "",
        photoFile: null,
        privacy: "tidak_ada",
      });
      setFormErrors({});
      setUploadProgress(0);
    };
    const buildStepErrors = () => {
      const errors = {};
      const categoryIsOther = isCustomCategory(formData.categoryName);

      if (!formData.categoryId) errors.category = "Kategori gangguan wajib dipilih.";
      if (categoryIsOther && !formData.customCategory.trim()) errors.customCategory = "Jelaskan kategori gangguan lainnya.";
      if (!formData.description.trim()) errors.description = "Deskripsi lengkap gangguan wajib diisi.";
      if (!formData.phone.trim()) errors.phone = "Nomor telepon wajib diisi.";
      if (!formData.date) errors.date = "Tanggal kejadian wajib diisi.";
      if (!formData.location.trim()) errors.location = "Lokasi gangguan wajib diisi.";
      if (!formData.photoFile) errors.photo = "Foto gangguan wajib diunggah.";
      if (formData.photoFile) {
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(formData.photoFile.type)) errors.photo = "Format foto harus JPG, PNG, atau WEBP.";
        if (formData.photoFile.size > 2 * 1024 * 1024) errors.photo = "Ukuran foto maksimal 2MB.";
      }

      return errors;
    };
    const validateStep = () => {
      const errors = buildStepErrors();
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        setSubmitStatus({ type: "", message: "" });
        return false;
      }

      setSubmitStatus({ type: "", message: "" });
      return true;
    };
    const handleContinueReview = () => {
      if (!validateStep()) return;
      setStep(2);
    };
    const handleSubmit = async () => {
      setSubmitStatus({ type: "", message: "" });

      if (!validateStep()) {
        setStep(1);
        return;
      }

      setSubmitting(true);
      setUploadProgress(1);
      try {
        const response = await uploadPelangganLaporan({
          kategori_gangguan_id: formData.categoryId,
          judul: `Laporan ${reviewCategory}`,
          deskripsi: formData.description.trim(),
          lokasi: formData.location.trim(),
          nomor_telepon: formData.phone.trim(),
          opsi_privasi: formData.privacy,
          sub_kategori: isCustomCategory(formData.categoryName) ? formData.customCategory.trim() : "",
          tanggal_kejadian: formData.date,
          foto: formData.photoFile,
        }, {
          onProgress: setUploadProgress,
        });

        setSubmitStatus({ type: "", message: "" });
        setSuccessPhotoUrl(getUploadedPhotoUrl(response?.data?.foto || ""));
        setSuccessPopupOpen(true);
        window.dispatchEvent(new Event("pelanggan-notifications-refresh"));
        resetForm();
        await onReportCreated?.();
      } catch (error) {
        setSubmitStatus({ type: "error", message: error.message || "Gagal mengirim laporan. Silakan coba lagi." });
      } finally {
        setSubmitting(false);
      }
    };
    function isCustomCategory(value = "") {
      return value.toLowerCase().includes("lain");
    }
    function getCategoryInfo(value = "") {
      const normalized = value.toLowerCase();

      if (normalized.includes("bocor")) {
        return {
          text: "Pipa bocor adalah kondisi air keluar dari pipa, sambungan, atau area meteran yang rusak.",
          example: "Contoh: air merembes di halaman, pipa pecah di jalan, atau ada genangan di sekitar meteran.",
        };
      }

      if (normalized.includes("tidak mengalir") || normalized.includes("mati")) {
        return {
          text: "Air tidak mengalir berarti air tidak keluar sama sekali dari keran meskipun instalasi rumah dalam kondisi terbuka.",
          example: "Contoh: seluruh keran rumah tidak mengeluarkan air sejak pagi atau hanya keluar angin.",
        };
      }

      if (normalized.includes("tekanan")) {
        return {
          text: "Tekanan air bermasalah berarti air masih keluar, tetapi alirannya sangat kecil, lemah, atau tidak stabil.",
          example: "Contoh: air hanya menetes pada jam tertentu atau lantai atas tidak mendapat aliran air.",
        };
      }

      if (normalized.includes("kualitas") || normalized.includes("keruh") || normalized.includes("bau")) {
        return {
          text: "Kualitas air bermasalah berkaitan dengan kondisi air yang berubah warna, berbau, berasa, atau terlihat kotor.",
          example: "Contoh: air keruh kecokelatan, berbau tidak sedap, atau terdapat endapan.",
        };
      }

      if (normalized.includes("infrastruktur") || normalized.includes("meter") || normalized.includes("pipa")) {
        return {
          text: "Gangguan infrastruktur berkaitan dengan kerusakan alat atau jaringan fisik seperti meteran, sambungan, dan pipa.",
          example: "Contoh: meteran rusak, sambungan pipa longgar, penutup meter hilang, atau pipa terlihat retak.",
        };
      }

      if (isCustomCategory(value)) {
        return {
          text: "Pilih Lainnya jika gangguan yang anda alami tidak tersedia pada kategori utama.",
          example: "Contoh: masalah meter tidak biasa, keluhan layanan tertentu, atau kondisi khusus di lokasi.",
        };
      }

      return {
        text: "Kategori ini membantu petugas memahami jenis gangguan dan menentukan tindak lanjut awal.",
        example: "Contoh: pilih kategori yang paling mendekati kondisi gangguan di lokasi anda.",
      };
    }
    useEffect(() => {
      let ignore = false;

      const loadCategories = async () => {
        try {
          const response = await getPelangganKategori();
          if (ignore) return;
          setCategories(response?.data || []);
          setKategoriStatus("ready");
        } catch (error) {
          if (ignore) return;
          console.error("Gagal memuat kategori gangguan:", error);
          setKategoriStatus("error");
        }
      };

      loadCategories();

      return () => {
        ignore = true;
      };
    }, []);

    useEffect(() => () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    }, [photoPreviewUrl]);

    return (
      <>
      <div id="buat-laporan" className="relative z-10 mx-auto max-w-4xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_24px_70px_rgba(15,58,125,0.14)] ring-1 ring-white/80">
        <div className="bg-[#2563eb] px-6 py-5 text-center text-xl font-extrabold text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.22)]">
          Buat Laporan Aduan
        </div>

        <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div className="relative grid grid-cols-2 text-center text-sm font-semibold text-slate-500">
            <div className="absolute left-1/4 right-1/4 top-4 h-0.5 bg-slate-200" />
            <div className={`relative ${step === 1 ? "text-sky-600" : "text-slate-500"}`}>
              <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 1 ? "bg-[#0D6EFD] text-white shadow-[0_8px_18px_rgba(13,110,253,0.28)]" : "bg-sky-100 text-sky-600"}`}>1</span>
              <p className="mt-2">Tulis Laporan</p>
            </div>
            <div className={`relative ${step === 2 ? "text-sky-600" : "text-slate-500"}`}>
              <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 2 ? "bg-[#0D6EFD] text-white shadow-[0_8px_18px_rgba(13,110,253,0.28)]" : "bg-slate-100 text-slate-500"}`}>2</span>
              <p className="mt-2">Tinjau Laporan</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6 text-sm sm:p-8">
          {submitStatus.message ? (
            <p className={`rounded-lg px-4 py-3 text-sm font-semibold ${submitStatus.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {submitStatus.message}
            </p>
          ) : null}
          {step === 1 ? (
            <>
              <div>
                <p className="mb-3 text-sm font-bold text-[#123b5a]">Pilih Kategori Gangguan</p>
                <div className={`space-y-2 rounded-xl border bg-white p-4 shadow-sm ${formErrors.category ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                  {kategoriStatus === "loading" ? (
                    <p className="py-2 text-sm text-slate-500">Memuat kategori...</p>
                  ) : null}
                  {kategoriStatus === "error" ? (
                    <p className="py-2 text-sm font-semibold text-red-600">Kategori gangguan gagal dimuat.</p>
                  ) : null}
                  {sortedCategories.map((item) => {
                    const categoryInfo = getCategoryInfo(item.nama_kategori);

                    return (
                      <label
                        key={item.id}
                        className="flex min-w-0 cursor-pointer items-start gap-2 py-1.5 font-normal text-slate-700 sm:items-center"
                      >
                        <input
                          type="radio"
                          name="kategori"
                          value={item.id}
                          checked={String(formData.categoryId) === String(item.id)}
                          onChange={() => {
                            updateForm("categoryId", item.id);
                            updateForm("categoryName", item.nama_kategori);
                            if (!isCustomCategory(item.nama_kategori)) updateForm("customCategory", "");
                          }}
                          className="mt-1 shrink-0 accent-[#0D6EFD] sm:mt-0"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="inline-flex max-w-full flex-wrap items-center gap-1.5">
                            <span className="min-w-0 break-words">{item.nama_kategori}</span>
                            <span className="group relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[11px] font-extrabold text-[#0D6EFD] ring-1 ring-sky-100 sm:mt-0" tabIndex={0} aria-label={`Informasi ${item.nama_kategori}`}>
                              ?
                              <span className="pointer-events-none absolute right-0 top-7 z-20 hidden w-[min(18rem,calc(100vw-4rem))] rounded-lg bg-[#12304f] px-3 py-2 text-left text-xs font-semibold leading-5 text-white shadow-xl group-hover:block group-focus:block sm:left-1/2 sm:right-auto sm:w-72 sm:-translate-x-1/2">
                                <span className="block font-extrabold">{item.nama_kategori}</span>
                                <span className="mt-1 block font-semibold text-white/85">{categoryInfo.text}</span>
                                <span className="mt-2 block font-normal text-white/75">{categoryInfo.example}</span>
                              </span>
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {formErrors.category ? <p className={errorText}>{formErrors.category}</p> : null}
              </div>

              {isCustomCategory(formData.categoryName) ? (
                <label className={normalLabel}>
                  Jelaskan Kategori
                  <input value={formData.customCategory} onChange={(event) => updateForm("customCategory", event.target.value)} className={`${inputClass("customCategory", inputHeight)} !font-normal`} placeholder="Jelaskan kategori gangguan anda" />
                  {formErrors.customCategory ? <p className={errorText}>{formErrors.customCategory}</p> : null}
                </label>
              ) : null}

              <label className={normalLabel}>
                Deskripsi Lengkap Gangguan
                <textarea value={formData.description} onChange={(event) => updateForm("description", event.target.value)} className={inputClass("description", "h-32 resize-none py-3")} placeholder="Masukkan deskripsi lengkap gangguan yang dialami" />
                {formErrors.description ? <p className={errorText}>{formErrors.description}</p> : null}
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className={normalLabel}>
                  Nomor Telepon
                  <input value={formData.phone} onChange={(event) => updateForm("phone", event.target.value)} className={inputClass("phone", inputHeight)} placeholder="Masukkan nomor telepon anda" />
                  {formErrors.phone ? <p className={errorText}>{formErrors.phone}</p> : null}
                </label>
                <label className={normalLabel}>
                  Tanggal Kejadian
                <input type="date" value={formData.date} onChange={(event) => updateForm("date", event.target.value)} max={new Date().toISOString().slice(0, 10)} className={inputClass("date", inputHeight)} />
                  {formErrors.date ? <p className={errorText}>{formErrors.date}</p> : null}
                </label>
              </div>
              <label className={normalLabel}>
                Lokasi Gangguan
                <input value={formData.location} onChange={(event) => updateForm("location", event.target.value)} className={inputClass("location", inputHeight)} placeholder="Masukkan lokasi anda" />
                {formErrors.location ? <p className={errorText}>{formErrors.location}</p> : null}
              </label>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-[420px]">
                <label className={`group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-dashed bg-gradient-to-br from-sky-50 to-white px-4 py-4 text-[#123b5a] shadow-sm transition-colors hover:border-sky-400 hover:bg-sky-100 hover:text-sky-700 ${
                  formErrors.photo ? "border-red-300 bg-red-50/40" : "border-sky-300"
                }`}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      event.target.value = "";

                      if (!file) {
                        updateForm("photoName", "");
                        updateForm("photoFile", null);
                        return;
                      }

                      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                      if (!validTypes.includes(file.type)) {
                        updateForm("photoName", "");
                        updateForm("photoFile", null);
                        setFormErrors((current) => ({ ...current, photo: "Format foto harus JPG, PNG, atau WEBP." }));
                        return;
                      }

                      if (file.size > 2 * 1024 * 1024) {
                        updateForm("photoName", "");
                        updateForm("photoFile", null);
                        setFormErrors((current) => ({ ...current, photo: "Ukuran foto maksimal 2MB." }));
                        return;
                      }

                      updateForm("photoName", file.name);
                      updateForm("photoFile", file);
                      setUploadProgress(0);
                    }}
                />
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm ring-1 ring-sky-100 transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-semibold">{formData.photoName ? "Foto dipilih" : "Upload Foto Gangguan"}</span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-slate-500">{formData.photoName || "Pilih gambar gangguan dari perangkat"}</span>
                </span>
              </label>
              {formErrors.photo ? <p className={errorText}>{formErrors.photo}</p> : null}
              </div>
              <button type="button" onClick={handleContinueReview} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#2563eb] px-10 py-3 font-bold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-colors hover:bg-[#1d4ed8] sm:w-auto">
                Lanjutkan
              </button>
            </div>
          </>
        ) : (
          <>
            <ReviewItem title="Kategori Gangguan" value={reviewCategory} />
            <ReviewItem title="Deskripsi Lengkap Gangguan" value={formData.description} />
            <ReviewItem title="Nomor Telepon" value={formData.phone} />
            <ReviewItem title="Lokasi Gangguan" value={formData.location} />
            <ReviewItem title="Tanggal Kejadian" value={formData.date} />
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Foto Gangguan</p>
              {photoPreviewUrl ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm">
                  <img src={photoPreviewUrl} alt="Preview foto gangguan" className="mx-auto max-h-[420px] max-w-full object-contain" />
                  <p className="truncate border-t border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">{formData.photoName}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm font-normal leading-6 text-slate-700">Belum ada foto yang dipilih</p>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 font-bold text-[#123b5a]">Opsi Privasi</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <label className="font-normal text-slate-700"><input type="radio" name="privasi" value="tidak_ada" checked={formData.privacy === "tidak_ada"} onChange={(event) => updateForm("privacy", event.target.value)} className="mr-2 accent-[#0D6EFD]" />Publik</label>
                <label className="font-normal text-slate-700"><input type="radio" name="privasi" value="anonim" checked={formData.privacy === "anonim"} onChange={(event) => updateForm("privacy", event.target.value)} className="mr-2 accent-[#0D6EFD]" />Anonim</label>
                <label className="font-normal text-slate-700"><input type="radio" name="privasi" value="rahasia" checked={formData.privacy === "rahasia"} onChange={(event) => updateForm("privacy", event.target.value)} className="mr-2 accent-[#0D6EFD]" />Rahasia</label>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(1)} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-8 py-3 font-bold text-[#123b5a] shadow-sm transition-colors hover:bg-slate-50 sm:w-auto">
                Kembali
              </button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#2563eb] px-10 py-3 font-bold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
                {submitting ? "Mengirim..." : "Kirim"}
              </button>
            </div>
            {submitting ? (
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                <div className="flex justify-between text-xs font-extrabold text-[#0D6EFD]">
                  <span>Mengunggah foto laporan</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#0D6EFD] transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
      {successPopupOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl shadow-slate-950/25">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m20 6-11 11-5-5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-[#12304f]">Laporan Terkirim</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Laporan gangguan anda berhasil dikirim dan menunggu validasi</p>
            {successPhotoUrl ? (
              <img src={successPhotoUrl} alt="Foto laporan terkirim" className="mx-auto mt-4 max-h-44 max-w-full rounded-lg border border-sky-100 object-contain" />
            ) : null}
            <button
              type="button"
              onClick={() => setSuccessPopupOpen(false)}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Mengerti
            </button>
          </div>
        </div>
      ) : null}
      </>
  );
}

function LatestReportsSection({
  reports,
  loadingReports = false,
  canViewMoreReports = false,
  loadingMoreReports = false,
  onReportClick,
  onViewMoreReports,
  onLikeReport,
  onCommentReport,
  onRequireLogin,
}) {
  const [isReportListBottom, setIsReportListBottom] = useState(false);
  const showViewMore = canViewMoreReports && isReportListBottom;

  const handleReportListScroll = (event) => {
    const target = event.currentTarget;
    const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setIsReportListBottom(distanceFromBottom <= 8);
  };

  const handleViewMore = async () => {
    setIsReportListBottom(false);
    await onViewMoreReports?.();
  };

  return (
    <section id="laporan-terbaru" className="bg-[#eef6ff] scroll-mt-24 px-5 pb-12 pt-8 sm:px-8 lg:px-16 lg:pb-16 lg:pt-10 xl:px-24 2xl:px-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#12304f] sm:text-2xl">Laporan Terbaru</h2>
          </div>
        </div>
        <div onScroll={handleReportListScroll} className="max-h-[760px] space-y-4 overflow-y-auto pr-1 sm:pr-2">
          {loadingReports ? (
            [0, 1, 2].map((item) => (
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
            ))
          ) : reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-sky-200 bg-white/80 px-5 py-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
              Belum ada laporan gangguan.
            </div>
          ) : reports.map((report) => (
            <LatestReportCard
              key={report.id}
              report={report}
              onClick={onReportClick}
              onLike={onLikeReport}
              onComment={onCommentReport}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>
        {showViewMore ? (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={handleViewMore}
              disabled={loadingMoreReports}
              className="text-sm font-extrabold text-[#0D6EFD] underline-offset-4 transition-colors hover:text-[#075bd8] hover:underline focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMoreReports ? "Memuat..." : "View More"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { HeroSection, LatestReportsSection, MainFeaturesSection, ReportCountBanner, ReportFlowPanel, ValuesSection };

export default function PelangganHome({
  reports,
  totalReports = 0,
  totalReportCount = 0,
  loadingReports = false,
  canViewMoreReports = false,
  loadingMoreReports = false,
  onReportCreated,
  onReportClick,
  onViewMoreReports,
  onLikeReport,
  onCommentReport,
  onRequireLogin,
  onNavigate,
}) {
  return (
    <>
      <HeroSection showActions onNavigate={onNavigate} />
      <ValuesSection />
      <section className="bg-[#eef6ff] px-5 py-12 sm:px-8 lg:py-14">
        <ComplaintForm onReportCreated={onReportCreated} />
      </section>
      <ReportFlowPanel />
      <ReportCountBanner total={totalReportCount} />
      <LatestReportsSection
        reports={reports}
        totalReports={totalReports}
        loadingReports={loadingReports}
        canViewMoreReports={canViewMoreReports}
        loadingMoreReports={loadingMoreReports}
        onReportClick={onReportClick}
        onViewMoreReports={onViewMoreReports}
        onLikeReport={onLikeReport}
        onCommentReport={onCommentReport}
        onRequireLogin={onRequireLogin}
      />
    </>
  );
}
