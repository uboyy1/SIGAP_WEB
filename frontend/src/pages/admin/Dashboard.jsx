// Fungsi: Halaman admin untuk menampilkan dan mengelola fitur admin.
// frontend/src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api';

export default function Dashboard() {
  const chartFontSize = 12;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-10 text-gray-500 dark:text-gray-400">Memuat data...</div>;
  if (error) return <div className="text-red-500 p-10">Error: {error}</div>;
  if (!stats) return null;

  const { statistics, laporan_status_bulan_ini, charts, monthly_trend, status_distribution, recent_activities, performance_summary } = stats;
  const { incoming_reports, completed_reports, current_month, days_in_month } = charts;
  const dayCount = Number(days_in_month) || Math.max(incoming_reports?.length || 0, completed_reports?.length || 0, 1);
  const dayLabels = Array.from({ length: dayCount }, (_, index) => index + 1);
  const getDailyValue = (data, dayNumber) => Number(data?.[dayNumber - 1] || 0);

  // Line chart component untuk Laporan Masuk
  const renderIncomingLineChart = () => {
    const w = 900, h = 320, padL = 68, padR = 34, padT = 28, padB = 70;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const maxV = 25;
    const minV = 0;
    const toX = (i) => padL + (dayCount <= 1 ? 0 : (i / (dayCount - 1)) * chartW);
    const toY = (v) => padT + chartH - ((Math.min(v, maxV) - minV) / (maxV - minV)) * chartH;
    const pts = dayLabels.map((dayNumber, i) => `${toX(i)},${toY(getDailyValue(incoming_reports, dayNumber))}`).join(' ');
    const fillPts = `${padL},${padT + chartH} ${pts} ${toX(dayCount - 1)},${padT + chartH}`;
    const gridValues = [5, 10, 15, 20, 25];

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="min-w-[900px] w-full h-auto">
          {gridValues.map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={w - padR} y2={toY(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={v === 0 ? "none" : "4,4"} className="dark:stroke-gray-600" />
              <text x={padL - 12} y={toY(v) + 6} textAnchor="end" fontSize={chartFontSize} fontWeight="700" fill="#9ca3af" className="dark:fill-gray-400">{v}</text>
            </g>
          ))}
          <defs><linearGradient id="incomingAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" /></linearGradient></defs>
          <polygon points={fillPts} fill="url(#incomingAreaGradient)" />
          <polyline points={pts} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {dayLabels.map((dayNumber, i) => <circle key={dayNumber} cx={toX(i)} cy={toY(getDailyValue(incoming_reports, dayNumber))} r="5" fill="#fff" stroke="#2563eb" strokeWidth="2.5" className="dark:fill-gray-800" />)}
          {dayLabels.map((dayNumber, i) => (
            <text key={dayNumber} x={toX(i)} y={h - 18} textAnchor="middle" fontSize={chartFontSize} fontWeight="700" fill="#9ca3af" className="dark:fill-gray-400">
              {dayNumber}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // Line chart component untuk Laporan Selesai
  const renderCompletedLineChart = () => {
    const w = 900, h = 320, padL = 68, padR = 34, padT = 28, padB = 70;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const maxV = 25;
    const minV = 0;
    const toX = (i) => padL + (dayCount <= 1 ? 0 : (i / (dayCount - 1)) * chartW);
    const toY = (v) => padT + chartH - ((Math.min(v, maxV) - minV) / (maxV - minV)) * chartH;
    const pts = dayLabels.map((dayNumber, i) => `${toX(i)},${toY(getDailyValue(completed_reports, dayNumber))}`).join(' ');
    const fillPts = `${padL},${padT + chartH} ${pts} ${toX(dayCount - 1)},${padT + chartH}`;
    const gridValues = [5, 10, 15, 20, 25];

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="min-w-[900px] w-full h-auto">
          {gridValues.map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={w - padR} y2={toY(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={v === 0 ? "none" : "4,4"} className="dark:stroke-gray-600" />
              <text x={padL - 12} y={toY(v) + 6} textAnchor="end" fontSize={chartFontSize} fontWeight="700" fill="#9ca3af" className="dark:fill-gray-400">{v}</text>
            </g>
          ))}
          <defs><linearGradient id="completedAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.15" /><stop offset="100%" stopColor="#10b981" stopOpacity="0.02" /></linearGradient></defs>
          <polygon points={fillPts} fill="url(#completedAreaGradient)" />
          <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {dayLabels.map((dayNumber, i) => <circle key={dayNumber} cx={toX(i)} cy={toY(getDailyValue(completed_reports, dayNumber))} r="5" fill="#fff" stroke="#10b981" strokeWidth="2.5" className="dark:fill-gray-800" />)}
          {dayLabels.map((dayNumber, i) => (
            <text key={dayNumber} x={toX(i)} y={h - 18} textAnchor="middle" fontSize={chartFontSize} fontWeight="700" fill="#9ca3af" className="dark:fill-gray-400">
              {dayNumber}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // Trend Line Chart untuk 12 bulan
  const renderTrendLineChart = () => {
    const w = 900, h = 320, padL = 68, padR = 34, padT = 28, padB = 70;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const maxV = 100;
    const minV = 0;
    const toX = (i) => padL + (i / (monthly_trend.length - 1)) * chartW;
    const toY = (v) => padT + chartH - ((Math.min(v, maxV) - minV) / (maxV - minV)) * chartH;
    const pts = monthly_trend.map((m, i) => `${toX(i)},${toY(m.count)}`).join(' ');
    const fillPts = `${padL},${padT + chartH} ${pts} ${toX(monthly_trend.length - 1)},${padT + chartH}`;
    const gridValues = [0, 20, 40, 60, 80, 100];

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="min-w-[900px] w-full h-auto">
          {gridValues.map(v => (
            <g key={v}>
              <line x1={padL} y1={toY(v)} x2={w - padR} y2={toY(v)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" className="dark:stroke-gray-600" />
              <text x={padL - 12} y={toY(v) + 6} textAnchor="end" fontSize={chartFontSize} fontWeight="700" fill="#9ca3af" className="dark:fill-gray-400">{v}</text>
            </g>
          ))}
          <defs><linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" /></linearGradient></defs>
          <polygon points={fillPts} fill="url(#trendAreaGradient)" />
          <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {monthly_trend.map((m, i) => <circle key={i} cx={toX(i)} cy={toY(m.count)} r="5" fill="#fff" stroke="#8b5cf6" strokeWidth="2.5" className="dark:fill-gray-800" />)}
          {monthly_trend.map((m, i) => (
            <text key={i} x={toX(i)} y={h - 18} textAnchor="middle" fontSize={chartFontSize} fontWeight="700" fill="#9ca3af" className="dark:fill-gray-400">
              {m.month}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // Pie Chart untuk Distribusi Status Laporan
  const renderStatusPieChart = () => {
    const visibleStatusDistribution = status_distribution.filter(item => item.value > 0);
    const total = visibleStatusDistribution.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p className="text-sm">Belum ada data laporan bulan ini</p>
        </div>
      );
    }
    
    let cumulative = 0;
    const radius = 100;
    const center = 120;
    const slices = visibleStatusDistribution.map((item) => {
      const startAngle = -Math.PI / 2 + cumulative * 2 * Math.PI;
      const value = item.value;
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
          {visibleStatusDistribution.length === 1 ? (
            <g>
              <circle cx={center} cy={center} r={radius} fill={visibleStatusDistribution[0].color} />
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
          {status_distribution.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: item.color }} />
              <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
              <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Row 1 Cards - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-blue-600">
          <div className="flex justify-between items-center">
            <div><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.total_users}</div><div className="text-xs text-gray-500 dark:text-gray-400">Total Pengguna</div></div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div><div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statistics.total_teknisi}</div><div className="text-xs text-gray-500 dark:text-gray-400">Total Teknisi</div></div>
            <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div><div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.total_kepala_teknisi}</div><div className="text-xs text-gray-500 dark:text-gray-400">Total Kepala Teknisi</div></div>
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-card border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div><div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{performance_summary?.pengguna_aktif_24jam || 0}</div><div className="text-xs text-gray-500 dark:text-gray-400">Total Pengguna Aktif (24 Jam)</div></div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Laporan Bulanan - 12 bulan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">Trend Laporan Bulanan (12 Bulan Terakhir)</h3>
        {renderTrendLineChart()}
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-left">
          Jumlah laporan per bulan
        </div>
      </div>

      {/* Dua Chart: Laporan Masuk dan Laporan Selesai */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Laporan Masuk - {current_month}</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total: {laporan_status_bulan_ini?.total || 0} laporan</div>
          </div>
          {renderIncomingLineChart()}
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-left">
            Data per tanggal di bulan {current_month}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Laporan Selesai - {current_month}</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total: {laporan_status_bulan_ini?.selesai || 0} laporan</div>
          </div>
          {renderCompletedLineChart()}
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-left">
            Data per tanggal di bulan {current_month}
          </div>
        </div>
      </div>

      {/* Distribusi Status Laporan - Bulan Ini */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">Distribusi Status Laporan - Bulan {current_month}</h3>
        {renderStatusPieChart()}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          Persentase Selesai: <span className="font-bold text-green-600 dark:text-green-400">{laporan_status_bulan_ini?.persentase_selesai || 0}%</span>
        </div>
      </div>

      {/* Status Laporan Cards - 6 Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card">
        <h3 className="text-base font-bold mb-5 text-gray-800 dark:text-white">Detail Status Laporan - Bulan {current_month}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800 text-center">
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{laporan_status_bulan_ini?.total || 0}</div>
            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Laporan</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5 border border-yellow-100 dark:border-yellow-800 text-center">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{laporan_status_bulan_ini?.menunggu || 0}</div>
            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Menunggu</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800 text-center">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{laporan_status_bulan_ini?.divalidasi || 0}</div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Divalidasi</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-100 dark:border-orange-800 text-center">
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{laporan_status_bulan_ini?.dalam_penanganan || 0}</div>
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Dalam Penanganan</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800 text-center">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{laporan_status_bulan_ini?.selesai || 0}</div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">Selesai</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-100 dark:border-red-800 text-center">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{laporan_status_bulan_ini?.ditolak || 0}</div>
            <div className="text-sm font-medium text-red-600 dark:text-red-400">Ditolak</div>
          </div>
        </div>
      </div>

      {/* Aktivitas Sistem Terbaru (24 jam) */}
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
  <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-base font-bold text-gray-800 dark:text-white">Aktivitas Sistem Terbaru (24 jam)</h3>
  </div>
  <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
        <tr className="border-b border-gray-300 dark:border-gray-600">
          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">WAKTU</th>
          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">AKTIVITAS</th>
          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">PENGGUNA</th>
          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">ROLE</th>
          <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">TIPE</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {recent_activities && recent_activities.length > 0 ? (
          recent_activities.map((act, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors">
              <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{act.waktu}</td>
              <td className="px-6 py-4 text-gray-700 dark:text-white">{act.aktivitas}</td>
              <td className="px-6 py-4 font-medium text-gray-800 dark:text-white whitespace-nowrap">{act.pengguna}</td>
              <td className="px-6 py-4 text-gray-700 dark:text-white whitespace-nowrap">{act.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium text-gray-700 dark:text-white">{act.tipe}</span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="py-12 text-center text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Tidak ada aktivitas dalam 24 jam terakhir</p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}
