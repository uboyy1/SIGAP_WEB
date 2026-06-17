// Fungsi: Halaman kepala teknisi untuk workflow pengelolaan teknisi.
// frontend/src/pages/kepalaTeknisi/LaporanMasuk.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import DropdownSelect from '../../components/ui/DropdownSelect';
import {
  getLaporanMasukKT,
  getKategori,
  getLaporanMasukDetailKT,
  getTeknisiOptionsKT,
  checkTeknisiCountKT,  // Import untuk debugging
  terimaLaporanMasukKT,
  tolakLaporanMasukKT
} from '../../services/api';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 pl-9 pr-3 text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
    />
  </div>
);

const EmptyState = ({ title, subtitle }) => (
  <div className="min-h-[160px] flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9H9l-3-9H2" /><path d="M5 3h14l-3 9h-8L5 3z" />
    </svg>
    <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{title}</div>
    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{subtitle}</div>
  </div>
);

const SearchableTeknisiSelect = ({ value, onChange, teknisiList, loading }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  const selectedTeknisi = teknisiList.find((teknisi) => String(teknisi.id) === String(value));
  const filteredTeknisi = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return teknisiList;

    return teknisiList.filter((teknisi) => {
      const searchable = [
        teknisi.nama_lengkap,
        teknisi.username,
        teknisi.no_telp
      ].filter(Boolean).join(' ').toLowerCase();

      return searchable.includes(keyword);
    });
  }, [query, teknisiList]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const handleSelect = (teknisi) => {
    onChange(String(teknisi.id));
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((current) => !current)}
        className="h-11 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 px-3 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors flex items-center justify-between gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="truncate">
          {loading ? 'Memuat daftar teknisi...' : selectedTeknisi?.nama_lengkap || 'Cari dan pilih teknisi'}
        </span>
        <svg className={`w-4 h-4 shrink-0 text-gray-500 dark:text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[1300] mt-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Cari nama teknisi..."
              className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredTeknisi.length === 0 ? (
              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                Tidak ada teknisi yang cocok
              </div>
            ) : (
              filteredTeknisi.map((teknisi) => (
                <button
                  key={teknisi.id}
                  type="button"
                  onClick={() => handleSelect(teknisi)}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors ${String(teknisi.id) === String(value) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'}`}
                >
                  <span className="block font-semibold">{teknisi.nama_lengkap || teknisi.username || '-'}</span>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                    {[teknisi.no_telp, teknisi.is_active ? 'Aktif' : 'Tidak Aktif'].filter(Boolean).join(' - ')}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const statusDisplay = {
  menunggu: 'Menunggu',
  divalidasi: 'Disetujui',
  ditolak: 'Ditolak',
  dalam_penanganan: 'Dalam Penanganan',
  selesai: 'Selesai'
};

const priorityDisplay = {
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah'
};

const getStatusTextColor = (status) => {
  const styles = {
    menunggu: 'text-yellow-600 dark:text-yellow-400',
    divalidasi: 'text-blue-600 dark:text-blue-400',
    ditolak: 'text-red-600 dark:text-red-400',
    dalam_penanganan: 'text-orange-600 dark:text-orange-400',
    selesai: 'text-green-600 dark:text-green-400'
  };
  return styles[status] || 'text-gray-500 dark:text-gray-400';
};

const getPriorityTextColor = (priority) => {
  const styles = {
    tinggi: 'text-red-600 dark:text-red-400',
    sedang: 'text-orange-600 dark:text-orange-400',
    rendah: 'text-blue-600 dark:text-blue-400'
  };
  return styles[priority] || 'text-gray-500 dark:text-gray-400';
};

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPhotoUrl = (foto) => {
  if (!foto) return '';
  if (/^(https?:|data:)/.test(foto)) return foto;
  return `${API_ORIGIN}${foto.startsWith('/') ? foto : `/uploads/laporan/${foto}`}`;
};

const detailLabelClass = 'text-sm font-semibold text-gray-800 dark:text-white';
const detailValueClass = 'text-sm text-gray-500 dark:text-gray-400';

export default function LaporanMasuk() {
  const [laporan, setLaporan] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [teknisiList, setTeknisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teknisiLoading, setTeknisiLoading] = useState(false); // State untuk loading teknisi
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ kategori: 'Semua Kategori', prioritas: 'Semua Prioritas', search: '' });
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [selectedTeknisi, setSelectedTeknisi] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        status: 'menunggu',
        kategori: filters.kategori !== 'Semua Kategori' ? filters.kategori : '',
        prioritas: filters.prioritas !== 'Semua Prioritas' ? filters.prioritas.toLowerCase() : '',
        search: filters.search
      };
      const res = await getLaporanMasukKT(params);
      if (res.success && res.data) {
        setLaporan(res.data.laporan || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, showToast]);

  // ============ PERBAIKAN: Fetch teknisi options dengan lebih robust ============
  const fetchTeknisiOptions = useCallback(async () => {
    setTeknisiLoading(true);
    try {
      console.log('📋 Fetching teknisi options...');
      const res = await getTeknisiOptionsKT();
      console.log('📋 Teknisi API Response:', res);
      
      if (res.success && res.data) {
        setTeknisiList(res.data);
        console.log(`✅ Successfully loaded ${res.data.length} teknisi`);
        if (res.data.length === 0) {
          console.warn('Tidak ada teknisi tersedia.');
          showToast('warning', 'Tidak ada data teknisi. Silakan tambahkan teknisi terlebih dahulu.');
        }
      } else {
        console.error('❌ Failed to load teknisi:', res);
        showToast('error', res.message || 'Gagal memuat daftar teknisi');
      }
    } catch (err) {
      console.error('❌ Error fetching teknisi:', err);
      showToast('error', err.message || 'Gagal memuat daftar teknisi');
    } finally {
      setTeknisiLoading(false);
    }
  }, [showToast]);

  // Optional: Function untuk cek jumlah teknisi (debugging)
  const checkTeknisiCount = useCallback(async () => {
    try {
      const res = await checkTeknisiCountKT();
      console.log('📊 Teknisi count check:', res);
      if (res.success && res.data) {
        console.log(`Total teknisi: ${res.data.total}, Aktif: ${res.data.aktif}, Non-aktif: ${res.data.non_aktif}`);
      }
    } catch (err) {
      console.error('Failed to check teknisi count:', err);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const fetchInitialOptions = async () => {
      try {
        // Fetch kategori dan teknisi secara parallel
        const [kategoriRes] = await Promise.all([
          getKategori(),
          fetchTeknisiOptions() // Panggil fetch teknisi
        ]);
        setKategoriList(kategoriRes.data || []);
        
        // Optional: cek jumlah teknisi untuk debugging
        checkTeknisiCount();
      } catch (err) {
        console.error('Error fetching initial options:', err);
      }
    };
    fetchInitialOptions();
  }, [fetchTeknisiOptions, checkTeknisiCount]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setSelectedTeknisi('');
    setRejectReason('');
    try {
      const res = await getLaporanMasukDetailKT(id);
      setSelectedLaporan(res.data);
    } catch (err) {
      showToast('error', err.message || 'Gagal memuat detail laporan');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedLaporan(null);
    setSelectedTeknisi('');
    setRejectReason('');
  };

  const handleTerima = async () => {
    if (!selectedLaporan) return;
    if (!selectedTeknisi) {
      showToast('error', 'Pilih teknisi terlebih dahulu');
      return;
    }
    setSubmitting(true);
    try {
      await terimaLaporanMasukKT(selectedLaporan.id, selectedTeknisi);
      showToast('success', 'Laporan disetujui dan teknisi berhasil ditugaskan');
      closeDetail();
      setPagination({ ...pagination, page: 1 });
      fetchData();
    } catch (err) {
      showToast('error', err.message || 'Gagal menyetujui laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTolak = async () => {
    if (!selectedLaporan) return;
    setSubmitting(true);
    try {
      await tolakLaporanMasukKT(selectedLaporan.id, rejectReason);
      showToast('success', 'Laporan berhasil ditolak');
      closeDetail();
      setPagination({ ...pagination, page: 1 });
      fetchData();
    } catch (err) {
      showToast('error', err.message || 'Gagal menolak laporan');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="space-y-7">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[220] px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 
          toast.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-visible">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Laporan Masuk</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kelola validasi laporan gangguan dan penugasan teknisi</p>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropdownSelect
            value={filters.kategori}
            onChange={(value) => updateFilter('kategori', value)}
            buttonClassName="h-11"
          >
            <option value="Semua Kategori">Semua Kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama_kategori}</option>
            ))}
          </DropdownSelect>
          <DropdownSelect
            value={filters.prioritas}
            onChange={(value) => updateFilter('prioritas', value)}
            buttonClassName="h-11"
          >
            <option value="Semua Prioritas">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </DropdownSelect>
          <SearchInput value={filters.search} onChange={(value) => updateFilter('search', value)} placeholder="Cari laporan, lokasi, deskripsi..." />
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
          <table className="w-full text-left text-xs min-w-[1080px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">NO</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">NAMA LENGKAP</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">KATEGORI GANGGUAN</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">PRIORITAS</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">DESKRIPSI MASALAH</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">LOKASI</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">TANGGAL & WAKTU</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">STATUS</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="9" className="py-10 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
              ) : laporan.length === 0 ? (
                <tr><td colSpan="9" className="border-t border-gray-100 dark:border-gray-700">
                  <EmptyState title="Tidak ada laporan" subtitle="Tidak ditemukan laporan dengan filter yang dipilih" />
                </td></tr>
              ) : (
                laporan.map((item, idx) => (
                  <tr key={item.id} className={`${item.is_overdue_24h ? 'bg-yellow-50/70 dark:bg-yellow-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors duration-150`}>
                    <td className="px-5 py-4 text-gray-700 dark:text-white">{idx + 1}</td>
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-white">{item.pelanggan?.nama_lengkap || '-'}</td>
                    <td className="px-5 py-4 text-gray-800 dark:text-white whitespace-nowrap">
                      <div>{item.kategori}</div>
                    </td>
                    <td className={`px-5 py-4 whitespace-nowrap ${getPriorityTextColor(item.prioritas)}`}>
                      {priorityDisplay[item.prioritas] || item.prioritas || '-'}
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-gray-700 dark:text-white">{item.deskripsi || '-'}</td>
                    <td className="px-5 py-4 max-w-xs truncate text-gray-700 dark:text-white">{item.lokasi || '-'}</td>
                    <td className="px-5 py-4 text-gray-700 dark:text-white whitespace-nowrap">
                      <div>{item.created_at_formatted || formatDateTime(item.created_at)}</div>
                      {item.is_overdue_24h && (
                        <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Lebih dari 24 jam
                        </span>
                      )}
                    </td>
                    <td className={`px-5 py-4 ${getStatusTextColor(item.status)}`}>
                      {statusDisplay[item.status] || item.status}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openDetail(item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        title={item.status === 'menunggu' ? 'Tugaskan ke Teknisi' : 'Lihat Detail'}
                        aria-label={item.status === 'menunggu' ? 'Tugaskan ke Teknisi' : 'Lihat Detail'}
                      >
                        {item.status === 'menunggu' ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M19 8v6" />
                            <path d="M22 11h-6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
            <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50">Previous</button>
            <span>Halaman {pagination.page} dari {pagination.totalPages}</span>
            <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.totalPages} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {(selectedLaporan || detailLoading) && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" onClick={closeDetail} />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detail Laporan</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Validasi laporan dan pilih teknisi penanganan</p>
                </div>
                <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {detailLoading || !selectedLaporan ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">Memuat detail...</div>
              ) : (
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Informasi Pelapor</h4>
                      <div className="space-y-3 text-sm">
                        <div><div className={detailLabelClass}>Nama</div><div className={detailValueClass}>{selectedLaporan.pelanggan?.nama_lengkap || '-'}</div></div>
                        <div><div className={detailLabelClass}>No Langganan</div><div className={detailValueClass}>{selectedLaporan.pelanggan?.no_langganan || '-'}</div></div>
                        <div><div className={detailLabelClass}>Email</div><div className={detailValueClass}>{selectedLaporan.pelanggan?.email || '-'}</div></div>
                        <div><div className={detailLabelClass}>No Telepon</div><div className={detailValueClass}>{selectedLaporan.nomor_telepon || selectedLaporan.pelanggan?.no_telp || '-'}</div></div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Deskripsi Masalah</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div><div className={detailLabelClass}>Judul Laporan</div><div className={detailValueClass}>{selectedLaporan.judul || '-'}</div></div>
                        <div><div className={detailLabelClass}>Kategori Gangguan</div><div className={detailValueClass}>{selectedLaporan.kategori?.nama_kategori || '-'}</div></div>
                        <div><div className={detailLabelClass}>Tanggal Kejadian</div><div className={detailValueClass}>{formatDate(selectedLaporan.tanggal_kejadian)}</div></div>
                        <div><div className={detailLabelClass}>Lokasi</div><div className={detailValueClass}>{selectedLaporan.lokasi || '-'}</div></div>
                        <div><div className={detailLabelClass}>Prioritas</div><div className={`text-sm font-semibold ${getPriorityTextColor(selectedLaporan.prioritas)}`}>{priorityDisplay[selectedLaporan.prioritas] || selectedLaporan.prioritas}</div></div>
                        <div><div className={detailLabelClass}>Status</div><div className={`text-sm font-semibold ${getStatusTextColor(selectedLaporan.status)}`}>{statusDisplay[selectedLaporan.status] || selectedLaporan.status}</div></div>
                        {selectedLaporan.tugas?.teknisi && (
                          <div>
                            <div className={detailLabelClass}>Teknisi Yang Menangani</div>
                            <div className={detailValueClass}>
                              {[selectedLaporan.tugas.teknisi.nama_lengkap || '-', selectedLaporan.tugas.teknisi.no_telp || selectedLaporan.tugas.teknisi.email].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}
                        <div className="sm:col-span-2"><div className={detailLabelClass}>Deskripsi Lengkap Gangguan</div><div className="mt-1 rounded-lg bg-white dark:bg-gray-800 p-3 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{selectedLaporan.deskripsi || '-'}</div></div>
                        <div className="sm:col-span-2">
                          <div className={`${detailLabelClass} mb-2`}>Foto Gangguan</div>
                          {selectedLaporan.foto ? (
                            <img loading="lazy" decoding="async" src={getPhotoUrl(selectedLaporan.foto)} alt="Foto gangguan" className="max-h-72 w-full rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                          ) : (
                            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-xs text-gray-400">Tidak ada foto gangguan</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedLaporan.status === 'menunggu' && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white">Validasi dan Penugasan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Pilih Teknisi
                            {teknisiLoading && <span className="ml-2 text-blue-500">(Memuat...)</span>}
                          </label>
                          <SearchableTeknisiSelect
                            value={selectedTeknisi}
                            onChange={setSelectedTeknisi}
                            teknisiList={teknisiList}
                            loading={teknisiLoading}
                          />
                          {teknisiList.length === 0 && !teknisiLoading && (
                            <p className="text-xs text-red-500 mt-1">
                              Belum ada teknisi tersedia. Silakan tambahkan akun teknisi terlebih dahulu.
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Catatan Penolakan</label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows="3"
                            placeholder="Isi jika laporan ditolak"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                    <button onClick={closeDetail} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Tutup
                    </button>
                    {selectedLaporan.status === 'menunggu' && (
                      <>
                        <button onClick={handleTolak} disabled={submitting} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50">
                          Tolak
                        </button>
                        <button onClick={handleTerima} disabled={submitting || teknisiLoading || teknisiList.length === 0} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50">
                          {submitting ? 'Memproses...' : 'Terima & Tugaskan'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
