// Fungsi: File source aplikasi SIGAP.
// frontend/src/KepalaTeknisiApp.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';
import useKepalaTeknisiData from './hooks/useKepalaTeknisiData';

const AnalisisKinerja = lazy(() => import('./pages/kepalaTeknisi/AnalisisKinerja'));
const KepalaTeknisiDashboard = lazy(() => import('./pages/kepalaTeknisi/KepalaTeknisiDashboard'));
const LaporanDarurat = lazy(() => import('./pages/kepalaTeknisi/LaporanDarurat'));
const LaporanMasuk = lazy(() => import('./pages/kepalaTeknisi/LaporanMasuk'));
const ProfilKepalaTeknisi = lazy(() => import('./pages/kepalaTeknisi/ProfilKepalaTeknisi'));
const EditProfilKepalaTeknisi = lazy(() => import('./pages/kepalaTeknisi/EditProfilKepalaTeknisi'));
const RiwayatPelaporan = lazy(() => import('./pages/kepalaTeknisi/RiwayatPelaporan'));

function KepalaTeknisiContent() {
  useKepalaTeknisiData();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen message="Memuat halaman kepala teknisi..." />}>
        <Routes>
          <Route path="dashboard" element={<KepalaTeknisiDashboard />} />
          <Route path="laporan-masuk" element={<LaporanMasuk />} />
          <Route path="riwayat-pelaporan" element={<RiwayatPelaporan />} />
          <Route path="analisis-kinerja" element={<AnalisisKinerja />} />
          <Route path="laporan-darurat" element={<LaporanDarurat />} />
          <Route path="profil" element={<ProfilKepalaTeknisi />} />
          <Route path="edit-profil" element={<EditProfilKepalaTeknisi />} />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function KepalaTeknisiApp() {
  return (
    <AppLayout>
      <KepalaTeknisiContent />
    </AppLayout>
  );
}
