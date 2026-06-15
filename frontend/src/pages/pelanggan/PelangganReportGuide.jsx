// Aplikasi Pelanggan - SIGAP: Halaman panduan cara pelaporan gangguan.

const guideSteps = [
  {
    title: "Masuk ke akun pelanggan",
    text: "Gunakan nomor langganan dan password pelanggan agar laporan tersimpan pada akun yang benar.",
  },
  {
    title: "Pilih kategori gangguan",
    text: "Tentukan jenis gangguan air yang dialami. Jika tidak tersedia, pilih Lainnya dan jelaskan kategori gangguan.",
  },
  {
    title: "Lengkapi detail laporan",
    text: "Isi deskripsi, nomor telepon, tanggal kejadian, lokasi gangguan, dan unggah foto kondisi gangguan.",
  },
  {
    title: "Tinjau lalu kirim",
    text: "Periksa ulang data laporan pada halaman tinjauan sebelum dikirim ke petugas untuk divalidasi.",
  },
  {
    title: "Pantau status laporan",
    text: "Cek notifikasi dan Laporan Terbaru untuk melihat proses validasi, penanganan, sampai laporan selesai.",
  },
];

const requiredItems = [
  "Nomor telepon aktif",
  "Tanggal kejadian gangguan",
  "Lokasi gangguan yang jelas",
  "Deskripsi lengkap kondisi gangguan",
  "Foto bukti gangguan",
];

function GuideIcon({ type = "check" }) {
  const props = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "file") {
    return (
      <svg {...props}>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h5" />
        <path d="m9 15 2 2 4-5" />
      </svg>
    );
  }

  if (type === "bell") {
    return (
      <svg {...props}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

export default function PelangganReportGuide({ onNavigate }) {
  return (
    <main className="bg-[#eef6ff] px-5 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-24">
      <div className="mx-auto max-w-[1120px] space-y-6">
        <section className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_18px_48px_rgba(15,58,125,0.08)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight text-[#12304f] sm:text-4xl">
                Cara Pelaporan Gangguan Air
              </h1>
              <p className="mt-4 max-w-3xl text-sm font-normal leading-7 text-slate-600 sm:text-base">
                Ikuti langkah berikut agar laporan gangguan masuk dengan data yang lengkap dan mudah divalidasi oleh petugas PDAM.
              </p>
              <button
                type="button"
                onClick={() => onNavigate?.("create-report")}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-colors hover:bg-[#1d4ed8]"
              >
                Buat Laporan Sekarang
              </button>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-sm font-extrabold text-[#12304f]">Data yang wajib disiapkan</p>
              <div className="mt-4 grid gap-3">
                {requiredItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <GuideIcon />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {guideSteps.map((step, index) => (
            <article key={step.title} className="rounded-xl border border-sky-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,58,125,0.06)] sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0D6EFD] text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-[#12304f]">{step.title}</h2>
                  <p className="mt-2 text-sm font-normal leading-6 text-slate-600">{step.text}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl bg-[#12304f] p-6 text-white shadow-[0_18px_48px_rgba(18,48,79,0.16)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-extrabold">
                <GuideIcon type="bell" />
                Setelah laporan dikirim
              </div>
              <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-white/80">
                Laporan akan menunggu validasi petugas. Perubahan status akan tampil di notifikasi dan halaman laporan pelanggan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("notifications")}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-5 text-sm font-extrabold text-[#12304f] transition-transform hover:-translate-y-0.5"
            >
              Cek Notifikasi
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
