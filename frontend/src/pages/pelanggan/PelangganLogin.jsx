// Halaman Login Pelanggan - SIGAP
import { useState } from "react";
import { normalizeDigits } from "../../utils/validation";

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

export default function PelangganLogin({ onBack, onForgot, onLogin, onRegister, successMessage = "", initialIdentifier = "" }) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    if (field === "identifier") setIdentifier(normalizeDigits(value, 10));
    if (field === "password") setPassword(value);
    setError("");
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const nextErrors = {};
    if (!identifier.trim()) {
      nextErrors.identifier = "Nomor langganan wajib diisi.";
    } else if (!/^\d{6,10}$/.test(identifier.trim())) {
      nextErrors.identifier = "Nomor langganan harus 6-10 digit angka.";
    }
    if (!password) nextErrors.password = "Kata sandi wajib diisi.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      await onLogin({ identifier: identifier.trim(), password });
    } catch (err) {
      setFieldErrors({});
      setError(err.status === 401 || err.status === 400
        ? "Nomor langganan atau kata sandi tidak sesuai."
        : err.message || "Login pelanggan gagal. Silakan coba lagi.");
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
        <section className="w-full max-w-[780px] rounded-2xl bg-white/95 px-6 py-10 shadow-[0_28px_80px_rgba(2,33,115,0.36)] ring-1 ring-white/80 backdrop-blur sm:px-10 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-[650px]">
            <h1 className="text-center text-3xl font-semibold text-[#22283a]">Masuk</h1>

            <div className="mt-8 flex items-center gap-3 text-center text-xs font-medium text-[#22283a] sm:gap-4 sm:text-base">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="shrink-0">Masuk Dengan No Langganan PDAM</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {successMessage ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <label className="block text-sm font-normal text-[#252b3f] sm:text-base">
                <span>No Langganan PDAM</span>
                <input
                  value={identifier}
                  onChange={(event) => updateField("identifier", event.target.value)}
                  className={`mt-2 h-12 w-full rounded-lg border bg-slate-50 px-4 text-base font-normal text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                    fieldErrors.identifier ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-[#0D6EFD] focus:ring-sky-100"
                  }`}
                  placeholder="Masukkan no langganan PDAM"
                  inputMode="numeric"
                  pattern="\d{6,10}"
                  minLength={6}
                  maxLength={10}
                  aria-invalid={Boolean(fieldErrors.identifier)}
                  required
                />
                {fieldErrors.identifier ? <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.identifier}</p> : null}
              </label>

              <label className="block text-sm font-normal text-[#252b3f] sm:text-base">
                <span>Kata Sandi</span>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className={`h-12 w-full rounded-lg border bg-slate-50 px-4 pr-12 text-base font-normal text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                      fieldErrors.password ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-[#0D6EFD] focus:ring-sky-100"
                    }`}
                    placeholder="Masukkan kata sandi"
                    aria-invalid={Boolean(fieldErrors.password)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity hover:opacity-80"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password ? <p className="mt-1.5 text-sm font-semibold text-red-600">{fieldErrors.password}</p> : null}
              </label>

              <button type="button" onClick={onForgot} className="text-sm font-bold text-[#0D6EFD] transition-colors hover:text-[#075bd8] hover:underline sm:text-base">
                Lupa Password?
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-[#0D6EFD] text-base font-extrabold text-white shadow-[0_16px_34px_rgba(13,110,253,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm font-semibold text-slate-500 sm:text-base">
              Anda belum memiliki akun?{" "}
              <button type="button" onClick={onRegister} className="font-extrabold text-[#0D6EFD] transition-colors hover:text-[#075bd8] hover:underline">
                Daftar sekarang
              </button>
            </p>
          </div>
        </section>
        <button
          type="button"
          onClick={onBack}
          className="mt-7 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-2.5 text-center text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(2,33,115,0.22)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali Ke Halaman Depan
        </button>
      </div>
    </main>
  );
}
