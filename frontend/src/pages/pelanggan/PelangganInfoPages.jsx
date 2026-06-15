// Aplikasi Pelanggan - SIGAP: Halaman informasi pelanggan.
import { useState } from "react";
export { default as PelangganAbout } from "./PelangganAbout";
import { pelangganTermsSections } from "../../constants/pelangganTermsContent";

function TermsIcon({ type = "document" }) {
  const iconProps = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "shield") {
    return (
      <svg {...iconProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-5" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg {...iconProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function CheckMark() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

function ContactIcon({ type = "message" }) {
  const iconProps = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "phone") {
    return (
      <svg {...iconProps}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.05 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (type === "location") {
    return (
      <svg {...iconProps}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (type === "file") {
    return (
      <svg {...iconProps}>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h5" />
        <path d="M9 15h6" />
        <path d="M9 11h3" />
      </svg>
    );
  }

  if (type === "send") {
    return (
      <svg {...iconProps}>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

const initialContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function PelangganTerms({ onNavigate }) {
  const handleContactClick = () => {
    onNavigate?.("contact");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  return (
    <main id="top" className="bg-[#eef6ff] px-5 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-24">
      <div className="mx-auto max-w-[1120px] space-y-6">
        <section className="overflow-hidden rounded-xl border border-sky-100 bg-white shadow-[0_18px_48px_rgba(15,58,125,0.08)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight text-[#12304f] sm:text-4xl">
                Ketentuan Layanan SIGAP
              </h1>
              <p className="mt-4 max-w-3xl text-sm font-normal leading-7 text-slate-600 sm:text-base">
                Ketentuan ini menjadi panduan penggunaan SIGAP agar proses pelaporan gangguan air berjalan tertib, aman, dan dapat dipertanggungjawabkan.
              </p>
            </div>

            <div className="grid gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
              <div className="flex items-start gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D6EFD] text-white">
                  <TermsIcon type="shield" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#12304f]">Data Terlindungi</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">Informasi pelanggan digunakan untuk kebutuhan layanan PDAM.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <TermsIcon type="users" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#12304f]">Pengguna Bertanggung Jawab</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">Laporan harus dibuat dengan data yang benar dan relevan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="grid gap-4">
            {pelangganTermsSections.map((section, index) => (
              <article
                id={`terms-${index + 1}`}
                key={section.title}
                className="scroll-mt-24 rounded-xl border border-sky-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,58,125,0.06)] sm:p-6 lg:p-7"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#12304f] text-base font-extrabold text-white shadow-[0_10px_24px_rgba(18,48,79,0.18)]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-extrabold leading-7 text-[#12304f]">{section.title}</h2>
                    {section.paragraphs?.length ? (
                      <div className="mt-4 space-y-3 text-[15px] font-normal leading-7 text-slate-600">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                    {section.groups?.map((group, groupIndex) => (
                      <div key={`${section.title}-${groupIndex}`} className="mt-4">
                        {group.intro ? (
                          <p className="text-[15px] font-extrabold leading-7 text-[#12304f]">{group.intro}</p>
                        ) : null}
                        <ul className={`${group.intro ? "mt-3" : ""} grid gap-3`}>
                          {group.items.map((item, itemIndex) => (
                            <li key={`${groupIndex}-${itemIndex}-${item}`} className="flex gap-3 text-[15px] font-normal leading-7 text-slate-600">
                              <CheckMark />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {section.after?.length ? (
                      <div className="mt-4 space-y-3 text-[15px] font-normal leading-7 text-slate-600">
                        {section.after.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-[#12304f] p-6 text-white shadow-[0_18px_48px_rgba(18,48,79,0.16)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Butuh bantuan terkait ketentuan?</h2>
              <p className="mt-2 text-sm font-normal leading-6 text-white/80">
                Hubungi petugas layanan bila ada bagian syarat penggunaan yang perlu dijelaskan sebelum menggunakan SIGAP.
              </p>
            </div>
            <button
              type="button"
              onClick={handleContactClick}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-5 text-sm font-extrabold text-[#12304f] transition-transform hover:-translate-y-0.5"
            >
              Hubungi Kami
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export function PelangganContact() {
  const [form, setForm] = useState(initialContactForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus("");
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) nextErrors.email = "Email wajib diisi.";
    if (!form.subject.trim()) nextErrors.subject = "Subjek wajib diisi.";
    if (!form.message.trim()) nextErrors.message = "Pesan wajib diisi.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setStatus("Pesan berhasil disiapkan. Petugas akan meninjau informasi yang anda kirim.");
    setForm(initialContactForm);
  };

  const inputClass = (field) => `mt-2 h-11 w-full rounded-lg border bg-white px-3.5 text-sm font-normal text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D6EFD] focus:ring-4 focus:ring-sky-100 ${
    errors[field] ? "border-red-300 bg-red-50/40" : "border-slate-200"
  }`;

  const textAreaClass = `mt-2 h-48 w-full resize-none rounded-lg border bg-white px-3.5 py-3 text-sm font-normal text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D6EFD] focus:ring-4 focus:ring-sky-100 ${
    errors.message ? "border-red-300 bg-red-50/40" : "border-slate-200"
  }`;

  return (
    <main className="bg-[#eef6ff] px-5 py-10 sm:px-8 lg:px-16 lg:py-14 xl:px-24">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_24px_70px_rgba(15,58,125,0.14)] ring-1 ring-white/80">
        <div className="bg-[#2563eb] px-6 py-7 text-left text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.22)] sm:px-8">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Hubungi Kami</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-white/85 sm:text-base">
            Kirim pertanyaan, kendala, atau pesan kepada layanan SIGAP melalui form berikut.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8">
          {status ? (
            <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-700">
              {status}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
            <label className="block text-sm font-normal text-[#12304f]">
              Nama Lengkap
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className={inputClass("name")}
                placeholder="Masukkan nama"
              />
              {errors.name ? <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.name}</p> : null}
            </label>

            <label className="block text-sm font-normal text-[#12304f]">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className={inputClass("email")}
                placeholder="Masukkan email"
              />
              {errors.email ? <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.email}</p> : null}
            </label>

            <label className="block text-sm font-normal text-[#12304f]">
              Subjek
              <input
                value={form.subject}
                onChange={(event) => updateForm("subject", event.target.value)}
                className={inputClass("subject")}
                placeholder="Masukkan subjek"
              />
              {errors.subject ? <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.subject}</p> : null}
            </label>

            <label className="block text-sm font-normal text-[#12304f]">
              Pesan
              <textarea
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                className={textAreaClass}
                placeholder="Masukkan pesan"
              />
              {errors.message ? <p className="mt-1.5 text-xs font-semibold text-red-600">{errors.message}</p> : null}
            </label>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-10 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(37,99,235,0.24)] transition-colors hover:bg-[#1d4ed8]"
            >
              <ContactIcon type="send" />
              Kirim
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
