// Fungsi: Root aplikasi SIGAP dengan routing berbasis path.
// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingScreen from './components/common/LoadingScreen';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import ForgotPassword from './pages/ForgotPassword';
import AdminApp from './AdminApp';
import KepalaTeknisiApp from './KepalaTeknisiApp';
import PelangganApp from './PelangganApp';

const getLoginPathByPathname = (pathname = window.location.pathname) => {
  const currentPath = pathname.toLowerCase();
  if (currentPath.startsWith('/admin') || currentPath.startsWith('/login/admin')) return '/login/admin';
  if (currentPath.startsWith('/kepala-teknisi') || currentPath.startsWith('/kepala_teknisi') || currentPath.startsWith('/login/kepala-teknisi') || currentPath.startsWith('/login/kepala_teknisi')) {
    return '/login/kepala-teknisi';
  }
  return '/';
};

const getDefaultPathByRole = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'kepala_teknisi') return '/kepala-teknisi/dashboard';
  return '/';
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen message="Memuat sesi..." />;
  
  if (!user) {
    return <Navigate to={getLoginPathByPathname()} replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathByRole(user.role)} replace />;
  }
  
  return children;
};

const KepalaTeknisiAliasRedirect = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace(/^\/kepala_teknisi/i, '/kepala-teknisi');
  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen message="Memuat sesi..." />;

  return (
    <Routes>
      <Route path="/" element={<PelangganApp />} />
      <>
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login/admin" element={<LoginScreen />} />
        <Route path="/login/kepala-teknisi" element={<LoginScreen />} />
        <Route path="/login/kepala_teknisi" element={<Navigate to="/login/kepala-teknisi" replace />} />
        <Route path="/login/teknisi" element={<Navigate to="/" replace />} />
        <Route path="/admin/login" element={<LoginScreen />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/kepala-teknisi/login" element={<LoginScreen />} />
        <Route path="/kepala-teknisi/forgot-password" element={<ForgotPassword />} />
        <Route path="/kepala_teknisi/*" element={<KepalaTeknisiAliasRedirect />} />
        <Route path="/teknisi/*" element={<Navigate to="/" replace />} />
      </>

      <Route
        path="/pelanggan/*"
        element={<PelangganApp />}
      />
      
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Navigate to="/admin/dashboard" replace />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminApp />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/kepala-teknisi"
        element={
          <PrivateRoute allowedRoles={['kepala_teknisi']}>
            <Navigate to="/kepala-teknisi/dashboard" replace />
          </PrivateRoute>
        }
      />

      <Route
        path="/kepala-teknisi/*"
        element={
          <PrivateRoute allowedRoles={['kepala_teknisi']}>
            <KepalaTeknisiApp />
          </PrivateRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
