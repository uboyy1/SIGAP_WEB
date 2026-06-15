// Fungsi: Halaman publik aplikasi SIGAP.
// frontend/src/pages/SplashScreen.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoSigap from "../assets/logo_sigap.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Cek apakah user sudah login
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (token) {
        if (user?.role === 'admin') {
          navigate("/admin/dashboard");
          return;
        }
        if (user?.role === 'kepala_teknisi') {
          navigate("/kepala-teknisi/dashboard");
          return;
        }
        navigate("/");
      } else {
        navigate("/");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Main content - centered vertically and horizontally */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="text-center">
          {/* Logo di tengah */}
          <div className="relative mb-6 flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-50" />
            <img loading="lazy" decoding="async"
              src={logoSigap}
              alt="SIGAP"
              className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-extrabold tracking-wider text-white mb-2 drop-shadow-lg">
            SIGAP
          </h1>

          {/* Subtitle */}
          <p className="text-base font-light text-white/70 tracking-wide">
            Sistem Informasi Gangguan Air PDAM
          </p>

          {/* Loading indicator */}
          <div className="flex justify-center gap-1.5 mt-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>

          {/* Version */}
          <p className="text-sm text-white/30 mt-8 tracking-wide font-light">
            Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
}
