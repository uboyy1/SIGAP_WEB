// Fungsi: Halaman publik aplikasi SIGAP.
// frontend/src/pages/LoginScreen.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoSigap from "../assets/logo_sigap.png";
import { validateEmail, validateRequired } from "../utils/validation";

const getForgotPasswordPath = (pathname) => {
  const currentPath = pathname.toLowerCase();
  if (currentPath.startsWith('/admin') || currentPath.startsWith('/login/admin')) return '/admin/forgot-password';
  if (currentPath.startsWith('/kepala-teknisi') || currentPath.startsWith('/kepala_teknisi') || currentPath.startsWith('/login/kepala-teknisi') || currentPath.startsWith('/login/kepala_teknisi')) {
    return '/kepala-teknisi/forgot-password';
  }
  return '/forgot-password';
};

const getLoginTargetByPathname = (pathname) => {
  const currentPath = pathname.toLowerCase();

  if (currentPath.startsWith('/admin') || currentPath.startsWith('/login/admin')) {
    return {
      role: 'admin',
      title: 'Masuk Admin',
      subtitle: 'Gunakan akun admin untuk mengelola sistem SIGAP',
      mismatch: 'Akun ini bukan admin. Gunakan link login yang sesuai dengan peran akun.',
    };
  }

  if (currentPath.startsWith('/kepala-teknisi') || currentPath.startsWith('/kepala_teknisi') || currentPath.startsWith('/login/kepala-teknisi') || currentPath.startsWith('/login/kepala_teknisi')) {
    return {
      role: 'kepala_teknisi',
      title: 'Masuk Kepala Teknisi',
      subtitle: 'Gunakan akun kepala teknisi untuk memantau dan memvalidasi laporan',
      mismatch: 'Akun ini bukan kepala teknisi. Gunakan link login yang sesuai dengan peran akun.',
    };
  }

  return {
    role: null,
    title: 'Masuk Admin / Kepala Teknisi',
    subtitle: 'Halaman login web hanya untuk admin dan kepala teknisi',
    mismatch: 'Halaman login web hanya untuk admin dan kepala teknisi.',
  };
};

const getDefaultPathByRole = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'kepala_teknisi') return '/kepala-teknisi/dashboard';
  return '/';
};

const EyeIcon = ({ open }) => (
  open ? (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
);

const particles = Array.from({ length: 20 }, (_, index) => {
  const seed = index + 1;
  return {
    left: `${(seed * 37) % 100}%`,
    top: `${(seed * 53) % 100}%`,
    animationDelay: `${(seed * 0.25) % 5}s`,
    animationDuration: `${3 + ((seed * 0.35) % 4)}s`,
  };
});

function SuccessDialog({ open, title, message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <section className="w-full max-w-sm rounded-2xl bg-white px-6 py-7 text-center text-slate-700 shadow-2xl shadow-black/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m20 6-11 11-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-gray-900">{title}</h2>
        {message ? <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{message}</p> : null}
      </section>
    </div>
  );
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successDialog, setSuccessDialog] = useState({ open: false, title: "", message: "" });
  
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginTarget = getLoginTargetByPathname(location.pathname);

  const updateField = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    setError("");
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const nextErrors = {};
    const emailError = validateEmail(email, { required: true });
    const passwordError = validateRequired(password, "Kata sandi");
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await login(email, password);
      const role = res.data.user.role;

      if (role === 'teknisi') {
        await logout();
        setError('Akun teknisi digunakan melalui aplikasi mobile, bukan halaman web.');
        return;
      }

      if (!['admin', 'kepala_teknisi'].includes(role)) {
        await logout();
        setError('Halaman login web hanya untuk admin dan kepala teknisi.');
        return;
      }

      if (loginTarget.role && role !== loginTarget.role) {
        await logout();
        setError(loginTarget.mismatch);
        return;
      }

      setSuccessDialog({
        open: true,
        title: "Anda berhasil masuk",
        message: "Selamat datang kembali di SIGAP.",
      });
      window.setTimeout(() => navigate(getDefaultPathByRole(role), { replace: true }), 900);
    } catch (err) {
      setFieldErrors({});
      setError(err.status === 401 || err.status === 400
        ? "Email atau kata sandi tidak sesuai."
        : err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-60 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((style, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={style}
          />
        ))}
      </div>

      <SuccessDialog
        open={successDialog.open}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Login Card */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="w-full max-w-md">
          <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl shadow-2xl border border-white/10 p-8">
            {/* Logo section */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50" />
                  <img loading="lazy" decoding="async"
                    src={logoSigap}
                    alt="SIGAP"
                    className="w-20 h-20 object-contain relative z-10"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{loginTarget.title}</h2>
              <p className="text-white/60 text-sm">{loginTarget.subtitle}</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80 text-left">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-left ${
                    fieldErrors.email ? 'border-red-400 focus:ring-red-300' : 'border-white/20 focus:ring-blue-400'
                  }`}
                  placeholder="Masukkan Email Anda"
                  aria-invalid={Boolean(fieldErrors.email)}
                  required
                />
                {fieldErrors.email ? <p className="text-sm font-semibold text-red-200">{fieldErrors.email}</p> : null}
              </div>

              {/* Password field with show/hide toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80 text-left">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full px-4 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-left ${
                      fieldErrors.password ? 'border-red-400 focus:ring-red-300' : 'border-white/20 focus:ring-blue-400'
                    }`}
                    placeholder="Masukkan Password Anda"
                    aria-invalid={Boolean(fieldErrors.password)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-80 transition-opacity"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password ? <p className="text-sm font-semibold text-red-200">{fieldErrors.password}</p> : null}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "MASUK"
                )}
              </button>

              {/* Forgot password link */}
              <div className="text-center mt-4">
                <Link
                  to={getForgotPasswordPath(location.pathname)}
                  className="text-sm text-white/50 hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  Lupa kata sandi?
                </Link>
              </div>
            </form>

            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl" />
          </div>

          {/* Footer text */}
          <p className="text-center text-white/30 text-xs mt-6">
            PDAM TIRTA KARAJAE KOTA PAREPARE
          </p>
        </div>
      </div>
    </div>
  );
}
