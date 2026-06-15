// Fungsi: Halaman publik aplikasi SIGAP.
// frontend/src/pages/ForgotPassword.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { forgotPassword, getResetPasswordStatus, resetApprovedPassword } from '../services/api';
import logoSigap from '../assets/logo_sigap.png';

const getLoginPath = (pathname) => {
  const currentPath = pathname.toLowerCase();
  if (currentPath.startsWith('/admin')) return '/login/admin';
  if (currentPath.startsWith('/kepala-teknisi') || currentPath.startsWith('/kepala_teknisi')) return '/login/kepala-teknisi';
  return '/';
};

const getPageCopy = (pathname) => {
  const currentPath = pathname.toLowerCase();
  if (currentPath.startsWith('/admin')) {
    return {
      title: 'Reset Password Admin',
      description: 'Cek email admin terlebih dahulu sebelum mengajukan reset password.',
    };
  }

  if (currentPath.startsWith('/kepala-teknisi') || currentPath.startsWith('/kepala_teknisi')) {
    return {
      title: 'Reset Password Kepala Teknisi',
      description: 'Cek email kepala teknisi terlebih dahulu sebelum mengajukan reset password.',
    };
  }

  return {
    title: 'Reset Password',
    description: 'Cek email akun terlebih dahulu sebelum mengajukan reset password.',
  };
};

const statusText = {
  rejected: 'Permintaan reset password ditolak. Anda dapat mengirim permintaan baru.',
  none: 'Belum ada permintaan reset password aktif.',
};

export default function ForgotPassword() {
  const location = useLocation();
  const loginPath = getLoginPath(location.pathname);
  const pageCopy = getPageCopy(location.pathname);
  const [email, setEmail] = useState('');
  const [checkedEmail, setCheckedEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('check');
  const [statusData, setStatusData] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedEmail = checkedEmail || email.trim();
  const isApproved = statusData?.status === 'approved' && statusData?.can_reset;
  const isPending = statusData?.status === 'pending';
  const isRejected = statusData?.status === 'rejected';

  const clearNotice = () => {
    setMessage('');
    setError('');
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

    if (data.status === 'none') {
      setStep('request');
      setMessage(response.message || 'Email ditemukan. Belum ada permintaan reset password aktif.');
      return;
    }

    setStep('status');
    setMessage((data.status === 'approved' && data.can_reset) || data.status === 'pending' ? '' : response.message || statusText[data.status] || 'Status permintaan reset password berhasil dicek.');
  };

  const handleCheckEmail = async (event) => {
    event.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) return;

    setCheckLoading(true);
    clearNotice();

    try {
      const response = await getResetPasswordStatus({ email: targetEmail });
      applyStatusResponse(response, targetEmail);
    } catch (err) {
      setError(err.message || 'Email tidak ditemukan.');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    const targetEmail = selectedEmail.trim();
    if (!targetEmail) return;

    setRequestLoading(true);
    clearNotice();

    try {
      await forgotPassword({ email: targetEmail });
      setCheckedEmail(targetEmail);
      setStatusData({ status: 'pending', can_reset: false });
      setStep('status');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Gagal mengirim permintaan reset password.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleStatusCheck = async () => {
    const targetEmail = selectedEmail.trim();
    if (!targetEmail) return;

    setStatusLoading(true);
    clearNotice();

    try {
      const response = await getResetPasswordStatus({ email: targetEmail });
      applyStatusResponse(response, targetEmail);
    } catch (err) {
      setError(err.message || 'Gagal mengecek status persetujuan.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    clearNotice();

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      setResetLoading(false);
      return;
    }

    try {
      const response = await resetApprovedPassword({
        email: selectedEmail,
        new_password: newPassword,
      });
      setMessage(response.message || 'Password berhasil diganti.');
      setNewPassword('');
      setConfirmPassword('');
      setStep('completed');
    } catch (err) {
      setError(err.message || 'Password belum bisa diganti. Pastikan admin sudah menyetujui permintaan Anda.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleUseAnotherEmail = () => {
    setStep('check');
    setStatusData(null);
    setCheckedEmail('');
    setNewPassword('');
    setConfirmPassword('');
    clearNotice();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl animate-pulse delay-1000" />
        <div className="absolute left-1/2 top-60 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-50 blur-xl" />
                <img loading="lazy" decoding="async" src={logoSigap} alt="SIGAP" className="relative z-10 h-20 w-20 object-contain" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">{pageCopy.title}</h2>
            <p className="text-sm text-white/60">{pageCopy.description}</p>
          </div>

          {(message || error) && (
            <div className={`mx-auto mb-5 max-w-2xl rounded-lg border p-3 text-center text-sm ${
              message
                ? 'border-green-400/40 bg-green-500/20 text-green-100'
                : 'border-red-500/50 bg-red-500/20 text-red-200'
            }`}>
              {message || error}
            </div>
          )}

          <div className="mx-auto max-w-2xl">
            {step === 'check' && (
              <form onSubmit={handleCheckEmail} className="relative rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white">Cek Email</h3>
                <p className="mt-1 text-sm text-white/60">Masukkan email akun yang terdaftar untuk melihat status reset password.</p>

                <div className="mt-6 space-y-2">
                  <label className="block text-left text-sm font-medium text-white/80">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-left text-white placeholder-white/40 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="contoh@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkLoading}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {checkLoading ? 'Mengecek...' : 'Cek Email'}
                </button>
              </form>
            )}

            {step === 'request' && (
              <form onSubmit={handleRequestSubmit} className="relative rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white">Ajukan Permintaan Reset</h3>
                <p className="mt-1 text-sm text-white/60">Email sudah terdaftar dan belum memiliki permintaan reset password aktif.</p>

                <div className="mt-6 space-y-2">
                  <label className="block text-left text-sm font-medium text-white/80">Email</label>
                  <input
                    type="email"
                    value={selectedEmail}
                    className="w-full cursor-not-allowed rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-white/70"
                    disabled
                    readOnly
                  />
                </div>

                <button
                  type="submit"
                  disabled={requestLoading}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  {requestLoading ? 'Mengirim...' : 'Kirim Permintaan'}
                </button>

                <button
                  type="button"
                  onClick={handleUseAnotherEmail}
                  className="mt-3 w-full rounded-xl border border-white/15 py-3 font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Gunakan Email Lain
                </button>
              </form>
            )}

            {step === 'status' && (
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white">{isApproved ? 'Ubah Password' : 'Status Permintaan'}</h3>
                <p className="mt-1 text-sm text-white/60">Email: {selectedEmail}</p>

                {!isApproved ? (
                  <>
                    {!isPending ? (
                      <div className={`mt-6 rounded-xl border p-4 text-sm ${
                        isRejected
                          ? 'border-red-400/40 bg-red-500/15 text-red-100'
                          : 'border-amber-400/40 bg-amber-500/15 text-amber-100'
                      }`}>
                        {message || statusText[statusData?.status]}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleStatusCheck}
                      disabled={statusLoading}
                      className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      {statusLoading ? 'Mengecek...' : 'Cek Status Lagi'}
                    </button>

                    {isRejected ? (
                      <button
                        type="button"
                        onClick={handleRequestSubmit}
                        disabled={requestLoading}
                        className="mt-3 w-full rounded-xl border border-white/15 py-3 font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                      >
                        {requestLoading ? 'Mengirim...' : 'Kirim Permintaan Baru'}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleUseAnotherEmail}
                      className="mt-3 w-full rounded-xl border border-white/15 py-3 font-semibold text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      Gunakan Email Lain
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleResetSubmit} className="mt-6">
                    <div className="space-y-2">
                      <label className="block text-left text-sm font-medium text-white/80">Password Baru</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-left text-white placeholder-white/40 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Minimal 8 karakter, huruf dan angka"
                        minLength={8}
                        required
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="block text-left text-sm font-medium text-white/80">Konfirmasi Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-left text-white placeholder-white/40 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Ulangi password baru"
                        minLength={8}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                      {resetLoading ? 'Memproses...' : 'Simpan Password Baru'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {step === 'completed' && (
              <div className="relative rounded-2xl border border-green-400/30 bg-green-500/10 p-7 text-center shadow-2xl backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white">Password Berhasil Diganti</h3>
                <p className="mt-2 text-sm text-white/60">Silakan masuk kembali menggunakan password baru.</p>
                <Link
                  to={loginPath}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Ke Halaman Masuk
                </Link>
              </div>
            )}
          </div>

          <div className="mt-7 text-center">
            <Link
              to={loginPath}
              className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/10 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_16px_40px_rgba(2,33,115,0.22)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Kembali Ke Halaman Login
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-white/30">
            PDAM TIRTA KARAJAE KOTA PAREPARE
          </p>
        </div>
      </div>
    </div>
  );
}
