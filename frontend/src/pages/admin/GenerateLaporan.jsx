// Fungsi: Halaman admin untuk menampilkan dan mengelola fitur admin.
// frontend/src/pages/admin/GenerateLaporan.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getLaporanFilter, getKategori } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DropdownSelect from '../../components/ui/DropdownSelect';

export default function GenerateLaporan() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [dariTgl, setDariTgl] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [sampaiTgl, setSampaiTgl] = useState(today.toISOString().split('T')[0]);
  const [status, setStatus] = useState('Semua Status');
  const [kategoriId, setKategoriId] = useState('Semua Jenis');
  const [prioritas, setPrioritas] = useState('Semua Prioritas');
  const [kategoriList, setKategoriList] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch kategori untuk filter
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await getKategori();
        setKategoriList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKategori();
  }, []);

  // Fetch data laporan berdasarkan filter
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        dari_tanggal: dariTgl,
        sampai_tanggal: sampaiTgl,
        status,
        kategori_id: kategoriId,
        prioritas,
      };
      const res = await getLaporanFilter(params);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dariTgl, sampaiTgl, status, kategoriId, prioritas]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    if (!showPreview) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showPreview]);

  // ========== PARSING TANGGAL YANG AMAN (UNIVERSAL) ==========
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    // Coba parsing langsung (ISO, timestamp, dll)
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatTanggalWaktu = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTanggalIndonesia = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return '-';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const displayStatus = {
    menunggu: 'Menunggu',
    divalidasi: 'Divalidasi',
    dalam_penanganan: 'Dalam Penanganan',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
  };

  const displayPrioritas = {
    tinggi: 'Tinggi',
    sedang: 'Sedang',
    rendah: 'Rendah',
  };

  const getTeknisiName = (item) => item.tugas?.teknisi?.nama_lengkap || '-';

  const getStatusTextColor = (status) => {
    const styles = {
      menunggu: 'text-yellow-700 dark:text-yellow-400',
      divalidasi: 'text-blue-700 dark:text-blue-400',
      dalam_penanganan: 'text-orange-700 dark:text-orange-400',
      selesai: 'text-green-700 dark:text-green-400',
      ditolak: 'text-red-700 dark:text-red-400',
    };
    return styles[status] || 'text-gray-700 dark:text-white';
  };

  // ========== EXPORT PDF ==========
  const exportToPDF = () => {
    if (results.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setProperties({ title: 'Laporan Gangguan Air PDAM', author: 'SIGAP' });
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, doc.internal.pageSize.width, 16, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text('Laporan Gangguan Air PDAM', 14, 10.5);
    doc.setTextColor(33, 37, 41);
    doc.setFontSize(11);
    doc.text(`Periode: ${formatTanggalIndonesia(dariTgl)} s/d ${formatTanggalIndonesia(sampaiTgl)}`, 14, 25);

    const kategoriNama = kategoriId === 'Semua Jenis'
      ? 'Semua'
      : kategoriList.find((k) => k.id == kategoriId)?.nama_kategori || '-';
    doc.setFontSize(10);
    doc.text(`Status: ${status} | Prioritas: ${prioritas} | Jenis Gangguan: ${kategoriNama} | Total: ${results.length} laporan`, 14, 32);

    const tableColumn = [
      'No',
      'Pelapor',
      'Judul Laporan',
      'Kategori Gangguan',
      'Deskripsi Masalah',
      'Lokasi Kejadian',
      'Tanggal & Waktu',
      'Prioritas',
      'Status',
      'Teknisi Menangani',
    ];
    const tableRows = results.map((item, index) => [
      index + 1,
      `${item.pelanggan?.nama_lengkap || '-'}\n${item.nomor_telepon || item.pelanggan?.no_telp || '-'}`,
      item.judul || '-',
      item.kategori?.nama_kategori || '-',
      item.deskripsi || '-',
      item.lokasi || '-',
      formatTanggalWaktu(item.createdAt || item.created_at),
      displayPrioritas[item.prioritas] || item.prioritas || '-',
      displayStatus[item.status] || item.status,
      getTeknisiName(item),
    ]);

    autoTable(doc, {
      startY: 38,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.8, valign: 'top', overflow: 'linebreak' },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 24, left: 8, right: 8 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 26 },
        4: { cellWidth: 48 },
        5: { cellWidth: 34 },
        6: { cellWidth: 23 },
        7: { cellWidth: 17 },
        8: { cellWidth: 20 },
        9: { cellWidth: 25 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Dicetak: ${new Date().toLocaleString('id-ID')} | SIGAP - Sistem Informasi Gangguan Air PDAM`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    doc.save(`laporan_gangguan_${dariTgl}_sd_${sampaiTgl}.pdf`);
  };

  // ========== EXPORT EXCEL ==========
  const exportToExcel = () => {
    if (results.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const excelData = results.map((item, index) => ({
      No: index + 1,
      'Pelapor': `${item.pelanggan?.nama_lengkap || '-'} / ${item.nomor_telepon || item.pelanggan?.no_telp || '-'}`,
      'Judul Laporan': item.judul || '-',
      'Kategori Gangguan': item.kategori?.nama_kategori || '-',
      'Deskripsi Masalah': item.deskripsi || '-',
      'Lokasi Kejadian': item.lokasi || '-',
      'Tanggal & Waktu': formatTanggalWaktu(item.createdAt || item.created_at),
      Prioritas: displayPrioritas[item.prioritas] || item.prioritas || '-',
      Status: displayStatus[item.status] || item.status,
      'Teknisi Yang Menangani': getTeknisiName(item),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 30 },
      { wch: 24 },
      { wch: 48 },
      { wch: 34 },
      { wch: 20 },
      { wch: 12 },
      { wch: 18 },
      { wch: 26 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Gangguan');
    XLSX.writeFile(wb, `laporan_gangguan_${dariTgl}_sd_${sampaiTgl}.xlsx`);
  };

  const previewModal = showPreview ? createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-all duration-300 animate-fadeIn"
        onClick={() => setShowPreview(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] overflow-y-auto">
      <div
        className="my-8 flex max-h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transform transition-all duration-300 animate-modalIn dark:bg-gray-800"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-report-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 id="preview-report-title" className="text-xl font-bold text-gray-800 dark:text-white">Pratinjau Laporan</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded dark:hover:text-gray-300"
            aria-label="Tutup pratinjau laporan"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-auto p-6">
          <table className="w-full min-w-[900px] overflow-hidden rounded-xl bg-white text-left text-xs shadow-2xl dark:bg-gray-800">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Pelapor</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Prioritas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {results.slice(0, 10).map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{item.pelanggan?.nama_lengkap || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{item.judul || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{item.kategori?.nama_kategori || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{displayPrioritas[item.prioritas] || item.prioritas || '-'}</td>
                  <td className="px-4 py-3"><span className={getStatusTextColor(item.status)}>{displayStatus[item.status] || item.status}</span></td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{formatTanggalWaktu(item.createdAt || item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-xl shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-xl rounded-b-none">
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              className="w-5 h-5"
            >
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold">Generate Laporan</h2>
            <p className="text-white/75 text-xs">
              Ekspor dan kelola data laporan gangguan
            </p>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-gray-800 rounded-t-none rounded-b-xl shadow-card overflow-hidden">
        <div className="p-6">
          <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">
            Filter Laporan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Dari Tanggal
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={dariTgl}
                onChange={(e) => setDariTgl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Sampai Tanggal
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={sampaiTgl}
                onChange={(e) => setSampaiTgl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Status Laporan
              </label>
              <DropdownSelect
                buttonClassName="h-10 text-sm"
                value={status}
                onChange={setStatus}
              >
                {[
                  'Semua Status',
                  'Menunggu',
                  'Divalidasi',
                  'Dalam Penanganan',
                  'Selesai',
                  'Ditolak',
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </DropdownSelect>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Jenis Gangguan
              </label>
              <DropdownSelect
                buttonClassName="h-10 text-sm"
                value={kategoriId}
                onChange={setKategoriId}
              >
                <option value="Semua Jenis">Semua Jenis</option>
                {kategoriList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </DropdownSelect>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Prioritas
              </label>
              <DropdownSelect
                buttonClassName="h-10 text-sm"
                value={prioritas}
                onChange={setPrioritas}
              >
                {['Semua Prioritas', 'Tinggi', 'Sedang', 'Rendah'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </DropdownSelect>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Hasil Laporan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Hasil Laporan
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowPreview(true)}
                disabled={results.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Pratinjau
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M6 9V3h12v6M6 21h12v-6H6v6z" />
                  <path d="M18 9H6v6h12V9z" />
                </svg>
                PDF
              </button>
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              Memuat data...
            </div>
          ) : results.length === 0 ? (
            <div className="p-10 text-center text-gray-400 dark:text-gray-500">
              Tidak ada data laporan
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
              <table className="w-full text-xs text-left min-w-[1400px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">NO</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">PELAPOR</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">JUDUL LAPORAN</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">KATEGORI GANGGUAN</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">DESKRIPSI MASALAH</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">LOKASI KEJADIAN</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">TANGGAL & WAKTU</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">PRIORITAS</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">STATUS</th>
                    <th className="px-4 py-3 text-gray-600 dark:text-gray-300">TEKNISI YANG MENANGANI</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {results.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-4 py-4 text-gray-800 dark:text-white">{i + 1}</td>
                      <td className="px-4 py-4 font-medium text-gray-800 dark:text-white">
                        <div>{r.pelanggan?.nama_lengkap || '-'}</div>
                        <div className="text-gray-500 dark:text-gray-300">{r.nomor_telepon || r.pelanggan?.no_telp || '-'}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-800 dark:text-white">{r.judul || '-'}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">{r.kategori?.nama_kategori || '-'}</td>
                      <td className="px-4 py-4 max-w-sm truncate text-gray-700 dark:text-white" title={r.deskripsi || '-'}>{r.deskripsi || '-'}</td>
                      <td className="px-4 py-4 max-w-xs truncate text-gray-700 dark:text-white" title={r.lokasi || '-'}>{r.lokasi || '-'}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white whitespace-nowrap">{formatTanggalWaktu(r.createdAt || r.created_at)}</td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">{displayPrioritas[r.prioritas] || r.prioritas || '-'}</td>
                      <td className="px-4 py-4">
                        <span className={`font-medium ${getStatusTextColor(r.status)}`}>
                          {displayStatus[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 dark:text-white">{getTeknisiName(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {previewModal}
    </div>
  );
}
