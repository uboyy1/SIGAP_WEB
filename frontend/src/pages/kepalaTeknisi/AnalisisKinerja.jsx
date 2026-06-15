// Fungsi: Halaman kepala teknisi untuk workflow pengelolaan teknisi.
// frontend/src/pages/kepalaTeknisi/AnalisisKinerja.jsx
import { useState, useEffect } from 'react';
import { getAnalisisKinerjaKT } from '../../services/api';

// ============ LINE CHART COMPONENT ============
const TrendLineChart = ({ trend }) => {
  const axisFontSize = 16;
  const labels = trend?.labels || [];
  const masuk = trend?.masuk || [];
  const selesai = trend?.selesai || [];
  const w = 1600;
  const h = 420;
  const pad = { l: 58, r: 46, t: 32, b: 58 };
  const chartW = w - pad.l - pad.r;
  const chartH = h - pad.t - pad.b;
  const maxV = 100;
  const steps = [0, 20, 40, 60, 80, 100];
  
  const toX = (i) => pad.l + (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * chartW);
  const toY = (v) => pad.t + chartH - (Math.min(v, maxV) / maxV) * chartH;
  const toPoints = (data) => data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');

  if (labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-[460px] text-gray-400">
        <p>Belum ada data trend</p>
      </div>
    );
  }

  return (
    <div className="min-h-[320px] w-full overflow-hidden" style={{ aspectRatio: `${w} / ${h}` }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {steps.map((v) => (
          <g key={v}>
            <line 
              x1={pad.l} y1={toY(v)} 
              x2={w - pad.r} y2={toY(v)} 
              stroke="#e5e7eb" strokeWidth="1" 
              strokeDasharray={v === 0 ? 'none' : '5,5'} 
              className="dark:stroke-gray-600" 
            />
            <text x={pad.l - 12} y={toY(v) + 6} textAnchor="end" fontSize={axisFontSize} fontWeight="700" fill="#8a96a8" className="dark:fill-gray-400">
              {v}
            </text>
          </g>
        ))}
        
        {/* Area fill untuk masuk */}
        <defs>
          <linearGradient id="masukGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="selesaiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        
        {/* Area chart masuk */}
        <polygon 
          points={`${pad.l},${pad.t + chartH} ${toPoints(masuk)} ${toX(labels.length - 1)},${pad.t + chartH}`} 
          fill="url(#masukGradient)" 
        />
        
        {/* Area chart selesai */}
        <polygon 
          points={`${pad.l},${pad.t + chartH} ${toPoints(selesai)} ${toX(labels.length - 1)},${pad.t + chartH}`} 
          fill="url(#selesaiGradient)" 
        />
        
        {/* Lines */}
        <polyline points={toPoints(masuk)} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={toPoints(selesai)} fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Circles untuk masuk */}
        {masuk.map((v, i) => (
          <circle key={`masuk-${i}`} cx={toX(i)} cy={toY(v)} r="4.5" fill="#fff" stroke="#22c55e" strokeWidth="2.5" className="dark:fill-gray-800" />
        ))}
        
        {/* Circles untuk selesai */}
        {selesai.map((v, i) => (
          <circle key={`selesai-${i}`} cx={toX(i)} cy={toY(v)} r="4.5" fill="#fff" stroke="#eab308" strokeWidth="2.5" className="dark:fill-gray-800" />
        ))}
        
        {/* Labels */}
        {labels.map((label, i) => (
          <text key={`label-${i}`} x={toX(i)} y={h - 18} textAnchor="middle" fontSize={axisFontSize} fontWeight="700" fill="#8a96a8" className="dark:fill-gray-400">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// ============ STAT CARD ============
const StatCard = ({ value, label, icon, color }) => {
  const getIcon = () => {
    switch (icon) {
      case 'file':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'hand':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11V7a2 2 0 114 0v4m0-2V5a2 2 0 114 0v6m0-2V7a2 2 0 114 0v8a6 6 0 01-6 6h-2a6 6 0 01-6-6v-3a2 2 0 114 0v3" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'check':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      default: return null;
    }
  };

  const colorMap = {
    blue: 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    yellow: 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    orange: 'border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    green: 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    purple: 'border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
  };

  const classes = colorMap[color] || colorMap.blue;
  const [borderColor, textColor, ...bgColors] = classes.split(' ');
  const bgColor = bgColors.join(' ');

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

// ============ MAIN COMPONENT ============
export default function AnalisisKinerja() {
  const [performance, setPerformance] = useState({
    trend: { labels: [], masuk: [], selesai: [] },
    current_month_label: '',
    summary: {
      total_tugas: 0,
      diambil: 0,
      selesai: 0,
      dalam_proses: 0,
      avg_success_rate: 0,
      top_teknisi: '-'
    },
    kinerjaTeknisi: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await getAnalisisKinerjaKT();
        if (res.success && res.data) {
          setPerformance(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch performance data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getPerformaColor = (performa) => {
    switch (performa) {
      case 'Sangat Baik': return 'text-green-600 dark:text-green-400';
      case 'Baik': return 'text-blue-600 dark:text-blue-400';
      case 'Cukup': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-7">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <StatCard value={performance.summary?.total_tugas || 0} label="Total Tugas" color="blue" icon="file" />
        <StatCard value={performance.summary?.diambil || 0} label="Tugas Diambil" color="yellow" icon="hand" />
        <StatCard value={performance.summary?.dalam_proses || 0} label="Tugas Diproses" color="orange" icon="alert" />
        <StatCard value={performance.summary?.selesai || 0} label="Tugas Selesai" color="green" icon="check" />
        <StatCard value={`${performance.summary?.avg_success_rate || 0}%`} label="Success Rate" color="purple" icon="chart" />
      </div>

      {/* Trend Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Tren Kinerja Teknisi</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Perbandingan tugas masuk dan selesai selama 12 bulan terakhir
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> 
                Tugas Masuk
              </span>
              <span className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> 
                Tugas Selesai
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <TrendLineChart trend={performance.trend} />
        </div>
      </div>

      {/* Tabel Kinerja Teknisi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Analisis Kinerja Teknisi</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Periode bulan {performance.current_month_label || '-'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '560px' }}>
          <table className="w-full text-left text-sm min-w-[1000px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">NO</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">TEKNISI</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">TOTAL TUGAS</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">DIAKSES</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">SELESAI</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">AKTIF</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">SUCCESS RATE</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">RATA-RATA DURASI</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">PERFORMA</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {performance.kinerjaTeknisi.length === 0 ? (
                <tr>
                  <td colSpan="9" className="border-t border-gray-100 dark:border-gray-700">
                    <div className="min-h-[130px] flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                      <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3" />
                        <path d="M8 11c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3Z" />
                        <path d="M2 20a6 6 0 0 1 12 0" />
                        <path d="M14 17a5 5 0 0 1 8 3" />
                      </svg>
                      <div className="text-xs font-bold text-gray-600 dark:text-gray-300">Tidak ada data teknisi</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        Belum ada data kinerja teknisi untuk periode ini
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                performance.kinerjaTeknisi.map((teknisi, index) => (
                  <tr key={teknisi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-800 dark:text-white whitespace-nowrap">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {teknisi.foto ? (
                            <img loading="lazy" decoding="async" src={teknisi.foto} alt={teknisi.nama} className="w-full h-full object-cover" />
                          ) : (
                            <span>{teknisi.nama?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">{teknisi.nama}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">@{teknisi.username || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-semibold">{teknisi.total_tugas}</td>
                    <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400 font-semibold">{teknisi.diambil}</td>
                    <td className="px-4 py-3 text-green-600 dark:text-green-400 font-semibold">{teknisi.selesai}</td>
                    <td className="px-4 py-3 text-orange-500">{teknisi.dalam_proses}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700 dark:text-white">{teknisi.success_rate}%</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-white">{teknisi.avg_waktu} jam</td>
                    <td className={`px-4 py-3 font-semibold ${getPerformaColor(teknisi.performa)}`}>
                      {teknisi.performa}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer dengan ringkasan */}
      </div>
    </div>
  );
}
