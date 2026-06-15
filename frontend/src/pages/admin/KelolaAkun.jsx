// Fungsi: Halaman admin untuk menampilkan dan mengelola fitur admin.
// frontend/src/pages/admin/KelolaAkun.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from '../../services/api';
import DropdownSelect from '../../components/ui/DropdownSelect';
import { normalizeDigits, validateEmail, validatePassword, validatePasswordConfirmation, validatePhone, validateRequired } from '../../utils/validation';

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

const emptyAccountForm = {
  nama_lengkap: '',
  email: '',
  no_telp: '',
  jenis_kelamin: '',
  tanggal_lahir: '',
  role: '',
  password: '',
  konfirmasiPassword: ''
};

export default function KelolaAkun() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState('Semua Peran');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [showPassword, setShowPassword] = useState({ password: false, confirm: false });
  const [showResetPassword, setShowResetPassword] = useState({ password: false, confirm: false });
  const [formData, setFormData] = useState(emptyAccountForm);
  const [stats, setStats] = useState({ total_pelanggan: 0, total_teknisi: 0, total_kepala_teknisi: 0, total_admin: 0 });
  const [formErrors, setFormErrors] = useState({});
  const [resetFormData, setResetFormData] = useState({ password: '', konfirmasiPassword: '' });
  const [resetErrors, setResetErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        role: filterRole !== 'Semua Peran' ? filterRole.toLowerCase() : '',
        status: filterStatus,
        search
      });
      setUsers(res.data.users);
      setStats(res.data.statistics);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterStatus, search, showToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUsers]);

  const validateForm = () => {
    const errors = {};
    const nameError = validateRequired(formData.nama_lengkap, 'Nama lengkap');
    const emailError = validateEmail(formData.email, { required: true });
    const phoneError = validatePhone(formData.no_telp);
    if (nameError) errors.nama_lengkap = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.no_telp = phoneError;
    if (!formData.role) errors.role = 'Peran wajib dipilih.';
    if (!editingUser) {
      const passwordError = validatePassword(formData.password, { required: true, label: 'Kata sandi' });
      const confirmError = validatePasswordConfirmation(formData.password, formData.konfirmasiPassword, { required: true, label: 'Konfirmasi kata sandi' });
      if (passwordError) errors.password = passwordError;
      if (confirmError) errors.konfirmasiPassword = confirmError;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'no_telp' ? normalizeDigits(e.target.value, 13) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          nama_lengkap: formData.nama_lengkap,
          email: formData.email,
          no_telp: formData.no_telp,
          jenis_kelamin: formData.jenis_kelamin,
          tanggal_lahir: formData.tanggal_lahir,
          role: formData.role
        });
        showToast('success', 'Akun berhasil diperbarui');
      } else {
        await createUser({
          nama_lengkap: formData.nama_lengkap,
          email: formData.email,
          no_telp: formData.no_telp,
          jenis_kelamin: formData.jenis_kelamin,
          tanggal_lahir: formData.tanggal_lahir,
          role: formData.role,
          password: formData.password
        });
        showToast('success', 'Akun berhasil ditambahkan');
      }
      await fetchUsers();
      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyAccountForm);
    setShowPassword({ password: false, confirm: false });
    setFormErrors({});
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      no_telp: user.no_telp || '',
      jenis_kelamin: user.jenis_kelamin || '',
      tanggal_lahir: user.tanggal_lahir || '',
      role: user.role,
      password: '',
      konfirmasiPassword: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = (id, nama) => {
    setDeleteTarget({ id, nama });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);
    try {
      await deleteUser(deleteTarget.id);
      showToast('success', 'Akun berhasil dihapus');
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err) {
      showToast('error', err.message || 'Gagal menghapus akun');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleResetPassword = (user) => {
    setResetTargetUser(user);
    setResetFormData({ password: '', konfirmasiPassword: '' });
    setResetErrors({});
    setShowResetPassword({ password: false, confirm: false });
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    const passwordError = validatePassword(resetFormData.password, { required: true, label: 'Kata sandi baru' });
    const confirmError = validatePasswordConfirmation(resetFormData.password, resetFormData.konfirmasiPassword, { required: true, label: 'Konfirmasi kata sandi' });
    if (passwordError) errors.password = passwordError;
    if (confirmError) errors.konfirmasiPassword = confirmError;
    setResetErrors(errors);
    if (Object.keys(errors).length > 0 || !resetTargetUser) return;

    setSubmitting(true);
    try {
      await resetUserPassword(resetTargetUser.id, resetFormData.password);
      showToast('success', 'Password berhasil direset');
      setShowResetModal(false);
      setResetTargetUser(null);
      setResetFormData({ password: '', konfirmasiPassword: '' });
    } catch (err) {
      showToast('error', err.message || 'Gagal reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleName = (role) => {
    const roleNames = {
      admin: 'Admin',
      kepala_teknisi: 'Kepala Teknisi',
      teknisi: 'Teknisi',
      pelanggan: 'Pelanggan'
    };
    return roleNames[role] || role;
  };

  const getStatusBadge = (isActive) => (
    isActive
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  );

  const modalInputClass = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-sans text-sm text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:[color-scheme:dark]';
  const modalErrorInputClass = 'border-red-500 focus:ring-red-500 dark:border-red-500';
  const modalSelectButtonClass = 'h-[42px] px-4 font-sans text-sm';

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-blue-600 transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_pelanggan}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Pelanggan</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-yellow-500 transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.total_teknisi}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Teknisi</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-green-500 transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_kepala_teknisi}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Kepala Teknisi</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-purple-500 transition-transform duration-150 hover:scale-[1.02]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total_admin}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Admin</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-5 mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Kelola Akun Pengguna</h3>
            <div className="flex flex-wrap gap-3">
              <DropdownSelect className="w-40" buttonClassName="h-9" value={filterRole} onChange={setFilterRole}>
                {['Semua Peran','Admin','Teknisi','Kepala Teknisi','Pelanggan'].map(r => <option key={r}>{r}</option>)}
              </DropdownSelect>
              <DropdownSelect className="w-36" buttonClassName="h-9" value={filterStatus} onChange={setFilterStatus}>
                {['Semua Status','Aktif','Tidak Aktif'].map(status => <option key={status}>{status}</option>)}
              </DropdownSelect>
              <input placeholder="Cari nama/email..." className="border border-gray-300 dark:border-gray-600 rounded-lg text-xs px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 w-56 focus:outline-none focus:ring-2 focus:ring-primary-500" value={search} onChange={e => setSearch(e.target.value)} />
              <button onClick={() => { setEditingUser(null); resetForm(); setShowModal(true); }} className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Tambah
              </button>
            </div>
          </div>

          <div className="relative -mx-6 px-6">
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white dark:from-gray-800 to-transparent" />
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Jenis Kelamin</th>
                  <th className="px-4 py-3">No Telepon</th>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="font-semibold text-gray-700 dark:text-gray-200">Belum ada pengguna</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Klik tombol Tambah untuk membuat akun baru.</div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => {
                    const roleName = getRoleName(u.role);
                    return (
                      <tr key={u.id} className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-700 dark:text-white">{i+1}</td>
                        <td className="px-4 py-3"><div className="font-medium text-gray-800 dark:text-white">{u.nama_lengkap}</div></td>
                        <td className="px-4 py-3 text-gray-700 dark:text-white">{u.email}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-700 dark:text-white">{u.jenis_kelamin || '-'}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-white">{u.no_telp || '-'}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-white">{roleName}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`${getStatusBadge(u.is_active)} px-2 py-0.5 rounded-full text-sm`}>
                            {u.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button onClick={() => handleEdit(u)} className="p-1.5 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleResetPassword(u)} className="p-1.5 rounded text-yellow-600 transition-colors hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30" title="Reset Password">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                            </button>
                            <button onClick={() => handleDelete(u.id, u.nama_lengkap)} className="p-1.5 rounded text-red-500 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30" title="Hapus">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2 0 0 1-2,2H7a2,2 0 0 1-2-2V6m3,0V4a1,1 0 0 1,1-1h4a1,1 0 0 1,1,1v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>

      {/* Modal Tambah/Edit Akun dengan blur background dan animasi */}
      {showModal && createPortal(
        <>
          {/* Overlay dengan blur */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-all duration-300 animate-fadeIn"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 transform transition-all duration-300 animate-modalIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingUser ? 'Edit Akun' : 'Tambah Akun Baru'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Nama Lengkap*</label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    placeholder="Masukkan nama lengkap"
                    className={`${modalInputClass} ${formErrors.nama_lengkap ? modalErrorInputClass : ''}`}
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.nama_lengkap)}
                    required
                  />
                  {formErrors.nama_lengkap && <p className="text-red-500 text-xs mt-1">{formErrors.nama_lengkap}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Email*</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Masukkan email"
                    className={`${modalInputClass} ${formErrors.email ? modalErrorInputClass : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.email)}
                    required
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">No Telepon</label>
                  <input
                    type="tel"
                    name="no_telp"
                    placeholder="10-13 digit angka"
                    className={`${modalInputClass} ${formErrors.no_telp ? modalErrorInputClass : ''}`}
                    value={formData.no_telp}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    aria-invalid={Boolean(formErrors.no_telp)}
                  />
                  {formErrors.no_telp && <p className="text-red-500 text-xs mt-1">{formErrors.no_telp}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Jenis Kelamin</label>
                  <DropdownSelect
                    name="jenis_kelamin"
                    buttonClassName={modalSelectButtonClass}
                    value={formData.jenis_kelamin}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Pilih jenis kelamin</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </DropdownSelect>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    className={modalInputClass}
                    value={formData.tanggal_lahir}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Peran*</label>
                <DropdownSelect
                  name="role"
                  buttonClassName={`${modalSelectButtonClass} ${formErrors.role ? 'border-red-500 focus:ring-red-500 dark:border-red-500' : ''}`}
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Pilih Peran *</option>
                  <option value="pelanggan">Pelanggan</option>
                  <option value="teknisi">Teknisi</option>
                  <option value="kepala_teknisi">Kepala Teknisi</option>
                  <option value="admin">Admin</option>
                </DropdownSelect>
                  {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                </div>
                {!editingUser && (
                  <>
                    <div className="relative">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Kata Sandi*</label>
                      <input
                        type={showPassword.password ? "text" : "password"}
                        name="password"
                        placeholder="Minimal 8 karakter"
                        className={`${modalInputClass} pr-10 ${formErrors.password ? modalErrorInputClass : ''}`}
                        value={formData.password}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(formErrors.password)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-[39px] -translate-y-1/2"
                        onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })}
                        aria-label={showPassword.password ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        <EyeIcon open={showPassword.password} />
                      </button>
                      {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                    </div>
                    <div className="relative">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Konfirmasi Kata Sandi*</label>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="konfirmasiPassword"
                        placeholder="Ulangi kata sandi"
                        className={`${modalInputClass} pr-10 ${formErrors.konfirmasiPassword ? modalErrorInputClass : ''}`}
                        value={formData.konfirmasiPassword}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(formErrors.konfirmasiPassword)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-[39px] -translate-y-1/2"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        aria-label={showPassword.confirm ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                      >
                        <EyeIcon open={showPassword.confirm} />
                      </button>
                      {formErrors.konfirmasiPassword && <p className="text-red-500 text-xs mt-1">{formErrors.konfirmasiPassword}</p>}
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Modal Reset Password */}
      {showResetModal && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-all duration-300 animate-fadeIn"
            onClick={() => setShowResetModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 transform transition-all duration-300 animate-modalIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {resetTargetUser?.nama_lengkap || 'Pengguna'}
                  </p>
                </div>
                <button onClick={() => setShowResetModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
                <div className="relative">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Kata Sandi Baru*</label>
                  <input
                    type={showResetPassword.password ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    className={`w-full border rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${resetErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    value={resetFormData.password}
                    aria-invalid={Boolean(resetErrors.password)}
                    onChange={(e) => {
                      setResetFormData({ ...resetFormData, password: e.target.value });
                      if (resetErrors.password) setResetErrors({ ...resetErrors, password: '' });
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[39px] -translate-y-1/2"
                    onClick={() => setShowResetPassword({ ...showResetPassword, password: !showResetPassword.password })}
                    aria-label={showResetPassword.password ? "Sembunyikan kata sandi baru" : "Tampilkan kata sandi baru"}
                  >
                    <EyeIcon open={showResetPassword.password} />
                  </button>
                  {resetErrors.password && <p className="text-red-500 text-xs mt-1">{resetErrors.password}</p>}
                </div>
                <div className="relative">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Konfirmasi Kata Sandi Baru*</label>
                  <input
                    type={showResetPassword.confirm ? "text" : "password"}
                    placeholder="Ulangi kata sandi baru"
                    className={`w-full border rounded-lg px-4 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${resetErrors.konfirmasiPassword ? 'border-red-500' : 'border-gray-300'}`}
                    value={resetFormData.konfirmasiPassword}
                    aria-invalid={Boolean(resetErrors.konfirmasiPassword)}
                    onChange={(e) => {
                      setResetFormData({ ...resetFormData, konfirmasiPassword: e.target.value });
                      if (resetErrors.konfirmasiPassword) setResetErrors({ ...resetErrors, konfirmasiPassword: '' });
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[39px] -translate-y-1/2"
                    onClick={() => setShowResetPassword({ ...showResetPassword, confirm: !showResetPassword.confirm })}
                    aria-label={showResetPassword.confirm ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"}
                  >
                    <EyeIcon open={showResetPassword.confirm} />
                  </button>
                  {resetErrors.konfirmasiPassword && <p className="text-red-500 text-xs mt-1">{resetErrors.konfirmasiPassword}</p>}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}

      {deleteTarget && createPortal(
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
            onClick={() => !deleteBusy && setDeleteTarget(null)}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 animate-modalIn">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus akun?</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-300">
                    Akun "{deleteTarget.nama}" akan dihapus dari daftar pengguna.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteBusy}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteBusy}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteBusy ? 'Menghapus...' : 'Hapus Akun'}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
      
      {/* Tambahkan animasi modal di index.css atau di sini dengan style tag */}
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modalIn {
          animation: modalIn 0.25s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
