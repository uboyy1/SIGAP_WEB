// Fungsi: Controller admin untuk menangani logika fitur admin.
// backend/src/controllers/admin/dashboardController.js
const { User, Laporan, Tugas, KategoriGangguan, Notifikasi, LaporanDarurat, AktivitasLog, sequelize } = require('../../models');
const { Op } = require('sequelize');

// Helper function to format time
function formatWaktu(date) {
  const now = new Date();
  const diffMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} jam lalu`;
  return `${Math.floor(diffMinutes / 1440)} hari lalu`;
}

function getWitaDayRange(date = new Date()) {
  const witaOffsetMs = 8 * 60 * 60 * 1000;
  const witaDate = new Date(date.getTime() + witaOffsetMs);
  const startUtcMs = Date.UTC(
    witaDate.getUTCFullYear(),
    witaDate.getUTCMonth(),
    witaDate.getUTCDate()
  ) - witaOffsetMs;

  return {
    start: new Date(startUtcMs),
    end: new Date(startUtcMs + (24 * 60 * 60 * 1000) - 1)
  };
}

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Get today's boundaries in WITA, so the count resets at 00:00 WITA.
    const { start: startOfDay, end: endOfDay } = getWitaDayRange(now);
    
    // Total users by role
    const totalPelanggan = await User.count({ where: { role: 'pelanggan' } });
    const totalTeknisi = await User.count({ where: { role: 'teknisi' } });
    const totalKepalaTeknisi = await User.count({ where: { role: 'kepala_teknisi' } });
    const totalAdmin = await User.count({ where: { role: 'admin' } });
    
    // ============ TREND LAPORAN BULANAN (12 BULAN TERAKHIR) ============
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyTrend = [];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentYear - (currentMonth - i < 0 ? 1 : 0);
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59);
      const count = await Laporan.count({
        where: { 
          created_at: { [Op.between]: [start, end] }
        }
      });
      monthlyTrend.push({ 
        month: months[monthIndex], 
        count
      });
    }
    
    // ============ CHART 1: Laporan Masuk per Hari (Bulan Ini) ============
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const incomingReports = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59);
      const count = await Laporan.count({
        where: {
          created_at: { [Op.between]: [dayStart, dayEnd] }
        }
      });
      incomingReports.push(count);
    }
    
    // ============ CHART 2: Laporan Selesai per Hari (Bulan Ini) ============
    const completedReports = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), day, 23, 59, 59);
      const count = await Laporan.count({
        where: {
          status: 'selesai',
          updated_at: { [Op.between]: [dayStart, dayEnd] }
        }
      });
      completedReports.push(count);
    }
    
    // Laporan statistics (current month only)
    const totalLaporanBulanIni = await Laporan.count({
      where: { created_at: { [Op.between]: [startOfMonth, endOfMonth] } }
    });
    
    const laporanSelesaiBulanIni = await Laporan.count({
      where: {
        status: 'selesai',
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });
    
    const laporanMenungguBulanIni = await Laporan.count({
      where: {
        status: 'menunggu',
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });
    
    const laporanDivalidasiBulanIni = await Laporan.count({
      where: {
        status: 'divalidasi',
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });
    
    const laporanDalamPenangananBulanIni = await Laporan.count({
      where: {
        status: 'dalam_penanganan',
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });
    
    const laporanDitolakBulanIni = await Laporan.count({
      where: {
        status: 'ditolak',
        created_at: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });
    
    // Hitung persentase selesai
    const persentaseSelesai = totalLaporanBulanIni > 0 
      ? Math.round((laporanSelesaiBulanIni / totalLaporanBulanIni) * 100) 
      : 0;
    
    // Status distribution for CURRENT MONTH ONLY
    const statusDistribution = [
      { label: 'Menunggu', value: laporanMenungguBulanIni, color: '#eab308' },
      { label: 'Divalidasi', value: laporanDivalidasiBulanIni, color: '#3b82f6' },
      { label: 'Dalam Penanganan', value: laporanDalamPenangananBulanIni, color: '#f97316' },
      { label: 'Selesai', value: laporanSelesaiBulanIni, color: '#10b981' },
      { label: 'Ditolak', value: laporanDitolakBulanIni, color: '#ef4444' }
    ];
    
    // ============ AKTIVITAS SISTEM (dari tabel aktivitas_log) ============
    const recentLogs = await AktivitasLog.findAll({
      where: {
        created_at: { [Op.between]: [startOfDay, endOfDay] }
      },
      order: [['created_at', 'DESC']],
      limit: 15
    });
    
    const finalActivities = recentLogs.map(log => {
      let tipe = '';
      let badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      
      switch (log.tipe_aktivitas) {
        case 'login': 
          tipe = 'Login'; 
          badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'; 
          break;
        case 'laporan_baru': 
          tipe = 'Laporan Baru'; 
          badgeColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'; 
          break;
        case 'ambil_tugas': 
          tipe = 'Ambil Tugas'; 
          badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'; 
          break;
        case 'laporan_darurat': 
          tipe = 'Laporan Darurat'; 
          badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; 
          break;
        case 'beri_tugas': 
          tipe = 'Penugasan'; 
          badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'; 
          break;
        default: 
          tipe = 'Info'; 
          badgeColor = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      }
      
      let roleDisplay = log.user_role === 'kepala_teknisi' ? 'kepala teknisi' : log.user_role;
      
      return {
        waktu: formatWaktu(log.created_at),
        aktivitas: log.deskripsi,
        pengguna: log.user_nama,
        role: roleDisplay,
        tipe: tipe,
        badge_color: badgeColor
      };
    });
    
    // ============ TOTAL PENGGUNA AKTIF 24 JAM ============
    const activeUsers = await User.count({
      where: {
        last_login: { [Op.between]: [startOfDay, endOfDay] }
      }
    });
    
    // Get month name in Indonesian
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonthName = monthNames[now.getMonth()];
    
    return res.status(200).json({
      success: true,
      data: {
        statistics: {
          total_pelanggan: totalPelanggan,
          total_teknisi: totalTeknisi,
          total_kepala_teknisi: totalKepalaTeknisi,
          total_admin: totalAdmin,
          total_users: totalPelanggan + totalTeknisi + totalKepalaTeknisi + totalAdmin
        },
        laporan_status_bulan_ini: {
          total: totalLaporanBulanIni,
          menunggu: laporanMenungguBulanIni,
          divalidasi: laporanDivalidasiBulanIni,
          dalam_penanganan: laporanDalamPenangananBulanIni,
          selesai: laporanSelesaiBulanIni,
          ditolak: laporanDitolakBulanIni,
          persentase_selesai: persentaseSelesai
        },
        charts: {
          incoming_reports: incomingReports,
          completed_reports: completedReports,
          current_month: currentMonthName,
          days_in_month: daysInMonth
        },
        monthly_trend: monthlyTrend,
        status_distribution: statusDistribution,
        recent_activities: finalActivities,
        performance_summary: {
          pengguna_aktif_24jam: activeUsers
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get laporan for admin
const getLaporanAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (status && status !== 'Semua Status') {
      let statusMap = {
        'Menunggu': 'menunggu',
        'Divalidasi': 'divalidasi',
        'Dalam Penanganan': 'dalam_penanganan',
        'Selesai': 'selesai',
        'Ditolak': 'ditolak'
      };
      whereClause.status = statusMap[status] || status.toLowerCase();
    }
    
    if (search) {
      whereClause.judul = { [Op.like]: `%${search}%` };
    }
    
    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'pelanggan',
          attributes: ['nama_lengkap', 'no_langganan', 'no_telp']
        },
        {
          model: KategoriGangguan,
          as: 'kategori',
          attributes: ['nama_kategori']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: {
        laporan: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get laporan admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  getDashboardStats,
  getLaporanAdmin
};
