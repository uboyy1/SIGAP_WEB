// Fungsi: Halaman admin untuk menampilkan dan mengelola fitur admin.
// frontend/src/pages/admin/ProfilAdmin.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfilAdmin() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const getUserInitials = () => {
    const name = user?.username || user?.nama_lengkap || '';
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getProfilePhoto = () => {
    if (user?.foto_base64) {
      return user.foto_base64;
    }
    return null;
  };

  const photoBase64 = getProfilePhoto();

  if (!user) return <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">Memuat data profil...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="overflow-hidden rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-xl rounded-b-none overflow-hidden">
        <div className="p-7 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-6 h-6">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Profil Admin</h2>
            <p className="text-white/75 text-sm">Informasi profil administrator sistem</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-t-none rounded-b-xl shadow-card overflow-hidden">
        <div className="flex flex-col items-center pt-10 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
              {photoBase64 ? (
                <img loading="lazy" decoding="async" 
                  src={photoBase64} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white text-3xl font-bold">{getUserInitials()}</span>
              )}
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="font-bold text-gray-800 dark:text-white text-lg">{user?.username || user?.nama_lengkap}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</div>
          </div>
        </div>

        <div className="p-7">
          <h3 className="text-base font-bold text-primary-600 dark:text-primary-400 mb-6 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Informasi Pribadi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Nama Lengkap</label>
              <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{user?.nama_lengkap || '-'}</div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Username</label>
              <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{user?.username || '-'}</div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Email</label>
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{user?.email}</div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Nomor Telepon</label>
              <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg">{user?.no_telp || 'Belum diatur'}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Bio</label>
              <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[96px]">{user?.bio || 'Belum ada bio'}</div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button onClick={() => navigate('/admin/edit-profil')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-primary-600/25 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profil
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
