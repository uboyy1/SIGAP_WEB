// Fungsi: Komponen umum yang dipakai lintas halaman aplikasi.
export default function LoadingScreen({ message = 'Memuat data...' }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
