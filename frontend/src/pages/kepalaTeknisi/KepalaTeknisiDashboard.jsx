// Fungsi: Halaman kepala teknisi untuk workflow pengelolaan teknisi.
// frontend/src/pages/kepalaTeknisi/KepalaTeknisiDashboard.jsx
import { useState, useEffect } from 'react';
import { getKepalaTeknisiCompleteDashboard } from '../../services/api';

// Mendapatkan nama bulan saat ini
const getCurrentMonthName = () => {
  const now = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[now.getMonth()];
};

// Format tanggal Indonesia yang BENAR (dd/mm/yyyy, HH:MM)
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  } catch {
    return '-';
  }
};

// Pie Chart Component untuk Distribusi Status Laporan
const StatusPieChart = ({ data, currentMonth }) => {
  const chartFontSize = 16;
  const orderedLabels = ['Menunggu', 'Divalidasi', 'Dalam Penanganan', 'Selesai', 'Ditolak'];
  
  const orderedData = orderedLabels.map(label => {
    const found = data.find(item => item.label === label);
    return found || { label, value: 0, color: '#9ca3af' };
  });
  const visibleData = orderedData.filter((item) => Number(item.value) > 0);

  const total = visibleData.reduce((sum, item) => sum + Number(item.value), 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">Belum ada data laporan untuk bulan {currentMonth}</p>
        <p className="text-xs text-gray-400 mt-1">Total: 0 laporan</p>
      </div>
    );
  }

  let cumulative = 0;
  const radius = 100;
  const center = 120;
  const slices = visibleData.map((item) => {
    const startAngle = -Math.PI / 2 + cumulative * 2 * Math.PI;
    const value = Number(item.value);
    const sweep = (value / total) * 2 * Math.PI;
    cumulative += value / total;
    const endAngle = startAngle + sweep;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;
    const midAngle = startAngle + sweep / 2;
    const lx = center + (radius * 0.6) * Math.cos(midAngle);
    const ly = center + (radius * 0.6) * Math.sin(midAngle);
    const percentage = ((value / total) * 100).toFixed(0);
    return {
      d: `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: item.color,
      label: percentage,
      lx, ly,
      name: item.label,
      value
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${center * 2} ${center * 2}`} className="w-56 h-56 sm:w-64 sm:h-64">
        {visibleData.length === 1 ? (
          <g>
            <circle cx={center} cy={center} r={radius} fill={visibleData[0].color} />
            <text x={center} y={center + 6} textAnchor="middle" fontSize={chartFontSize} fill="#fff" fontWeight="700">
              100%
            </text>
          </g>
        ) : (
          slices.map((s, i) => (
            <g key={i}>
              <path d={s.d} fill={s.color} />
              <text x={s.lx} y={s.ly + 6} textAnchor="middle" fontSize={chartFontSize} fill="#fff" fontWeight="700">
                {s.label}%
              </text>
            </g>
          ))
        )}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 w-full">
        {orderedData.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }} />
            <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
            <span className="font-bold text-gray-900 dark:text-white">{Number(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat Card Component (HAPUS Total Pelanggan)
const StatCard = ({ value, label, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'file':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default: return null;
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'blue': return 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'purple': return 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'yellow': return 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'green': return 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'orange': return 'border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400';
    }
  };

  const colorClasses = getColorClass();
  const borderColor = colorClasses.split(' ')[0];
  const textColor = colorClasses.split(' ')[1];
  const bgColor = colorClasses.split(' ')[2] + ' ' + (colorClasses.split(' ')[3] || '');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 ${borderColor} hover:shadow-lg transition-shadow flex items-center justify-between`}>
      <div>
        <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor} ${textColor}`}>
        {getIcon()}
      </div>
    </div>
  );
};

const statusDisplay = {
  menunggu: 'Menunggu',
  divalidasi: 'Divalidasi',
  dalam_penanganan: 'Dalam Penanganan',
  selesai: 'Selesai',
  ditolak: 'Ditolak'
};

const priorityDisplay = {
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah'
};

const getStatusTextColor = (status) => {
  const styles = {
    menunggu: 'text-yellow-700 dark:text-yellow-400',
    divalidasi: 'text-blue-700 dark:text-blue-400',
    dalam_penanganan: 'text-orange-700 dark:text-orange-400',
    selesai: 'text-green-700 dark:text-green-400',
    ditolak: 'text-red-700 dark:text-red-400'
  };
  return styles[status] || 'text-gray-700 dark:text-white';
};

const getPriorityTextColor = (priority) => {
  const styles = {
    tinggi: 'text-red-700 dark:text-red-400',
    sedang: 'text-orange-700 dark:text-orange-400',
    rendah: 'text-blue-700 dark:text-blue-400'
  };
  return styles[priority] || 'text-gray-700 dark:text-white';
};

export default function KepalaTeknisiDashboard() {
  const [dashboard, setDashboard] = useState({
    stats: {},
    status_distribution: [],
    jenis_gangguan_dominan: [],
    top_performers: [],
    laporan_terbaru: [],
    total_laporan_terbaru: 0,
    current_month: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getKepalaTeknisiCompleteDashboard();
        if (res.success && res.data) {
          setDashboard(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats, status_distribution, jenis_gangguan_dominan, top_performers, laporan_terbaru } = dashboard;

  const currentMonth = getCurrentMonthName();
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-card transition-transform duration-150 hover:scale-[1.01] dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">Pusat Monitoring</p>
          <h2 className="mt-1 text-lg font-bold text-gray-800 dark:text-white">Dashboard Kepala Teknisi</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Pantau laporan, teknisi, dan kondisi operasional hari ini.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-right dark:border-gray-700 dark:bg-gray-700/40">
          <div className="font-mono text-2xl font-bold text-gray-900 dark:text-white">{formattedTime}</div>
          <div className="mt-1 text-xs font-medium capitalize text-gray-500 dark:text-gray-300">{formattedDate}</div>
        </div>
      </div>

      {/* Stat Cards - Hanya 4 Cards (TANPA Total Pelanggan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard value={stats.total_teknisi || 0} label="Total Teknisi" color="yellow" icon="users" />
        <StatCard value={stats.total_laporan || 0} label="Total Laporan" color="purple" icon="file" />
        <StatCard value={stats.laporan_selesai || 0} label="Laporan Selesai" color="green" icon="check" />
        <StatCard value={stats.gangguan_aktif || 0} label="Gangguan Aktif" color="orange" icon="alert" />
      </div>

      {/* Distribusi Status Laporan - Bulan Ini */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">Distribusi Status Laporan - Bulan {currentMonth}</h3>
        <StatusPieChart data={status_distribution} currentMonth={currentMonth} />
      </div>

      {/* Jenis Gangguan Dominan & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Jenis Gangguan Dominan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">Jenis Gangguan Dominan</h3>
          {jenis_gangguan_dominan.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">Belum ada data gangguan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jenis_gangguan_dominan.map((item, idx) => {
                const total = jenis_gangguan_dominan.reduce((sum, i) => sum + i.jumlah, 0);
                const percentage = Math.round((item.jumlah / total) * 100);
                const colors = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.nama}</span>
                      <span className="text-gray-500 dark:text-gray-400">{item.jumlah} laporan ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">Top Performers</h3>
          {top_performers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-sm">Belum ada data teknisi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {top_performers.map((teknisi, idx) => (
                <div key={teknisi.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {teknisi.foto ? (
                          <img loading="lazy" decoding="async" src={teknisi.foto} alt={teknisi.nama} className="w-full h-full object-cover" />
                        ) : (
                          <span>{teknisi.nama?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white text-sm">{teknisi.nama}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">@{teknisi.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Selesai:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{teknisi.selesai}</span>
                      <span className="text-xs text-gray-500">/</span>
                      <span className="text-xs text-gray-500">{teknisi.total_tugas}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-gray-500">Rate: </span>
                      <span className="font-semibold" style={{ color: teknisi.rating_color }}>{teknisi.success_rate}%</span>
                    </div>
                    <div className="text-xs mt-0.5">
                      <span className="text-gray-500">Performa: </span>
                      <span className="font-semibold" style={{ color: teknisi.rating_color }}>{teknisi.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Laporan Terbaru Table - Dengan format tanggal yang benar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">Laporan Terbaru</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Semua laporan gangguan pelanggan</p>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">NO</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">NAMA LENGKAP</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">KATEGORI GANGGUAN</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">PRIORITAS</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">DESKRIPSI MASALAH</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">LOKASI</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">TANGGAL & WAKTU</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {laporan_terbaru.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <svg className="w-14 h-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium">Belum ada laporan</p>
                  </td>
                </tr>
              ) : (
                laporan_terbaru.map((laporan, idx) => (
                  <tr key={laporan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors">
                    <td className="px-6 py-4 text-gray-800 dark:text-white font-medium whitespace-nowrap">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{laporan.pelapor}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{laporan.kategori}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${getPriorityTextColor(laporan.prioritas)}`}>
                      {priorityDisplay[laporan.prioritas] || laporan.prioritas || '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-700 dark:text-white" title={laporan.deskripsi}>
                      {laporan.deskripsi || '-'}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-700 dark:text-white" title={laporan.lokasi}>
                      {laporan.lokasi || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">
                      {(laporan.waktu_formatted || formatDateTime(laporan.waktu)).replace(' WITA', '').replace(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})/, '$1, $2')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${getStatusTextColor(laporan.status)}`}>
                      {statusDisplay[laporan.status] || laporan.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
