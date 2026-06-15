// Fungsi: Halaman admin untuk menampilkan dan mengelola fitur admin.
// frontend/src/pages/admin/ResetPassword.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getResetRequests, approveResetRequest, rejectResetRequest } from '../../services/api';

// Helper function untuk format tanggal yang aman
const formatDateSafe = (dateValue) => {
  if (!dateValue) return 'Tanggal tidak tersedia';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Tanggal tidak valid';
  }
};

export default function ResetPassword() {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResetRequests({ status: activeTab !== 'semua' ? activeTab : '' });
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    try {
      await approveResetRequest(id, '');
      fetchRequests();
    } catch (err) { alert(err.message); }
  };

  const openRejectModal = (request) => {
    setRejectTarget(request);
    setRejectReason('');
    setRejectError('');
  };

  const closeRejectModal = () => {
    if (rejecting) return;
    setRejectTarget(null);
    setRejectReason('');
    setRejectError('');
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      setRejectError('Alasan penolakan harus diisi.');
      return;
    }

    setRejecting(true);
    setRejectError('');
    try {
      await rejectResetRequest(rejectTarget.id, trimmedReason);
      closeRejectModal();
      fetchRequests();
    } catch (err) {
      setRejectError(err.message || 'Gagal menolak permintaan reset password.');
    } finally {
      setRejecting(false);
    }
  };

  const tabs = ['pending', 'approved', 'rejected', 'semua'];
  const statusDisplay = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
  const getStatusTextColor = (status) => {
    if (status === 'pending') return 'text-yellow-700 dark:text-yellow-400';
    if (status === 'approved') return 'text-green-700 dark:text-green-400';
    if (status === 'rejected') return 'text-red-700 dark:text-red-400';
    return 'text-gray-700 dark:text-white';
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-xl shadow-lg">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-xl rounded-b-none overflow-hidden">
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-5 h-5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold">Reset Password</h2>
            <p className="text-white/75 text-xs">Kelola permintaan reset password pengguna</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-t-none rounded-b-xl shadow-card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Permintaan Reset Password</h3>
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-medium">
              Total: {requests.length}
            </span>
          </div>
          
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
            {tabs.map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)} 
                className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === t 
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t === 'semua' ? 'Semua' : statusDisplay[t]}
              </button>
            ))}
          </div>
          
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Nama</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">No Langganan</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">No Telepon</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Tanggal</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? 
                  <tr><td colSpan="7" className="py-10 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
                  : requests.length === 0 ? 
                  <tr><td colSpan="7" className="py-10 text-center text-gray-400 dark:text-gray-500">Tidak ada permintaan</td></tr>
                  : requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">{req.nama_lengkap}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">{req.user?.no_langganan || '-'}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">{req.user?.email || '-'}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">{req.no_telepon}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">
                        {formatDateSafe(req.createdAt || req.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-medium ${getStatusTextColor(req.status)}`}>
                          {statusDisplay[req.status] || req.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApprove(req.id)} 
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                            >
                              Terima
                            </button>
                            <button 
                              onClick={() => openRejectModal(req)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
      {rejectTarget && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-all duration-300 animate-fadeIn"
            onClick={closeRejectModal}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 transform transition-all duration-300 animate-modalIn"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="reject-reset-title"
            >
              <div className="flex justify-between items-start gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 id="reject-reset-title" className="text-xl font-bold text-gray-800 dark:text-white">
                    Tolak Reset Password
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {rejectTarget.nama_lengkap} - {rejectTarget.user?.email || rejectTarget.identifier || '-'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Tutup modal penolakan"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                  Alasan ini akan tersimpan di data permintaan dan dikirim sebagai notifikasi kepada pengguna.
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Alasan Penolakan
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(event) => {
                      setRejectReason(event.target.value);
                      if (rejectError) setRejectError('');
                    }}
                    rows={5}
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                      rejectError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tuliskan alasan penolakan reset password..."
                    autoFocus
                  />
                  {rejectError && <p className="mt-2 text-xs font-medium text-red-500">{rejectError}</p>}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeRejectModal}
                    disabled={rejecting}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={rejecting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejecting ? 'Menolak...' : 'Tolak Permintaan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
