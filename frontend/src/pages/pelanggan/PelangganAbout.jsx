// Aplikasi Pelanggan - SIGAP: Halaman Tentang SIGAP.
import { useEffect, useState } from "react";
import { getPelangganAboutContent } from "../../services/api";

function CheckIcon() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0D6EFD] text-white">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

function BenefitIcon({ title }) {
  const iconProps = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (title === "Pelaporan Lebih Cepat") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-[#0D6EFD]">
        <svg {...iconProps}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      </span>
    );
  }

  if (title === "Status Lebih Transparan") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <svg {...iconProps}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <svg {...iconProps}>
        <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z" />
        <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
        <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" />
      </svg>
    </span>
  );
}

export default function PelangganAbout() {
  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadContent = async () => {
      try {
        const response = await getPelangganAboutContent();
        if (!ignore) setContent(response?.data || null);
      } catch (error) {
        if (!ignore) setLoadError(error.message || "Gagal memuat informasi SIGAP.");
      }
    };

    loadContent();

    return () => {
      ignore = true;
    };
  }, []);

  if (loadError) {
    return (
      <main className="bg-[#eef6ff] px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-100 bg-white p-6 text-sm font-semibold text-red-700 shadow-sm">
          {loadError}
        </div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="bg-[#eef6ff] px-5 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-sky-100 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
          Memuat informasi SIGAP...
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#eef6ff] px-5 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-24">
        <div className="mx-auto max-w-[1180px] space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold leading-tight text-[#12304f] sm:text-4xl">{content.title}</h1>
          </div>

          <section className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_18px_48px_rgba(15,58,125,0.08)] ring-1 ring-white">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-[#0D6EFD]">{content.eyebrow}</p>
                <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#12304f] sm:text-4xl">{content.headline}</h1>
                <p className="mt-5 text-sm font-normal leading-7 text-slate-600 sm:text-base">
                  {content.description}
                </p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-5">
                <p className="text-sm font-extrabold text-[#12304f]">Fokus layanan</p>
                <div className="mt-4 grid gap-3">
                  {content.focusItems.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
                      <CheckIcon />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {content.benefits.map((item) => (
              <article key={item.title} className="rounded-xl border border-sky-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,58,125,0.07)] transition-transform hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <BenefitIcon title={item.title} />
                  <h2 className="text-base font-extrabold leading-6 text-[#12304f]">{item.title}</h2>
                </div>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </section>

          <section className="rounded-xl border border-sky-100 bg-white p-6 shadow-[0_18px_48px_rgba(15,58,125,0.08)] sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[#12304f]">Cara Kerja SIGAP</h2>
              <p className="mt-2 text-sm font-normal leading-6 text-slate-600">Setiap laporan melewati alur yang jelas agar pelanggan dapat mengetahui posisi laporan yang sedang diproses.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {content.steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-sm font-extrabold text-white">{index + 1}</span>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-[#12304f] p-6 text-white shadow-[0_18px_48px_rgba(18,48,79,0.18)] sm:p-8">
            <h2 className="text-xl font-extrabold">Komitmen Layanan</h2>
            <p className="mt-3 max-w-3xl text-sm font-normal leading-7 text-white/82">
              {content.commitment}
            </p>
          </section>
        </div>
      </main>
  );
}
