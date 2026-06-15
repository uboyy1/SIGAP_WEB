import logoSigap from "../../assets/logo_sigap.png";

export default function PelangganAuthBrand({ compact = false }) {
  return (
    <div className={`inline-flex max-w-full items-center gap-3 text-white ${compact ? "scale-95" : ""}`}>
      <img src={logoSigap} alt="SIGAP" className="h-12 w-12 shrink-0 object-contain" />
      <div className="min-w-0 leading-none">
        <div className="text-2xl font-extrabold tracking-wide sm:text-3xl">SIGAP</div>
        <div className="mt-1 max-w-[calc(100vw-7rem)] truncate text-xs font-semibold text-white/82 sm:text-sm">Sistem Informasi Gangguan Air PDAM</div>
      </div>
    </div>
  );
}
