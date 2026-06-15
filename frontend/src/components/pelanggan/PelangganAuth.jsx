// Aplikasi Pelanggan - SIGAP
import { useEffect, useState } from "react";
import { getPelangganResetStatus, pelangganForgotPassword, resetApprovedPelangganPassword } from "../../services/api";

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

export function PelangganLoginModal({ onClose, onLogin, onRegister, onForgot }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin({ identifier, password });
    } catch (err) {
      setError(err.message || "Login pelanggan gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-2xl bg-white shadow-xl border border-gray-300">
        <div className="relative py-5 border-b border-gray-300 text-center">
          <h2 className="text-2xl font-bold">MASUK</h2>
          <button onClick={onClose} className="absolute right-3 top-3 w-6 h-6 border border-gray-400 text-gray-500 text-lg leading-none">x</button>
        </div>
        <form onSubmit={handleSubmit} className="px-20 py-8 space-y-5">
          {error && <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <label className="block text-sm font-semibold">
            Email, No. telp, atau username
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="mt-2 w-full h-11 border border-gray-400 px-3 font-normal" required />
          </label>
          <label className="block text-sm font-semibold">
            <span className="flex justify-between">Password <button type="button" onClick={onForgot} className="text-sky-500 font-normal">Lupa password?</button></span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full h-11 border border-gray-400 px-3 font-normal" required />
          </label>
          <button disabled={loading} className="w-full h-12 bg-[#12304f] text-white rounded-md font-bold disabled:opacity-60">{loading ? "MEMPROSES..." : "MASUK"}</button>
        </form>
        <div className="border-t border-gray-300 text-center py-5 text-sm">
          <p className="text-gray-500">Anda belum memiliki akun?</p>
          <button onClick={onRegister} className="text-sky-600 font-bold mt-1">DAFTAR SEKARANG</button>
        </div>
      </div>
    </div>
  );
}

const pelangganResetStatusText = {
  rejected: "Permintaan reset password ditolak. Anda dapat mengirim permintaan baru.",
  none: "Belum ada permintaan reset password aktif.",
};

export function PelangganForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [checkedEmail, setCheckedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("check");
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });

  const selectedEmail = checkedEmail || email.trim();
  const isApproved = statusData?.status === "approved" && statusData?.can_reset;
  const isPending = statusData?.status === "pending";
  const isRejected = statusData?.status === "rejected";

  const clearNotice = () => {
    setMessage("");
    setError("");
  };

  useEffect(() => {
    if (!message && !error) return undefined;

    const timeoutId = window.setTimeout(() => {
      clearNotice();
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [message, error]);

  const applyStatusResponse = (response, targetEmail) => {
    const data = response?.data || {};
    setCheckedEmail(targetEmail);
    setStatusData(data);

    if (data.status === "none") {
      setStep("request");
      setMessage(response.message || "Email ditemukan. Belum ada permintaan reset password aktif.");
      return;
    }

    setStep("status");
    setMessage((data.status === "approved" && data.can_reset) || data.status === "pending" ? "" : response.message || pelangganResetStatusText[data.status] || "Status permintaan reset password berhasil dicek.");
  };

  const handleCheckEmail = async (event) => {
    event.preventDefault();
    const targetEmail = email.trim();

    clearNotice();
    if (!targetEmail) {
      setError("Email pelanggan wajib diisi.");
      return;
    }

    setLoading("check");
    try {
      const response = await getPelangganResetStatus(targetEmail);
      applyStatusResponse(response, targetEmail);
    } catch (error) {
      setError(error.message || "Email pelanggan tidak ditemukan.");
    } finally {
      setLoading("");
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    const targetEmail = selectedEmail.trim();
    if (!targetEmail) return;

    setLoading("request");
    clearNotice();

    try {
      await pelangganForgotPassword(targetEmail);
      setCheckedEmail(targetEmail);
      setStatusData({ status: "pending", can_reset: false });
      setStep("status");
    } catch (error) {
      setError(error.message || "Gagal mengirim permintaan reset password.");
    } finally {
      setLoading("");
    }
  };

  const handleStatusCheck = async () => {
    const targetEmail = selectedEmail.trim();
    if (!targetEmail) return;

    setLoading("status");
    clearNotice();

    try {
      const response = await getPelangganResetStatus(targetEmail);
      applyStatusResponse(response, targetEmail);
    } catch (error) {
      setError(error.message || "Gagal mengecek status persetujuan.");
    } finally {
      setLoading("");
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    clearNotice();

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading("reset");
    try {
      await resetApprovedPelangganPassword({
        identifier: selectedEmail,
        new_password: newPassword,
      });
      setNewPassword("");
      setConfirmPassword("");
      onBack();
    } catch (error) {
      setError(error.message || "Password belum bisa diganti. Pastikan admin sudah menyetujui permintaan Anda.");
    } finally {
      setLoading("");
    }
  };

  const handleUseAnotherEmail = () => {
    setStep("check");
    setStatusData(null);
    setCheckedEmail("");
    setNewPassword("");
    setConfirmPassword("");
    clearNotice();
  };

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D6EFD] focus:bg-white focus:ring-4 focus:ring-sky-100";
  const passwordInputClass = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm font-semibold text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0D6EFD] focus:bg-white focus:ring-4 focus:ring-sky-100";
  const disabledInputClass = "mt-2 h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-500";
  const primaryButtonClass = "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#0D6EFD] px-6 text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(13,110,253,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#075bd8] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70";
  const secondaryButtonClass = "inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-sky-200 bg-white px-6 text-sm font-extrabold text-[#0D6EFD] transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041b5c] px-4 py-8 text-[#1f2a44] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#041b5c_0%,#0757d9_46%,#00a7c8_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:52px_52px]" />
      <div className="pointer-events-none absolute -left-28 top-[-90px] h-[360px] w-[760px] -rotate-12 bg-white/12 blur-[1px]" />
      <div className="pointer-events-none absolute right-[-160px] top-20 h-[210px] w-[720px] -rotate-12 bg-[#00d4ff]/18" />
      <div className="pointer-events-none absolute bottom-[-110px] left-[-90px] h-[260px] w-[720px] rotate-[-8deg] bg-[#022173]/35" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/18 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
        <section className="w-full max-w-[820px] rounded-2xl bg-white/95 px-6 py-10 shadow-[0_28px_80px_rgba(2,33,115,0.36)] ring-1 ring-white/80 backdrop-blur sm:px-10 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-[650px]">
            <h1 className="text-center text-3xl font-semibold text-[#22283a]">Lupa Password</h1>
            <p className="mt-3 text-center text-sm font-semibold leading-6 text-slate-500">
              Cek email pelanggan terlebih dahulu, lalu kirim permintaan reset dan pantau status persetujuan admin.
            </p>

            {(message || error) ? (
              <div className={`mt-6 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${
                message
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : "border-red-100 bg-red-50 text-red-700"
              }`}>
                {message || error}
              </div>
            ) : null}

            {step === "check" ? (
              <form onSubmit={handleCheckEmail} className="mt-7 space-y-5" noValidate>
                <label className="block text-sm font-extrabold text-[#12304f]">
                  Email Pelanggan
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearNotice();
                    }}
                    className={inputClass}
                    placeholder="Masukkan email pelanggan"
                    disabled={loading === "check"}
                  />
                </label>

                <button type="submit" disabled={loading === "check"} className={primaryButtonClass}>
                  {loading === "check" ? "Mengecek..." : "Cek Email"}
                </button>
              </form>
            ) : null}

            {step === "request" ? (
              <form onSubmit={handleRequestSubmit} className="mt-7 space-y-5" noValidate>
                <label className="block text-sm font-extrabold text-[#12304f]">
                  Email Pelanggan
                  <input value={selectedEmail} className={disabledInputClass} disabled readOnly />
                </label>

                <button type="submit" disabled={loading === "request"} className={primaryButtonClass}>
                  {loading === "request" ? "Mengirim..." : "Kirim Permintaan Reset"}
                </button>
                <button type="button" onClick={handleUseAnotherEmail} className={secondaryButtonClass}>
                  Gunakan Email Lain
                </button>
              </form>
            ) : null}

            {step === "status" ? (
              <div className="mt-7 space-y-5">
                <div className={`rounded-xl border px-4 py-4 text-sm font-semibold leading-6 ${
                  isApproved
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : isRejected
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                }`}>
                  {isApproved
                    ? "Permintaan disetujui. Silakan buat password baru."
                    : isPending
                      ? "Permintaan reset password masih menunggu persetujuan admin."
                      : message || pelangganResetStatusText[statusData?.status]}
                </div>

                {!isApproved ? (
                  <>
                    <button type="button" onClick={handleStatusCheck} disabled={loading === "status"} className={primaryButtonClass}>
                      {loading === "status" ? "Mengecek..." : "Cek Status Permintaan"}
                    </button>
                    {isRejected ? (
                      <button type="button" onClick={handleRequestSubmit} disabled={loading === "request"} className={secondaryButtonClass}>
                        {loading === "request" ? "Mengirim..." : "Kirim Permintaan Baru"}
                      </button>
                    ) : null}
                    <button type="button" onClick={handleUseAnotherEmail} className={secondaryButtonClass}>
                      Gunakan Email Lain
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-5" noValidate>
                    <label className="block text-sm font-extrabold text-[#12304f]">
                      Password Baru
                      <div className="relative mt-2">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            clearNotice();
                          }}
                          className={passwordInputClass}
                          placeholder="Minimal 8 karakter, huruf dan angka"
                          disabled={loading === "reset"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => ({ ...current, new: !current.new }))}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 transition-opacity hover:opacity-80"
                          aria-label={showPassword.new ? "Sembunyikan password baru" : "Tampilkan password baru"}
                        >
                          <EyeIcon open={showPassword.new} />
                        </button>
                      </div>
                    </label>

                    <label className="block text-sm font-extrabold text-[#12304f]">
                      Konfirmasi Password
                      <div className="relative mt-2">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            clearNotice();
                          }}
                          className={passwordInputClass}
                          placeholder="Ulangi password baru"
                          disabled={loading === "reset"}
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
                    </label>

                    <button type="submit" disabled={loading === "reset"} className={primaryButtonClass}>
                      {loading === "reset" ? "Menyimpan..." : "Simpan Password Baru"}
                    </button>
                  </form>
                )}
              </div>
            ) : null}

          </div>
        </section>
        <button
          type="button"
          onClick={onBack}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(2,33,115,0.22)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali Ke Halaman Login
        </button>
      </div>
    </main>
  );
}
