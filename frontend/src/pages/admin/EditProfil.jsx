// Fungsi: Halaman admin untuk menampilkan dan mengelola fitur admin.
// frontend/src/pages/admin/EditProfil.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteMyProfilePicture, updateProfile, updatePassword, uploadMyProfilePicture } from '../../services/api';
import { normalizeDigits, validatePassword, validatePasswordConfirmation, validatePhone, validateRequired } from '../../utils/validation';

const EyeIcon = ({ open }) => (
  open ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
);

export default function EditProfil() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoMarkedForDelete, setPhotoMarkedForDelete] = useState(false);
  const [deletePhotoDialogOpen, setDeletePhotoDialogOpen] = useState(false);
  const previewUrlRef = useRef(null);
  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    no_telp: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (user && isMounted.current) {
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        username: user.username || '',
        no_telp: user.no_telp || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        if (isMounted.current) setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = useCallback((type, text) => {
    if (isMounted.current) setMessage({ type, text });
  }, []);

  const clearFieldError = (field) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const updateProfileField = (field, value) => {
    const nextValue = field === 'no_telp' ? normalizeDigits(value, 13) : value;
    setFormData((current) => ({ ...current, [field]: nextValue }));
    clearFieldError(field);
    if (message.type === 'error') showMessage('', '');
  };

  const updatePasswordField = (field, value) => {
    setPasswordData((current) => ({ ...current, [field]: value }));
    clearFieldError(field);
    if (field === 'new_password') clearFieldError('confirm_password');
    if (message.type === 'error') showMessage('', '');
  };

  const validateForm = () => {
    const errors = {};
    const nameError = validateRequired(formData.nama_lengkap, 'Nama lengkap');
    const usernameError = validateRequired(formData.username, 'Username');
    const phoneError = validatePhone(formData.no_telp);
    const bioLength = String(formData.bio || '').trim().length;
    const wantsPasswordChange = Boolean(passwordData.current_password || passwordData.new_password || passwordData.confirm_password);

    if (nameError) errors.nama_lengkap = nameError;
    if (usernameError) errors.username = usernameError;
    if (phoneError) errors.no_telp = phoneError;
    if (bioLength > 300) errors.bio = 'Bio maksimal 300 karakter.';

    if (wantsPasswordChange) {
      const currentError = validateRequired(passwordData.current_password, 'Kata sandi saat ini');
      const newError = validatePassword(passwordData.new_password, { required: true, label: 'Kata sandi baru' });
      const confirmError = validatePasswordConfirmation(passwordData.new_password, passwordData.confirm_password, { required: true, label: 'Konfirmasi kata sandi' });
      if (currentError) errors.current_password = currentError;
      if (newError) errors.new_password = newError;
      if (confirmError) errors.confirm_password = confirmError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getUserInitials = () => {
    const name = formData.username || user?.username || user?.nama_lengkap || '';
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getProfilePhoto = () => {
    if (photoMarkedForDelete) return null;
    if (photoPreview) return photoPreview;
    if (user?.foto_base64) return user.foto_base64;
    return null;
  };

  const photoSrc = getProfilePhoto();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      showMessage('error', 'Format file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, atau BMP');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = event.target.result;
      setPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);

    setSelectedPhotoFile(file);
    setPhotoMarkedForDelete(false);
  };

  const handleDeletePhoto = () => {
    if ((!user?.foto_base64 && !photoPreview) || loading) return;

    setDeletePhotoDialogOpen(true);
  };

  const confirmDeletePhoto = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPhotoPreview(null);
    setSelectedPhotoFile(null);
    setPhotoMarkedForDelete(Boolean(user?.foto_base64));
    setDeletePhotoDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showMessage('', '');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const updateData = {};
      if (formData.nama_lengkap !== user?.nama_lengkap) updateData.nama_lengkap = formData.nama_lengkap;
      if (formData.username !== user?.username) updateData.username = formData.username;
      if (formData.no_telp !== user?.no_telp) updateData.no_telp = formData.no_telp;
      if (formData.bio !== user?.bio) updateData.bio = formData.bio;

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
      }

      if (passwordData.new_password) {
        await updatePassword({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        });
      }

      if (photoMarkedForDelete && user?.foto_base64) {
        setDeletingPhoto(true);
        await deleteMyProfilePicture();
      } else if (selectedPhotoFile) {
        setUploadingPhoto(true);
        await uploadMyProfilePicture(selectedPhotoFile);
      }

      await refreshUser();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPhotoPreview(null);
      setSelectedPhotoFile(null);
      setPhotoMarkedForDelete(false);
      setDeletePhotoDialogOpen(false);

      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });

      showMessage('success', 'Profil berhasil diperbarui');
      setTimeout(() => {
        if (isMounted.current) navigate('/admin/profil');
      }, 1500);
    } catch (err) {
      showMessage('error', err.message || 'Gagal memperbarui profil');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setUploadingPhoto(false);
        setDeletingPhoto(false);
      }
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">Memuat data profil...</div>;
  }

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
            <h2 className="text-white font-bold text-xl">Edit Profil Admin</h2>
            <p className="text-white/75 text-sm">Perbarui informasi profil administrator</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-t-none rounded-b-xl shadow-card overflow-hidden">
        <form onSubmit={handleSubmit} className="p-7" noValidate>
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div
              className="relative cursor-pointer group"
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                {photoSrc ? (
                  <img loading="lazy" decoding="async"
                    src={photoSrc}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">{getUserInitials()}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md hover:bg-primary-600 transition-colors">
                {uploadingPhoto || deletingPhoto ? (
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {uploadingPhoto
                ? 'Mengupload foto...'
                : deletingPhoto
                  ? 'Menghapus foto...'
                  : photoPreview || photoMarkedForDelete
                    ? 'Perubahan foto akan tersimpan setelah menekan Simpan Perubahan'
                    : 'Klik ikon kamera untuk mengubah foto (Maks 2MB)'}
            </p>
            {!photoMarkedForDelete && (user?.foto_base64 || photoPreview) ? (
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={loading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {deletingPhoto ? 'Menghapus...' : 'Hapus Foto'}
              </button>
            ) : null}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nama Lengkap</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.nama_lengkap}
                onChange={(e) => updateProfileField('nama_lengkap', e.target.value)}
                aria-invalid={Boolean(fieldErrors.nama_lengkap)}
                required
              />
              {fieldErrors.nama_lengkap ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.nama_lengkap}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.username}
                onChange={(e) => updateProfileField('username', e.target.value)}
                aria-invalid={Boolean(fieldErrors.username)}
                required
              />
              {fieldErrors.username ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.username}</p> : null}
              <p className="text-xs text-gray-400 mt-1">Username dapat diubah, pastikan unik</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                value={user?.email || ''}
                disabled
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nomor Telepon</label>
              <input
                type="tel"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.no_telp}
                onChange={(e) => updateProfileField('no_telp', e.target.value)}
                placeholder="Contoh: 081234567890"
                inputMode="numeric"
                aria-invalid={Boolean(fieldErrors.no_telp)}
              />
              {fieldErrors.no_telp ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.no_telp}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Bio</label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.bio}
                onChange={(e) => updateProfileField('bio', e.target.value)}
                placeholder="Tuliskan bio singkat..."
                aria-invalid={Boolean(fieldErrors.bio)}
              />
              {fieldErrors.bio ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.bio}</p> : null}
            </div>

            {/* Ubah Password Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-7 mt-5">
              <h3 className="text-base font-bold text-green-600 dark:text-green-400 mb-5 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                </svg>
                Ubah Kata Sandi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={passwordData.current_password}
                      onChange={(e) => updatePasswordField('current_password', e.target.value)}
                      placeholder="Masukkan password saat ini"
                      aria-invalid={Boolean(fieldErrors.current_password)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    >
                      <EyeIcon open={showPassword.current} />
                    </button>
                  </div>
                  {fieldErrors.current_password ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.current_password}</p> : null}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={passwordData.new_password}
                      onChange={(e) => updatePasswordField('new_password', e.target.value)}
                      placeholder="Minimal 8 karakter"
                      aria-invalid={Boolean(fieldErrors.new_password)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    >
                      <EyeIcon open={showPassword.new} />
                    </button>
                  </div>
                  {fieldErrors.new_password ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.new_password}</p> : null}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={passwordData.confirm_password}
                      onChange={(e) => updatePasswordField('confirm_password', e.target.value)}
                      placeholder="Konfirmasi password baru"
                      aria-invalid={Boolean(fieldErrors.confirm_password)}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    >
                      <EyeIcon open={showPassword.confirm} />
                    </button>
                  </div>
                  {fieldErrors.confirm_password ? <p className="mt-1.5 text-xs font-semibold text-red-500">{fieldErrors.confirm_password}</p> : null}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">* Kosongkan jika tidak ingin mengubah password</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/profil')}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploadingPhoto || deletingPhoto}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-primary-600/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>

      {deletePhotoDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Hapus foto profil?</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Foto akan diganti menjadi avatar default setelah Anda menekan Simpan Perubahan.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletePhotoDialogOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeletePhoto}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Hapus Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
