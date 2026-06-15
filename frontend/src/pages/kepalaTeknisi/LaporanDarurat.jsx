// Fungsi: Halaman kepala teknisi untuk workflow pengelolaan teknisi.
// frontend/src/pages/kepalaTeknisi/LaporanDarurat.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getLaporanDaruratKT, updateLaporanDaruratStatusKT } from '../../services/api';
import DropdownSelect from '../../components/ui/DropdownSelect';

// ============ SEARCH INPUT COMPONENT ============
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

// ============ EMPTY STATE ============
const EmptyState = ({ title, subtitle }) => (
  <div className="min-h-[130px] flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9H9l-3-9H2" />
      <path d="M5 3h14l-3 9h-8L5 3z" />
    </svg>
    <div className="text-xs font-bold text-gray-600 dark:text-gray-300">{title}</div>
    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{subtitle}</div>
  </div>
);

// ============ FORMAT DATE HELPER ============
const formatDate = (dateString, withTime = false) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  if (withTime) {
    return date.toLocaleString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  return date.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

// ============ STATUS COLOR ============
const getStatusTextColor = (status) => {
  const styles = {
    dilaporkan: 'text-blue-600 dark:text-blue-400',
    diproses: 'text-orange-500 dark:text-orange-400',
    selesai: 'text-green-600 dark:text-green-400'
  };
  return styles[status] || 'text-gray-700 dark:text-white';
};

// ============ DETAIL ITEM COMPONENT ============
const DetailItem = ({ label, value, className = '' }) => (
  <div>
    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{label}</div>
    <div className={`mt-1 text-sm text-gray-800 dark:text-white ${className}`}>{value || '-'}</div>
  </div>
);

// ============ VIEW ICON ============
const ViewIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ============ MAIN COMPONENT ============
export default function LaporanDarurat() {
  const [laporanAktif, setLaporanAktif] = useState([]);
  const [riwayatLaporan, setRiwayatLaporan] = useState([]);
  const [loadingAktif, setLoadingAktif] = useState(true);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);
  const [filterAktif, setFilterAktif] = useState({ jenis: "Semua Kendala", search: "" });
  const [filterRiwayat, setFilterRiwayat] = useState({ search: "" });
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  
  // State untuk modal catatan
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteAction, setNoteAction] = useState(null); // 'process' or 'complete'
  const [noteLaporan, setNoteLaporan] = useState(null);
  const [noteText, setNoteText] = useState('');

  const showToast = useCallback((type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  }, []);

  const fetchLaporanAktif = useCallback(async () => {
    setLoadingAktif(true);
    try {
      const params = {
        status: 'aktif',
        jenis: filterAktif.jenis !== "Semua Kendala" ? filterAktif.jenis : "",
        search: filterAktif.search,
        limit: 1000
      };
      const res = await getLaporanDaruratKT(params);
      if (res.success && res.data) {
        setLaporanAktif(res.data.laporan || []);
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Gagal memuat laporan darurat');
    } finally {
      setLoadingAktif(false);
    }
  }, [filterAktif, showToast]);

  const fetchRiwayatLaporan = useCallback(async () => {
    setLoadingRiwayat(true);
    try {
      const res = await getLaporanDaruratKT({
        status: 'Selesai',
        search: filterRiwayat.search,
        limit: 1000
      });
      if (res.success && res.data) {
        setRiwayatLaporan(res.data.laporan || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRiwayat(false);
    }
  }, [filterRiwayat]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchLaporanAktif();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLaporanAktif]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRiwayatLaporan();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchRiwayatLaporan]);

  const handleStatusChange = async (id, status, catatan) => {
    try {
      await updateLaporanDaruratStatusKT(id, status, catatan);
      showToast('success', `Status laporan berhasil diubah menjadi ${status === 'selesai' ? 'Selesai' : 'Dalam Penanganan'}`);
      fetchLaporanAktif();
      fetchRiwayatLaporan();
      return true;
    } catch (err) {
      showToast('error', err.message);
      return false;
    }
  };

  // Fungsi untuk membuka modal input catatan
  const openNoteModal = (laporan, action) => {
    setNoteLaporan(laporan);
    setNoteAction(action);
    setNoteText('');
    setShowNoteModal(true);
  };

  // Fungsi untuk memproses dengan catatan
  const handleProcessWithNote = async () => {
    if (!noteLaporan) return;
    const success = await handleStatusChange(noteLaporan.id, 'diproses', noteText);
    if (success) {
      setShowNoteModal(false);
      setNoteLaporan(null);
      setNoteText('');
    }
  };

  // Fungsi untuk menyelesaikan dengan catatan
  const handleCompleteWithNote = async () => {
    if (!noteLaporan) return;
    const success = await handleStatusChange(noteLaporan.id, 'selesai', noteText);
    if (success) {
      setShowNoteModal(false);
      setNoteLaporan(null);
      setNoteText('');
    }
  };

  const handleProcessFromDetail = async () => {
    if (!selectedLaporan) return;
    // Buka modal dengan action process
    openNoteModal(selectedLaporan, 'process');
  };

  const handleCompleteFromDetail = async () => {
    if (!selectedLaporan) return;
    // Buka modal dengan action complete
    openNoteModal(selectedLaporan, 'complete');
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* LAPORAN DARURAT AKTIF SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Laporan Darurat Aktif</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Laporan darurat yang perlu dipantau dan ditangani
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4">
          <SearchInput
            value={filterAktif.search}
            onChange={(value) => setFilterAktif({ ...filterAktif, search: value })}
            placeholder="Cari laporan darurat aktif..."
          />
          <DropdownSelect 
            value={filterAktif.jenis} 
            onChange={(value) => setFilterAktif({ ...filterAktif, jenis: value })}
          >
            <option value="Semua Kendala">Semua Kendala</option>
            <option value="Infrastruktur">Infrastruktur</option>
            <option value="Operasional">Operasional</option>
            <option value="Pelayanan">Pelayanan</option>
            <option value="Sumber Daya">Sumber Daya</option>
            <option value="Lainnya">Lainnya</option>
          </DropdownSelect>
        </div>

        {/* Tabel Laporan Aktif */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
          <table className="w-full text-left text-sm min-w-[1100px]">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 text-gray-700 dark:text-gray-300 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">NO</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">TEKNISI</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">JUDUL LAPORAN</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">JENIS KENDALA</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">LOKASI</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">TANGGAL KEJADIAN</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">WAKTU LAPOR</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">STATUS</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loadingAktif ? (
                <tr><td colSpan="9" className="py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Memuat laporan darurat...</span>
                  </div>
                </td></tr>
              ) : laporanAktif.length === 0 ? (
                <tr><td colSpan="9" className="border-t border-gray-100 dark:border-gray-700">
                  <EmptyState 
                    title="Tidak ada laporan darurat aktif"
                    subtitle="Semua laporan darurat sudah selesai ditangani"
                  />
                </td></tr>
              ) : (
                laporanAktif.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{item.teknisi}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{item.judul}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {item.jenis_kendala}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-700 dark:text-white" title={item.lokasi}>
                      {item.lokasi}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">
                      {formatDate(item.tanggal_kejadian)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">
                      {formatDate(item.created_at, true)}
                    </td>
                    <td className={`px-6 py-4 font-medium whitespace-nowrap ${getStatusTextColor(item.status)}`}>
                      {item.status_display}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLaporan(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40 transition-colors"
                        title="Lihat detail laporan darurat"
                      >
                        <ViewIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          Menampilkan {laporanAktif.length} laporan darurat aktif
        </div>
      </div>

      {/* RIWAYAT LAPORAN DARURAT SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Riwayat Laporan Darurat</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Laporan darurat yang sudah selesai ditangani
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <SearchInput
            value={filterRiwayat.search}
            onChange={(value) => setFilterRiwayat({ ...filterRiwayat, search: value })}
            placeholder="Cari riwayat laporan darurat..."
          />
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
          <table className="w-full text-left text-sm min-w-[1100px]">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 text-gray-700 dark:text-gray-300 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">NO</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">TEKNISI</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">JUDUL LAPORAN</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">JENIS KENDALA</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">LOKASI</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">TANGGAL KEJADIAN</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">WAKTU SELESAI</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">CATATAN</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loadingRiwayat ? (
                <tr><td colSpan="9" className="py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Memuat riwayat...</span>
                  </div>
                </td></tr>
              ) : riwayatLaporan.length === 0 ? (
                <tr><td colSpan="9" className="border-t border-gray-100 dark:border-gray-700">
                  <EmptyState 
                    title="Belum ada riwayat laporan darurat"
                    subtitle="Laporan darurat yang selesai akan muncul di tabel ini"
                  />
                </td></tr>
              ) : (
                riwayatLaporan.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{item.teknisi}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{item.judul}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{item.jenis_kendala}</td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-700 dark:text-white" title={item.lokasi}>{item.lokasi}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{formatDate(item.tanggal_kejadian)}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{formatDate(item.updated_at, true)}</td>
                    <td className="px-6 py-4 max-w-sm truncate text-gray-700 dark:text-white" title={item.catatan || '-'}>
                      {item.catatan || '-'}
                    </td>
                    <td className={`px-6 py-4 font-medium whitespace-nowrap ${getStatusTextColor(item.status)}`}>
                      {item.status_display}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          Menampilkan {riwayatLaporan.length} riwayat laporan darurat
        </div>
      </div>

      {/* MODAL DETAIL LAPORAN DARURAT DENGAN FOTO */}
      {selectedLaporan && createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-all duration-300 animate-fadeIn"
            onClick={() => setSelectedLaporan(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto">
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl transform transition-all duration-300 animate-modalIn dark:bg-gray-800"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Laporan Darurat</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Informasi lengkap laporan darurat dari teknisi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLaporan(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-5">
              {/* Grid 2 kolom untuk info utama */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <DetailItem label="Teknisi Pelapor" value={selectedLaporan.teknisi} />
                <DetailItem 
                  label="Status" 
                  value={selectedLaporan.status_display} 
                  className={getStatusTextColor(selectedLaporan.status)} 
                />
                <DetailItem label="Judul Laporan" value={selectedLaporan.judul} />
                <DetailItem label="Jenis Kendala" value={selectedLaporan.jenis_kendala} />
                <DetailItem label="Tanggal Kejadian" value={formatDate(selectedLaporan.tanggal_kejadian)} />
                <DetailItem label="Waktu Dilaporkan" value={formatDate(selectedLaporan.created_at, true)} />
                <div className="md:col-span-2">
                  <DetailItem label="Lokasi Kejadian" value={selectedLaporan.lokasi} />
                </div>
                <div className="md:col-span-2">
                  <DetailItem label="Deskripsi Laporan" value={selectedLaporan.deskripsi} />
                </div>
                {selectedLaporan.rekomendasi && (
                  <div className="md:col-span-2">
                    <DetailItem label="Rekomendasi Tindak Lanjut" value={selectedLaporan.rekomendasi} />
                  </div>
                )}
                {selectedLaporan.catatan && (
                  <div className="md:col-span-2">
                    <DetailItem label="Catatan Kepala Teknisi" value={selectedLaporan.catatan} />
                  </div>
                )}
              </div>

              {/* FOTO LAPORAN DARURAT */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="22 14 16 8 6 18 2 14" />
                  </svg>
                  Dokumentasi Foto
                </h4>
                {selectedLaporan.foto ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <img loading="lazy" decoding="async" 
                      src={selectedLaporan.foto} 
                      alt="Foto laporan darurat" 
                      className="w-full max-h-[400px] object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                        e.target.alt = 'Gambar tidak dapat dimuat';
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="22 14 16 8 6 18 2 14" />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada foto yang dilampirkan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer dengan aksi */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSelectedLaporan(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Tutup
              </button>
              {selectedLaporan.status === 'dilaporkan' && (
                <button
                  onClick={handleProcessFromDetail}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Proses Laporan
                </button>
              )}
              {selectedLaporan.status === 'diproses' && (
                <button
                  onClick={handleCompleteFromDetail}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  Selesaikan Laporan
                </button>
              )}
            </div>
          </div>
          </div>
        </>,
        document.body
      )}

      {/* MODAL INPUT CATATAN UNTUK PROSES LAPORAN DARURAT */}
      {showNoteModal && noteLaporan && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" onClick={() => setShowNoteModal(false)} />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {noteAction === 'process' ? 'Proses Laporan Darurat' : 'Selesaikan Laporan Darurat'}
                </h3>
                <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Laporan:</strong> {noteLaporan.judul}
                </p>
                
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Catatan untuk Teknisi
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={
                    noteAction === 'process'
                      ? 'Masukkan instruksi untuk teknisi...'
                      : 'Masukkan catatan penyelesaian...'
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Catatan ini akan dikirimkan sebagai notifikasi ke teknisi.
                </p>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={noteAction === 'process' ? handleProcessWithNote : handleCompleteWithNote}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold"
                >
                  Konfirmasi
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
