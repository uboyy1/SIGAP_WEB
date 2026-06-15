// Halaman Daftar Pelanggan - SIGAP
import { useState } from "react";
import PelangganAuthBrand from "../../components/pelanggan/PelangganAuthBrand";
import { pelangganTermsSections } from "../../constants/pelangganTermsContent";
import { pelangganRegister } from "../../services/api";
import {
  normalizeDigits,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from "../../utils/validation";

const EyeIcon = ({ open }) => (
  open ? (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
);

const initialForm = {
  no_langganan: "",
  nama_lengkap: "",
  jenis_kelamin: "",
  tanggal_lahir: "",
  alamat: "",
  no_telp: "",
  username: "",
  email: "",
  password: "",
  confirm_password: "",
};

const inputClass = "mt-2 h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 text-sm font-normal text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D6EFD] focus:bg-white focus:ring-4 focus:ring-sky-100";
const errorInputClass = "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100";

function Field({ label, children }) {
  return (
    <label className="block text-sm font-bold text-[#252b3f]">
      {label}
      {children}
    </label>
  );
}

const validateRegisterField = (field, value, form, { required = false } = {}) => {
  const text = String(value || "").trim();

  if (field === "no_langganan") {
    if (!text) return required ? "Nomor langganan wajib diisi." : "";
    return /^\d{6,10}$/.test(text) ? "" : "Nomor langganan harus 6-10 digit angka.";
  }
  if (field === "nama_lengkap") {
    if (!text) return required ? "Nama lengkap wajib diisi." : "";
    if (text.length < 2 || text.length > 100) return "Nama lengkap harus 2-100 karakter.";
  }
  if (field === "no_telp") return validatePhone(text, { required, label: "Nomor telepon" });
  if (field === "username" && text && !/^[a-zA-Z0-9._-]{3,50}$/.test(text)) return "Username harus 3-50 karakter dan hanya memakai huruf, angka, titik, garis bawah, atau tanda hubung.";
  if (field === "email") return validateEmail(text, { required });
  if (field === "password") return validatePassword(value, { required, label: "Kata sandi" });
  if (field === "confirm_password") return validatePasswordConfirmation(form.password, value, { required, label: "Konfirmasi kata sandi" });
  if (field === "alamat" && text.length > 500) return "Alamat maksimal 500 karakter.";
  return "";
};

function TermsModal({ sections, onAccept, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <section className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_28px_90px_rgba(2,33,115,0.38)] ring-1 ring-white/80">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-5 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-[#22283a]">Ketentuan Layanan SIGAP</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Syarat & Ketentuan Penggunaan SIGAP</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tutup syarat dan ketentuan"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-4 py-5 text-sm leading-relaxed text-slate-700 sm:px-6">
          {sections.map((section, index) => (
            <section key={section.title} className="mb-5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
              <h3 className="font-bold text-[#252b3f]">{index + 1}. {section.title}</h3>
              {section.paragraphs?.length ? (
                <div className="mt-2 space-y-2">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              ) : null}
              {section.groups?.map((group, groupIndex) => (
                <div key={`${section.title}-${groupIndex}`} className="mt-2">
                  {group.intro ? <p className="font-semibold text-[#252b3f]">{group.intro}</p> : null}
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {group.items.map((item, itemIndex) => <li key={`${groupIndex}-${itemIndex}-${item}`}>{item}</li>)}
                  </ul>
                </div>
              ))}
              {section.after?.length ? (
                <div className="mt-2 space-y-2">
                  {section.after.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onAccept}
            className="h-11 w-full rounded-lg bg-[#0D6EFD] text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(13,110,253,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#075bd8]"
          >
            Saya Mengerti
          </button>
        </footer>
      </section>
    </div>
  );
}

export default function PelangganRegister({ onBack, onRegistered }) {
  const [form, setForm] = useState(initialForm);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [termsError, setTermsError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => {
      const nextForm = { ...current, [field]: value };
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]: validateRegisterField(field, value, nextForm),
        ...(field === "password" && nextForm.confirm_password
          ? { confirm_password: validateRegisterField("confirm_password", nextForm.confirm_password, nextForm) }
          : {}),
      }));
      return nextForm;
    });
    if (error) setError("");
    if (termsError) setTermsError("");
  };
  const getInputClass = (field) => `${inputClass} ${fieldErrors[field] ? errorInputClass : ""}`;
  const renderFieldError = (field) => (
    fieldErrors[field] ? <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors[field]}</p> : null
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setTermsError("");

    const requiredFields = new Set(["no_langganan", "nama_lengkap", "no_telp", "email", "password", "confirm_password"]);
    const nextErrors = Object.fromEntries(
      Object.keys(form)
        .map((field) => [field, validateRegisterField(field, form[field], form, { required: requiredFields.has(field) })])
        .filter(([, message]) => message)
    );

    if (!acceptedTerms) {
      setTermsError("Anda perlu menyetujui syarat dan ketentuan layanan.");
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!acceptedTerms) return;

    setLoading(true);
    try {
      const payload = Object.fromEntries(Object.entries({
        no_langganan: form.no_langganan.trim(),
        nama_lengkap: form.nama_lengkap.trim(),
        jenis_kelamin: form.jenis_kelamin,
        tanggal_lahir: form.tanggal_lahir,
        alamat: form.alamat.trim(),
        no_telp: form.no_telp.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      }).filter(([, value]) => value !== ""));

      const response = await pelangganRegister(payload);
      await onRegistered?.({ identifier: payload.no_langganan, message: response?.message });
    } catch (err) {
      setError(err.message || "Registrasi gagal. Periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041b5c] px-4 py-8 text-[#1f2a44] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#041b5c_0%,#0757d9_46%,#00a7c8_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="pointer-events-none absolute -left-28 top-[-90px] h-[360px] w-[760px] -rotate-12 bg-white/12 blur-[1px]" />
      <div className="pointer-events-none absolute right-[-160px] top-20 h-[210px] w-[720px] -rotate-12 bg-[#00d4ff]/18" />
      <div className="pointer-events-none absolute bottom-[-110px] left-[-90px] h-[260px] w-[720px] rotate-[-8deg] bg-[#022173]/35" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/18 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_42%,rgba(255,255,255,0.13)_42%,rgba(255,255,255,0.13)_48%,transparent_48%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col items-center justify-center">
        <div className="mb-5">
          <PelangganAuthBrand compact />
        </div>

        <section className="w-full max-w-[900px] rounded-2xl bg-white/95 px-6 py-8 shadow-[0_28px_80px_rgba(2,33,115,0.36)] ring-1 ring-white/80 backdrop-blur sm:px-9 lg:px-11 lg:py-10">
          <div className="mx-auto w-full max-w-[760px]">
            <h1 className="text-center text-3xl font-semibold text-[#22283a]">Daftar</h1>
            <div className="mt-8 flex items-center gap-3 text-center text-sm font-medium text-[#22283a] sm:gap-4 sm:text-base">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="shrink-0">Buat akun anda</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                <Field label="Nomor Langganan PDAM*">
                  <input
                    className={getInputClass("no_langganan")}
                    value={form.no_langganan}
                    onChange={(event) => updateField("no_langganan", normalizeDigits(event.target.value, 10))}
                    placeholder="6-10 digit angka"
                    inputMode="numeric"
                    pattern="\d{6,10}"
                    minLength={6}
                    maxLength={10}
                    required
                  />
                  {renderFieldError("no_langganan")}
                </Field>

                <Field label="Nama Lengkap*">
                  <input className={getInputClass("nama_lengkap")} value={form.nama_lengkap} onChange={(event) => updateField("nama_lengkap", event.target.value)} placeholder="Masukkan nama lengkap" required />
                  {renderFieldError("nama_lengkap")}
                </Field>

                <Field label="Jenis Kelamin">
                  <select className={getInputClass("jenis_kelamin")} value={form.jenis_kelamin} onChange={(event) => updateField("jenis_kelamin", event.target.value)}>
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </Field>

                <Field label="Tanggal Lahir">
                  <input type="date" className={getInputClass("tanggal_lahir")} value={form.tanggal_lahir} onChange={(event) => updateField("tanggal_lahir", event.target.value)} />
                </Field>

                <Field label="No Telepon Aktif*">
                  <input
                    className={getInputClass("no_telp")}
                    value={form.no_telp}
                    onChange={(event) => updateField("no_telp", normalizeDigits(event.target.value, 13))}
                    placeholder="10-13 digit angka"
                    inputMode="numeric"
                    pattern="\d{10,13}"
                    minLength={10}
                    maxLength={13}
                    required
                  />
                  {renderFieldError("no_telp")}
                </Field>

                <Field label="Username">
                  <input className={getInputClass("username")} value={form.username} onChange={(event) => updateField("username", event.target.value)} placeholder="Masukkan username" maxLength={50} />
                  {renderFieldError("username")}
                </Field>

                <Field label="Email*">
                  <input type="email" className={getInputClass("email")} value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Masukkan email" required />
                  {renderFieldError("email")}
                </Field>

                <Field label="Alamat">
                  <input className={getInputClass("alamat")} value={form.alamat} onChange={(event) => updateField("alamat", event.target.value)} placeholder="Masukkan alamat" />
                  {renderFieldError("alamat")}
                </Field>

                <Field label="Kata Sandi*">
                  <div className="relative mt-2">
                    <input
                      type={showPassword.password ? "text" : "password"}
                      className={`${getInputClass("password").replace("mt-2 ", "")} pr-12`}
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      placeholder="Masukkan kata sandi"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => ({ ...current, password: !current.password }))}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity hover:opacity-80"
                      aria-label={showPassword.password ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      <EyeIcon open={showPassword.password} />
                    </button>
                  </div>
                  {renderFieldError("password")}
                  <p className="mt-2 text-xs font-normal leading-relaxed text-slate-500">Minimal 8 karakter dan memuat huruf serta angka.</p>
                </Field>

                <Field label="Konfirmasi Kata Sandi*">
                  <div className="relative mt-2">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      className={`${getInputClass("confirm_password").replace("mt-2 ", "")} pr-12`}
                      value={form.confirm_password}
                      onChange={(event) => updateField("confirm_password", event.target.value)}
                      placeholder="Ulangi kata sandi"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => ({ ...current, confirm: !current.confirm }))}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity hover:opacity-80"
                      aria-label={showPassword.confirm ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                    >
                      <EyeIcon open={showPassword.confirm} />
                    </button>
                  </div>
                  {renderFieldError("confirm_password")}
                </Field>
              </div>

              <label className="flex items-start gap-3 rounded-lg bg-sky-50 px-4 py-3 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    if (event.target.checked) setTermsError("");
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0D6EFD] focus:ring-[#0D6EFD]"
                  aria-invalid={Boolean(termsError)}
                />
                <span>
                  Saya telah membaca dan menyetujui{" "}
                  <button type="button" onClick={() => setShowTerms(true)} className="font-bold text-[#0D6EFD] hover:text-[#075bd8] hover:underline">
                    Syarat & Ketentuan Layanan
                  </button>
                  .
                </span>
              </label>
              {termsError ? <p className="-mt-3 text-xs font-semibold text-red-600">{termsError}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-[#0D6EFD] text-base font-extrabold text-white shadow-[0_16px_34px_rgba(13,110,253,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Daftar"}
              </button>
            </form>
          </div>
        </section>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-2.5 text-center text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(2,33,115,0.22)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali Ke Halaman Depan
        </button>
      </div>
      {showTerms ? (
        <TermsModal
          sections={pelangganTermsSections}
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setAcceptedTerms(true);
            setShowTerms(false);
          }}
        />
      ) : null}
    </main>
  );
}
