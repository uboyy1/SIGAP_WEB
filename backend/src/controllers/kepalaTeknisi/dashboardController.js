// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/dashboardController.js
const { Op } = require('sequelize');
const { User, Laporan, Tugas, KategoriGangguan } = require('../../models');

// Helper function untuk format tanggal
function formatDateTime(dateString) {
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
}

function getStatusDisplay(status) {
  const map = {
    'menunggu': 'Menunggu',
    'divalidasi': 'Divalidasi',
    'ditolak': 'Ditolak',
    'dalam_penanganan': 'Dalam Penanganan',
    'selesai': 'Selesai'
  };
  return map[status] || status;
}

// Get dashboard statistics untuk Kepala Teknisi
const getDashboardStats = async (req, res) => {
  try {
    // Get current month and year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Date range for current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Stats cards (HAPUS Total Pelanggan)
    const totalTeknisi = await User.count({ where: { role: 'teknisi' } });
    const totalLaporan = await Laporan.count();
    const laporanSelesai = await Laporan.count({ where: { status: 'selesai' } });
    const gangguanAktif = await Laporan.count({ 
      where: { status: { [Op.in]: ['dalam_penanganan', 'divalidasi'] } }
    });

    // Status distribution for CURRENT MONTH ONLY
    const statusDistribution = [
      { 
        label: 'Menunggu', 
        value: await Laporan.count({ 
          where: { 
            status: 'menunggu',
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          } 
        }), 
        color: '#eab308' 
      },
      { 
        label: 'Divalidasi', 
        value: await Laporan.count({ 
          where: { 
            status: 'divalidasi',
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          } 
        }), 
        color: '#3b82f6' 
      },
      { 
        label: 'Dalam Penanganan', 
        value: await Laporan.count({ 
          where: { 
            status: 'dalam_penanganan',
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          } 
        }), 
        color: '#f97316' 
      },
      { 
        label: 'Selesai', 
        value: await Laporan.count({ 
          where: { 
            status: 'selesai',
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          } 
        }), 
        color: '#10b981' 
      },
      { 
        label: 'Ditolak', 
        value: await Laporan.count({ 
          where: { 
            status: 'ditolak',
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          } 
        }), 
        color: '#ef4444' 
      }
    ];

    // Jenis Gangguan Dominan (all time)
    const kategoriGangguan = await KategoriGangguan.findAll();
    const jenisGangguanDominan = [];
    for (const kategori of kategoriGangguan) {
      const count = await Laporan.count({
        where: { kategori_gangguan_id: kategori.id }
      });
      if (count > 0) {
        jenisGangguanDominan.push({
          nama: kategori.nama_kategori,
          jumlah: count
        });
      }
    }
    jenisGangguanDominan.sort((a, b) => b.jumlah - a.jumlah);

    // Top Performers - MAX 3 teknisi dengan performa terbaik
    const teknisiList = await User.findAll({
      where: { role: 'teknisi', is_active: true },
      attributes: ['id', 'nama_lengkap', 'username', 'foto_base64']
    });

    const allPerformers = await Promise.all(teknisiList.map(async (teknisi) => {
      const tugas = await Tugas.findAll({ where: { teknisi_id: teknisi.id } });
      const total = tugas.length;
      const selesaiCount = tugas.filter(t => t.status === 'selesai').length;
      const successRate = total > 0 ? Math.round((selesaiCount / total) * 100) : 0;
      
      let rating = 'Perlu Ditingkatkan';
      let ratingColor = '#ef4444';
      if (successRate >= 80) {
        rating = 'Sangat Baik';
        ratingColor = '#10b981';
      } else if (successRate >= 60) {
        rating = 'Baik';
        ratingColor = '#3b82f6';
      } else if (successRate >= 40) {
        rating = 'Cukup';
        ratingColor = '#f59e0b';
      }
      
      return {
        id: teknisi.id,
        nama: teknisi.nama_lengkap,
        username: teknisi.username,
        foto: teknisi.foto_base64,
        total_tugas: total,
        selesai: selesaiCount,
        success_rate: successRate,
        rating: rating,
        rating_color: ratingColor
      };
    }));
    
    // Sort by success rate and take top 3
    const topPerformers = allPerformers
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 3);

    // Laporan Terbaru - SEMUA laporan (tidak difilter) dengan format tanggal yang benar
    const laporanTerbaru = await Laporan.findAll({
      include: [
        { model: User, as: 'pelanggan', attributes: ['nama_lengkap', 'username'] },
        { model: KategoriGangguan, as: 'kategori', attributes: ['nama_kategori'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    const formattedLaporanTerbaru = laporanTerbaru.map(l => {
      const createdAt = l.createdAt || l.created_at;
      const updatedAt = l.updatedAt || l.updated_at;
      return {
      id: l.id,
      pelapor: l.pelanggan?.nama_lengkap || 'Anonim',
      kategori: l.kategori?.nama_kategori || '-',
      deskripsi: l.deskripsi?.substring(0, 100) + (l.deskripsi?.length > 100 ? '...' : ''),
      lokasi: l.lokasi,
      waktu: createdAt,
      waktu_formatted: formatDateTime(createdAt),
      updated_at: updatedAt,
      updated_at_formatted: formatDateTime(updatedAt),
      status: l.status,
      status_display: getStatusDisplay(l.status),
      prioritas: l.prioritas
      };
    });

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_teknisi: totalTeknisi,
          total_laporan: totalLaporan,
          laporan_selesai: laporanSelesai,
          gangguan_aktif: gangguanAktif
        },
        status_distribution: statusDistribution,
        jenis_gangguan_dominan: jenisGangguanDominan.slice(0, 5),
        top_performers: topPerformers,
        laporan_terbaru: formattedLaporanTerbaru,
        total_laporan_terbaru: formattedLaporanTerbaru.length,
        current_month: monthNames[currentMonth]
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

module.exports = { getDashboardStats };
