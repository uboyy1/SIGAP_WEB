// Fungsi: File source aplikasi SIGAP.
// frontend/src/AdminApp.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const KelolaAkun = lazy(() => import('./pages/admin/KelolaAkun'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));
const GenerateLaporan = lazy(() => import('./pages/admin/GenerateLaporan'));
const ProfilAdmin = lazy(() => import('./pages/admin/ProfilAdmin'));
const EditProfil = lazy(() => import('./pages/admin/EditProfil'));

export default function AdminApp() {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen message="Memuat halaman admin..." />}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="kelola-akun" element={<KelolaAkun />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="generate-laporan" element={<GenerateLaporan />} />
            <Route path="profil" element={<ProfilAdmin />} />
            <Route path="edit-profil" element={<EditProfil />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}
