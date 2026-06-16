// Fungsi: Service API frontend untuk komunikasi dengan backend.
// frontend/src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
const CSRF_STORAGE_KEY = 'pelanggan_csrf_token';
const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// ============ HELPER FUNCTIONS ============

const getToken = () => localStorage.getItem('token');

const isPelangganMutation = (endpoint, method) => (
  endpoint.startsWith('/pelanggan')
  && mutatingMethods.has(String(method || 'GET').toUpperCase())
  && !endpoint.includes('/pelanggan/login')
  && !endpoint.includes('/pelanggan/register')
  && !endpoint.includes('/pelanggan/forgot-password')
  && !endpoint.includes('/pelanggan/reset-approved-password')
  && !endpoint.includes('/pelanggan/resend-verification')
);

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem(CSRF_STORAGE_KEY);
};

const toFriendlyErrorMessage = (error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') => {
  const message = String(error?.message || fallback);

  if (!navigator.onLine || error?.name === 'TypeError' || message.includes('Failed to fetch')) {
    return 'Koneksi internet bermasalah. Periksa koneksi Anda lalu coba lagi.';
  }

  if (message.includes('Unexpected token')) return 'Respons server tidak dapat dibaca. Silakan coba lagi.';
  if (message.includes('HTTP 500')) return 'Server sedang mengalami gangguan. Silakan coba lagi nanti.';
  if (message.includes('HTTP 404')) return 'Data yang diminta tidak ditemukan.';
  if (message.includes('HTTP 403')) return 'Aksi ini tidak dapat dilakukan dengan sesi saat ini.';
  if (message.includes('HTTP 401')) return 'Sesi habis, silakan login ulang';

  return message || fallback;
};

const readJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const getPelangganCsrfTokenValue = async () => {
  const cached = sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (cached) return cached;

  const token = getToken();
  if (!token) return '';

  const response = await fetch(`${API_BASE}/pelanggan/csrf-token`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    clearAuthStorage();
    const loginPath = getLoginPath();
    if (!window.location.pathname.includes('/login') && window.location.pathname !== loginPath) {
      window.location.replace(loginPath);
    }
    throw new Error('Sesi habis, silakan login ulang');
  }

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw new Error(data.message || 'Keamanan sesi gagal disiapkan. Muat ulang halaman lalu coba lagi.');
  }

  const csrfToken = data?.data?.csrf_token || '';
  if (csrfToken) sessionStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
  return csrfToken;
};

const getAppSurface = () => {
  const pathname = window.location.pathname.toLowerCase();

  if (pathname === '/login/admin' || pathname === '/admin/login' || pathname === '/admin/forgot-password') return 'admin';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname === '/login/kepala-teknisi' || pathname === '/login/kepala_teknisi') return 'kepala_teknisi';
  if (pathname === '/kepala_teknisi/login' || pathname.startsWith('/kepala_teknisi')) return 'kepala_teknisi';
  if (pathname.startsWith('/kepala-teknisi')) return 'kepala_teknisi';
  return 'pelanggan';
};

const getLoginPath = () => {
  const surface = getAppSurface();
  if (surface === 'admin') return '/login/admin';
  if (surface === 'kepala_teknisi') return '/login/kepala-teknisi';
  return '/';
};

const getAuthBase = () => (getAppSurface() === 'pelanggan' ? '/pelanggan' : '/auth');

const requestLogin = async (authBase, email, password) => {
  const payload = authBase === '/pelanggan'
    ? { identifier: email, password }
    : { email, password };

  const response = await fetch(`${API_BASE}${authBase}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    const validationMessage = Array.isArray(data.errors) && data.errors[0]?.message;
    const error = new Error(toFriendlyErrorMessage({
      message: validationMessage || data.message || `HTTP ${response.status}: ${response.statusText}`,
    }));
    error.status = response.status;
    error.errors = Array.isArray(data.errors) ? data.errors : [];
    error.code = data.code;
    throw error;
  }

  return data;
};

const getStoredUserRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.role || null;
  } catch {
    return null;
  }
};

const getCurrentAuthBase = () => {
  const role = getStoredUserRole();
  if (role === 'pelanggan') return '/pelanggan';
  if (role === 'admin' || role === 'kepala_teknisi') return '/auth';
  return getAuthBase();
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const {
    auth = true,
    redirectOnUnauthorized = true,
    headers: optionHeaders,
    ...fetchOptions
  } = options;
  const method = String(fetchOptions.method || 'GET').toUpperCase();
  const csrfToken = auth && token && isPelangganMutation(endpoint, method)
    ? await getPelangganCsrfTokenValue()
    : '';
  const headers = {
    'Content-Type': 'application/json',
    ...(auth && token && { Authorization: `Bearer ${token}` }),
    ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    ...optionHeaders,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if ((response.status === 401 || response.status === 403) && redirectOnUnauthorized && !endpoint.includes('/auth/login') && !endpoint.includes('/pelanggan/login')) {
      clearAuthStorage();
      const loginPath = getLoginPath();
      if (!window.location.pathname.includes('/login') && window.location.pathname !== loginPath) {
        window.location.replace(loginPath);
      }
      throw new Error('Sesi habis, silakan login ulang');
    }

    const data = await readJsonSafely(response);
    if (!response.ok) {
      const validationMessage = Array.isArray(data.errors) && data.errors[0]?.message;
      const error = new Error(toFriendlyErrorMessage({
        message: validationMessage || data.message || `HTTP ${response.status}: ${response.statusText}`,
      }));
      error.status = response.status;
      error.errors = Array.isArray(data.errors) ? data.errors : [];
      error.code = data.code;
      throw error;
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    error.message = toFriendlyErrorMessage(error);
    throw error;
  }
};

const uploadFormData = async (endpoint, formData, { onProgress, auth = true } = {}) => {
  const token = getToken();
  if (auth && !token) throw new Error('Sesi habis, silakan login ulang');

  const csrfToken = auth && token && isPelangganMutation(endpoint, 'POST')
    ? await getPelangganCsrfTokenValue()
    : '';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}${endpoint}`);

    if (auth && token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    if (csrfToken) xhr.setRequestHeader('X-CSRF-Token', csrfToken);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || typeof onProgress !== 'function') return;
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      const data = (() => {
        try {
          return xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          return {};
        }
      })();

      if (xhr.status === 401 || xhr.status === 403) {
        clearAuthStorage();
        const loginPath = getLoginPath();
        if (!window.location.pathname.includes('/login') && window.location.pathname !== loginPath) {
          window.location.replace(loginPath);
        }
        reject(Object.assign(new Error('Sesi habis, silakan login ulang'), { status: xhr.status }));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(Object.assign(new Error(toFriendlyErrorMessage({
          message: data.message || `HTTP ${xhr.status}`,
        })), {
          status: xhr.status,
          errors: Array.isArray(data.errors) ? data.errors : [],
          code: data.code,
        }));
        return;
      }

      onProgress?.(100);
      resolve(data);
    };

    xhr.onerror = () => {
      reject(new Error('Koneksi internet bermasalah. Periksa koneksi Anda lalu coba lagi.'));
    };

    xhr.send(formData);
  });
};

// ============ HELPER FUNCTIONS UNTUK FORMAT WAKTU ============

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  } catch {
    return '-';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

// ============ AUTH API ============

export const login = (email, password) => {
  const authBase = getAuthBase();
  if (authBase === '/auth') return requestLogin('/auth', email, password);

  return requestLogin('/pelanggan', email, password);
};

export const forgotPassword = ({ email }) => {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const getResetPasswordStatus = ({ email }) => {
  return request('/auth/reset-password-status', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

export const resetApprovedPassword = ({ email, new_password }) => {
  return request('/auth/reset-approved-password', {
    method: 'POST',
    body: JSON.stringify({ email, new_password }),
  });
};

export const logout = () => request(`${getCurrentAuthBase()}/logout`, { method: 'POST' });

export const getCurrentUser = () => request(`${getCurrentAuthBase()}/me`, { redirectOnUnauthorized: false });

export const updateProfile = (data) => request('/auth/profile', {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const updatePassword = (data) => request('/auth/password', {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const uploadMyProfilePicture = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('foto_profil', file);

  console.log(`📸 Uploading photo via /auth/upload-photo`);
  console.log(`📸 File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB`);

  try {
    const response = await fetch(`${API_BASE}/auth/upload-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log('📸 Upload response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Gagal upload foto');
    }
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const deleteMyProfilePicture = () => request('/auth/profile/photo', {
  method: 'DELETE',
});

// ============ KEPALA TEKNISI API ============

// Dashboard
export const getKepalaTeknisiDashboardStats = () => request('/kepala-teknisi/dashboard/stats');
export const getKepalaTeknisiCompleteDashboard = () => request('/kepala-teknisi/dashboard/stats');

// Laporan Masuk
export const getLaporanMasukKT = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/kepala-teknisi/laporan-masuk${query ? `?${query}` : ''}`);
};

export const getLaporanMasukDetailKT = (id) => request(`/kepala-teknisi/laporan-masuk/${id}`);

export const getTeknisiOptionsKT = async () => {
  console.log('📋 Fetching teknisi options...');
  try {
    const response = await request('/kepala-teknisi/laporan-masuk/teknisi');
    console.log('📋 Teknisi response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching teknisi:', error);
    throw error;
  }
};

export const checkTeknisiCountKT = async () => {
  const response = await getTeknisiOptionsKT();
  const teknisi = Array.isArray(response.data) ? response.data : [];

  return {
    success: response.success,
    data: {
      total: teknisi.length,
      aktif: teknisi.filter((item) => item.is_active).length,
      non_aktif: teknisi.filter((item) => !item.is_active).length,
    },
  };
};

export const terimaLaporanMasukKT = (id, teknisi_id) =>
  request(`/kepala-teknisi/laporan-masuk/${id}/terima`, {
    method: 'PUT',
    body: JSON.stringify({ teknisi_id }),
  });

export const tolakLaporanMasukKT = (id, catatan = '') =>
  request(`/kepala-teknisi/laporan-masuk/${id}/tolak`, {
    method: 'PUT',
    body: JSON.stringify({ catatan }),
  });

// Riwayat Pelaporan
export const getRiwayatPelaporanKT = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/kepala-teknisi/riwayat-pelaporan${query ? `?${query}` : ''}`);
};

export const getRiwayatDetailKT = (id) => request(`/kepala-teknisi/riwayat-pelaporan/${id}`);

// Analisis Kinerja
export const getAnalisisKinerjaKT = () => request('/kepala-teknisi/analisis-kinerja');

// Laporan Darurat
export const getLaporanDaruratKT = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/kepala-teknisi/laporan-darurat${query ? `?${query}` : ''}`);
};

export const updateLaporanDaruratStatusKT = (id, status, catatan = '') =>
  request(`/kepala-teknisi/laporan-darurat/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status, catatan }),
  });

// Tugas
export const getTugasKT = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/kepala-teknisi/tugas${query ? `?${query}` : ''}`);
};

// ============ KATEGORI API ============
export const getKategori = () => request('/kategori');
export const getKategoriForKepalaTeknisi = getKategori;

// ============ KEPALA TEKNISI PROFILE API ============
export const getKepalaTeknisiProfile = () => request('/kepala-teknisi/profile');

export const updateKepalaTeknisiProfile = (data) => request('/kepala-teknisi/profile', {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const updateKepalaTeknisiPassword = (data) => request('/kepala-teknisi/profile/password', {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const uploadKepalaTeknisiPhoto = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('foto_profil', file);

  try {
    const response = await fetch(`${API_BASE}/kepala-teknisi/profile/upload-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Gagal upload foto');
    }
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// ============ ADMIN API (Users, Laporan, Tugas, Reset Password) ============

// Users
export const getUsers = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/users${query ? `?${query}` : ''}`);
};

export const getUserById = (id) => request(`/users/${id}`);

export const createUser = (userData) => request('/users', {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const updateUser = (id, userData) => request(`/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(userData),
});

export const deleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });

export const resetUserPassword = (id, new_password) =>
  request(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ new_password }),
  });

// Admin Dashboard
export const getDashboardStats = () => request('/dashboard/stats');

// Laporan (Admin)
export const getLaporan = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/laporan${query ? `?${query}` : ''}`);
};

export const getLaporanFilter = (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return request(`/laporan/filter${query ? `?${query}` : ''}`);
};

export const getLaporanStats = () => request('/laporan/stats');

export const getLaporanById = (id) => request(`/laporan/${id}`);

export const updateLaporanStatus = (id, status, catatan = '') =>
  request(`/laporan/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, catatan }),
  });

export const deleteLaporan = (id) => request(`/laporan/${id}`, { method: 'DELETE' });

// Reset Password Requests (Admin)
export const getResetRequests = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/reset-password${query ? `?${query}` : ''}`);
};

export const getResetRequestById = (id) => request(`/reset-password/${id}`);

export const approveResetRequest = (id, catatan_admin = '') =>
  request(`/reset-password/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ catatan_admin }),
  });

export const rejectResetRequest = (id, catatan_admin = '') =>
  request(`/reset-password/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ catatan_admin }),
  });

// Tugas (Admin)
export const getTugas = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/tugas${query ? `?${query}` : ''}`);
};

export const createTugas = (tugasData) => request('/tugas', {
  method: 'POST',
  body: JSON.stringify(tugasData),
});

export const assignTugas = (id, teknisi_id) =>
  request(`/tugas/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ teknisi_id }),
  });

export const completeTugas = (id, catatan_teknisi = '') =>
  request(`/tugas/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify({ catatan_teknisi }),
  });

export const deleteTugas = (id) => request(`/tugas/${id}`, { method: 'DELETE' });

// Aktivitas Log (Admin)
export const getRecentActivities = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/aktivitas-log/recent${query ? `?${query}` : ''}`);
};

export const getAllActivities = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/aktivitas-log/all${query ? `?${query}` : ''}`);
};

// Notifications
export const getRecentNotifications = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/notifications/recent${query ? `?${query}` : ''}`);
};

export const markNotificationAsRead = (id) =>
  request(`/notifications/${id}/read`, { method: 'PUT' });

export const markAllNotificationsAsRead = () =>
  request('/notifications/read-all', { method: 'PUT' });

export const deleteAllNotifications = () =>
  request('/notifications/all', { method: 'DELETE' });

// ============ PELANGGAN API ============
export const pelangganRegister = (data) =>
  request('/pelanggan/register', {
    method: 'POST',
    auth: false,
    redirectOnUnauthorized: false,
    body: JSON.stringify(data),
  });

export const pelangganLogin = (identifier, password) =>
  request('/pelanggan/login', {
    method: 'POST',
    auth: false,
    redirectOnUnauthorized: false,
    body: JSON.stringify({ identifier, password }),
  });

export const pelangganLogout = () => request('/pelanggan/logout', { method: 'POST' });

export const getPelangganMe = () => request('/pelanggan/me');

export const updatePelangganProfile = (data) =>
  request('/pelanggan/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getPelangganProfileCovers = () => request('/pelanggan/profile-covers');

export const updatePelangganProfileCover = (profileCoverId) =>
  request('/pelanggan/profile/cover', {
    method: 'PUT',
    body: JSON.stringify({ profile_cover_id: profileCoverId }),
  });

export const updatePelangganPassword = (data) =>
  request('/pelanggan/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const uploadPelangganPhoto = async (file, { onProgress } = {}) => {
  const formData = new FormData();
  formData.append('foto_profil', file);

  return uploadFormData('/pelanggan/upload-photo', formData, { onProgress });
};

export const deletePelangganPhoto = () => request('/pelanggan/profile/photo', {
  method: 'DELETE',
});

export const deletePelangganAccount = () => request('/pelanggan/account', {
  method: 'DELETE',
});

export const pelangganForgotPassword = (identifier) =>
  request('/pelanggan/forgot-password', {
    method: 'POST',
    auth: false,
    redirectOnUnauthorized: false,
    body: JSON.stringify({ identifier }),
  });

export const resendPelangganVerificationEmail = (identifier) =>
  request('/pelanggan/resend-verification', {
    method: 'POST',
    auth: false,
    redirectOnUnauthorized: false,
    body: JSON.stringify({ identifier }),
  });

export const getPelangganResetStatus = (identifier) => {
  const query = new URLSearchParams({ identifier }).toString();
  return request(`/pelanggan/reset-status?${query}`, { auth: false, redirectOnUnauthorized: false });
};

export const resetApprovedPelangganPassword = ({ identifier, new_password }) =>
  request('/pelanggan/reset-approved-password', {
    method: 'POST',
    auth: false,
    redirectOnUnauthorized: false,
    body: JSON.stringify({ identifier, new_password }),
  });

export const getPelangganLaporan = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/pelanggan/laporan${query ? `?${query}` : ''}`);
};

export const getPelangganLaporanDetail = (id) => request(`/pelanggan/laporan/${id}`);

export const createPelangganLaporan = (data) =>
  request('/pelanggan/laporan', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const uploadPelangganLaporan = async (data, { onProgress } = {}) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value);
  });

  return uploadFormData('/pelanggan/laporan', formData, { onProgress });
};

export const deleteKepalaTeknisiPhoto = () => request('/kepala-teknisi/profile/photo', {
  method: 'DELETE',
});

export const updatePelangganLaporan = (id, data) =>
  request(`/pelanggan/laporan/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deletePelangganLaporan = (id) => request(`/pelanggan/laporan/${id}`, { method: 'DELETE' });

export const getPublicPelangganLaporan = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/pelanggan/laporan/public${query ? `?${query}` : ''}`, { redirectOnUnauthorized: false });
};

export const getPelangganLaporanCount = () =>
  request('/pelanggan/laporan/count', { auth: false, redirectOnUnauthorized: false });

export const togglePelangganLaporanLike = (id) =>
  request(`/pelanggan/laporan/${id}/like`, { method: 'POST' });

export const addPelangganLaporanComment = (id, komentar) =>
  request(`/pelanggan/laporan/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ komentar }),
  });

export const getPelangganLaporanComments = (id) => {
  const laporanId = Number(id);
  if (!Number.isInteger(laporanId) || laporanId <= 0) {
    return Promise.reject(new Error('ID laporan tidak valid'));
  }

  return request(`/pelanggan/laporan/${laporanId}/comments`, { auth: false, redirectOnUnauthorized: false });
};

export const getPelangganNotifications = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/pelanggan/notifications${query ? `?${query}` : ''}`);
};

export const markPelangganNotificationAsRead = (id) =>
  request(`/pelanggan/notifications/${id}/read`, { method: 'PUT' });

export const markAllPelangganNotificationsAsRead = () =>
  request('/pelanggan/notifications/read-all', { method: 'PUT' });

export const deleteAllPelangganNotifications = () =>
  request('/pelanggan/notifications/all', { method: 'DELETE' });

export const getPelangganDashboardStats = () => request('/pelanggan/dashboard/stats');

export const getPelangganKategori = () => request('/pelanggan/kategori', { auth: false, redirectOnUnauthorized: false });

export const getPelangganAboutContent = () =>
  request('/pelanggan/info/about', { auth: false, redirectOnUnauthorized: false });

export const getPelangganTermsContent = () =>
  request('/pelanggan/info/terms', { auth: false, redirectOnUnauthorized: false });
