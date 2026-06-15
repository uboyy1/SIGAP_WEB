// Fungsi: Halaman kepala teknisi untuk workflow pengelolaan teknisi.
// frontend/src/pages/kepalaTeknisi/RiwayatPelaporan.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  getRiwayatPelaporanKT, 
  getRiwayatDetailKT, 
  getKategoriForKepalaTeknisi 
} from '../../services/api';
import DropdownSelect from '../../components/ui/DropdownSelect';

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
      className="h-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 pl-9 pr-3 text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
    />
  </div>
);

const EmptyState = ({ title, subtitle }) => (
  <div className="min-h-[130px] flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /><path d="M12 7v5l3 2" />
    </svg>
    <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{title}</div>
    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{subtitle}</div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

const formatDateTime = (dateValue) => {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

const getStatusDisplay = (status) => {
  const map = { 
    selesai: 'Selesai', 
    ditolak: 'Ditolak', 
    dalam_penanganan: 'Dalam Penanganan', 
    divalidasi: 'Divalidasi' 
  };
  return map[status] || status;
};

const getStatusTextColor = (status) => {
  const styles = {
    menunggu: 'text-yellow-600 dark:text-yellow-400',
    divalidasi: 'text-blue-600 dark:text-blue-400',
    dalam_penanganan: 'text-orange-600 dark:text-orange-400',
    selesai: 'text-green-600 dark:text-green-400',
    ditolak: 'text-red-600 dark:text-red-400',
  };
  return styles[status] || 'text-gray-500 dark:text-gray-400';
};

const priorityDisplay = {
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah'
};

const getPriorityTextColor = (priority) => {
  const styles = {
    tinggi: 'text-red-600 dark:text-red-400',
    sedang: 'text-orange-600 dark:text-orange-400',
    rendah: 'text-blue-600 dark:text-blue-400'
  };
  return styles[priority] || 'text-gray-500 dark:text-gray-400';
};

const detailLabelClass = 'text-sm font-semibold text-gray-800 dark:text-white';
const detailValueClass = 'text-sm text-gray-500 dark:text-gray-400';

// Data kategori statis sebagai fallback
const DEFAULT_KATEGORI = [
  { id: 1, nama_kategori: 'Air Tidak Mengalir' },
  { id: 2, nama_kategori: 'Kebocoran Pipa' },
  { id: 3, nama_kategori: 'Kualitas Air' },
  { id: 4, nama_kategori: 'Tekanan Air Bermasalah' },
  { id: 5, nama_kategori: 'Gangguan Infrastruktur (Meteran & Pipa)' },
  { id: 6, nama_kategori: 'Lainnya' }
];

export default function RiwayatPelaporan() {
  const [riwayat, setRiwayat] = useState([]);
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI); // Gunakan default dulu
  const [loading, setLoading] = useState(true);
  const [kategoriLoading, setKategoriLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });
  const [filters, setFilters] = useState({ status: "Semua Status", kategori: "Semua Jenis", search: "" });
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  }, []);

  // Fetch kategori list dari API
  const fetchKategori = useCallback(async () => {
    setKategoriLoading(true);
    try {
      console.log('📋 Fetching kategori from API...');
      const res = await getKategoriForKepalaTeknisi();
      console.log('📋 Kategori response:', res);
      
      if (res.success && res.data && res.data.length > 0) {
        setKategoriList(res.data);
        console.log(`✅ Loaded ${res.data.length} kategori from API`);
      } else {
        console.warn('⚠️ No kategori from API, using default data');
        // Tetap pakai default data
      }
    } catch (err) {
      console.error('❌ Failed to fetch kategori:', err);
      showToast('error', 'Gagal memuat data kategori, menggunakan data default');
      // Tetap pakai default data
    } finally {
      setKategoriLoading(false);
    }
  }, [showToast]);

  // Fetch data riwayat
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status !== "Semua Status" ? filters.status : "",
        kategori: filters.kategori !== "Semua Jenis" ? filters.kategori : "",
        search: filters.search
      };
      
      console.log('📋 Fetching riwayat with params:', params);
      const res = await getRiwayatPelaporanKT(params);
      
      if (res.success && res.data) {
        setRiwayat(res.data.riwayat || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch riwayat:', err);
      showToast('error', err.message || 'Gagal memuat data riwayat');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, showToast]);

  // Fetch detail laporan
  const fetchDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await getRiwayatDetailKT(id);
      if (res.success && res.data) {
        setSelectedLaporan(res.data);
      } else {
        showToast('error', res.message || 'Gagal memuat detail laporan');
      }
    } catch (err) {
      console.error('Failed to fetch detail:', err);
      showToast('error', err.message || 'Gagal memuat detail laporan');
    } finally {
      setDetailLoading(false);
    }
  };

  const openDetail = (id) => {
    fetchDetail(id);
  };

  const closeDetail = () => {
    setSelectedLaporan(null);
  };

  // Load kategori saat komponen mount
  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  // Load data saat filter atau pagination berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const goToPage = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="space-y-7">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-visible">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Riwayat Pelaporan</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Laporan yang telah ditugaskan, selesai, atau ditolak</p>
        </div>

        {/* Filter Section */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DropdownSelect 
            value={filters.status} 
            onChange={(value) => updateFilter('status', value)}
            buttonClassName="h-10 text-sm"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Dalam Penanganan">Dalam Penanganan</option>
            <option value="Divalidasi">Divalidasi</option>
          </DropdownSelect>

          <DropdownSelect 
            value={filters.kategori} 
            onChange={(value) => updateFilter('kategori', value)}
            buttonClassName="h-10 text-sm"
            disabled={kategoriLoading}
          >
            <option value="Semua Jenis">
              {kategoriLoading ? 'Memuat kategori...' : 'Semua Jenis Gangguan'}
            </option>
            {kategoriList.map((kategori) => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.nama_kategori}
              </option>
            ))}
          </DropdownSelect>

          <SearchInput 
            value={filters.search} 
            onChange={(value) => updateFilter('search', value)} 
            placeholder="Cari judul, lokasi, atau deskripsi..." 
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
          <table className="w-full text-left text-xs min-w-[1000px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">NO</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">NAMA LENGKAP</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">KATEGORI GANGGUAN</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">PRIORITAS</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">DESKRIPSI MASALAH</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">LOKASI</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">TANGGAL & WAKTU</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">STATUS</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center">
                    <LoadingSpinner />
                   </td>
                 </tr>
              ) : riwayat.length === 0 ? (
                <tr>
                  <td colSpan="9" className="border-t border-gray-100 dark:border-gray-700">
                    <EmptyState 
                      title="Tidak ada riwayat" 
                      subtitle="Belum ada laporan yang ditugaskan atau diproses" 
                    />
                   </td>
                 </tr>
              ) : (
                riwayat.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-700 dark:text-white">
                      {idx + 1 + (pagination.page - 1) * pagination.limit}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{item.pelapor}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-white">{item.kategori}</td>
                    <td className={`px-4 py-3 ${getPriorityTextColor(item.prioritas)}`}>
                      {priorityDisplay[item.prioritas] || item.prioritas || '-'}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-700 dark:text-white" title={item.deskripsi || '-'}>
                      {item.deskripsi || '-'}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-gray-700 dark:text-white" title={item.lokasi || '-'}>
                      {item.lokasi || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-white whitespace-nowrap">
                      {item.updated_at_formatted || formatDateTime(item.updated_at)}
                    </td>
                    <td className={`px-4 py-3 ${getStatusTextColor(item.status)}`}>
                      {getStatusDisplay(item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
            <button 
              onClick={() => goToPage(pagination.page - 1)} 
              disabled={pagination.page === 1} 
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ← Previous
            </button>
            <span>Halaman {pagination.page} dari {pagination.totalPages}</span>
            <button 
              onClick={() => goToPage(pagination.page + 1)} 
              disabled={pagination.page === pagination.totalPages} 
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLaporan && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" onClick={closeDetail} />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detail Laporan</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Informasi lengkap laporan gangguan
                  </p>
                </div>
                <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {detailLoading ? (
                <div className="p-10 text-center">
                  <LoadingSpinner />
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Memuat detail...</p>
                </div>
              ) : (
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* Informasi Pelapor */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Informasi Pelapor
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className={detailLabelClass}>Nama Lengkap</div>
                        <div className={detailValueClass}>{selectedLaporan.pelanggan?.nama_lengkap || '-'}</div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>No Langganan</div>
                        <div className={detailValueClass}>{selectedLaporan.pelanggan?.no_langganan || '-'}</div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>Email</div>
                        <div className={detailValueClass}>{selectedLaporan.pelanggan?.email || '-'}</div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>No Telepon</div>
                        <div className={detailValueClass}>{selectedLaporan.nomor_telepon || selectedLaporan.pelanggan?.no_telp || '-'}</div>
                      </div>
                      <div className="md:col-span-2">
                        <div className={detailLabelClass}>Alamat</div>
                        <div className={detailValueClass}>{selectedLaporan.pelanggan?.alamat || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Informasi Laporan */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Informasi Gangguan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className={detailLabelClass}>Judul Laporan</div>
                        <div className={detailValueClass}>{selectedLaporan.judul || '-'}</div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>Kategori Gangguan</div>
                        <div className={detailValueClass}>{selectedLaporan.kategori?.nama_kategori || '-'}</div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>Tanggal Kejadian</div>
                        <div className={detailValueClass}>
                          {formatDate(selectedLaporan.tanggal_kejadian)}
                        </div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>Lokasi</div>
                        <div className={detailValueClass}>{selectedLaporan.lokasi || '-'}</div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>Prioritas</div>
                        <div className={`text-sm font-semibold ${getPriorityTextColor(selectedLaporan.prioritas)}`}>
                          {priorityDisplay[selectedLaporan.prioritas] || selectedLaporan.prioritas}
                        </div>
                      </div>
                      <div>
                        <div className={detailLabelClass}>Status</div>
                        <div className={`text-sm font-semibold ${getStatusTextColor(selectedLaporan.status)}`}>
                          {getStatusDisplay(selectedLaporan.status)}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className={detailLabelClass}>Deskripsi Lengkap</div>
                        <div className="mt-1 rounded-lg bg-white dark:bg-gray-800 p-3 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                          {selectedLaporan.deskripsi || '-'}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className={`${detailLabelClass} mb-2`}>Foto Gangguan</div>
                        {selectedLaporan.foto ? (
                          <img loading="lazy" decoding="async" 
                            src={selectedLaporan.foto} 
                            alt="Foto gangguan" 
                            className="max-h-72 w-full rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                            onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                          />
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-xs text-gray-400">
                            Tidak ada foto
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informasi Penanganan */}
                  {selectedLaporan.tugas && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-10-10z" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Informasi Penanganan
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className={detailLabelClass}>Teknisi Penanganan</div>
                          <div className={detailValueClass}>
                            {[selectedLaporan.tugas.teknisi?.nama_lengkap || '-', selectedLaporan.tugas.teknisi?.no_telp || selectedLaporan.tugas.teknisi?.email].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <div>
                          <div className={detailLabelClass}>Tanggal Ditugaskan</div>
                          <div className={detailValueClass}>
                            {formatDateTime(selectedLaporan.tugas.tanggal_ditugaskan)}
                          </div>
                        </div>
                        {selectedLaporan.tugas.tanggal_diambil && (
                          <div>
                            <div className={detailLabelClass}>Tanggal Diambil</div>
                            <div className={detailValueClass}>
                              {formatDateTime(selectedLaporan.tugas.tanggal_diambil)}
                            </div>
                          </div>
                        )}
                        {selectedLaporan.tugas.tanggal_selesai && (
                          <div>
                            <div className={detailLabelClass}>Tanggal Selesai</div>
                            <div className={detailValueClass}>
                              {formatDateTime(selectedLaporan.tugas.tanggal_selesai)}
                            </div>
                          </div>
                        )}
                        {selectedLaporan.tugas.catatan_teknisi && (
                          <div className="md:col-span-2">
                            <div className={detailLabelClass}>Catatan</div>
                            <div className="mt-1 rounded-lg bg-white dark:bg-gray-800 p-3 text-sm text-gray-500 dark:text-gray-400">
                              {selectedLaporan.tugas.catatan_teknisi}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={closeDetail} 
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
