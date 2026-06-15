// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/analisisKinerjaController.js
const { Op } = require('sequelize');
const { User, Tugas, Laporan } = require('../../models');

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fullMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const getMonthRange = (year, month) => ({
  start: new Date(year, month, 1, 0, 0, 0, 0),
  end: new Date(year, month + 1, 0, 23, 59, 59, 999)
});

const getDurationHours = (start, end) => {
  if (!start || !end) return null;
  const diff = new Date(end) - new Date(start);
  if (Number.isNaN(diff) || diff < 0) return null;
  return diff / (1000 * 60 * 60);
};

const getAnalisisKinerja = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthRange = getMonthRange(currentYear, currentMonth);

    // ============ TREND CHART DATA (12 bulan terakhir) ============
    const trend = {
      labels: [],
      masuk: [],
      selesai: []
    };

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const { start, end } = getMonthRange(year, month);

      trend.labels.push(monthNames[month]);
      trend.masuk.push(await Tugas.count({
        where: { tanggal_ditugaskan: { [Op.between]: [start, end] } }
      }));
      trend.selesai.push(await Tugas.count({
        where: { 
          status: 'selesai', 
          tanggal_selesai: { [Op.between]: [start, end] } 
        }
      }));
    }

    // ============ KINERJA TEKNISI PER BULAN INI ============
    const teknisiList = await User.findAll({ 
      where: { role: 'teknisi', is_active: true }, 
      attributes: ['id', 'nama_lengkap', 'username', 'foto_base64', 'no_telp'] 
    });
    
    const kinerjaTeknisi = await Promise.all(teknisiList.map(async (teknisi) => {
      // Tugas yang ditugaskan ke teknisi ini (bulan ini)
      const tugas = await Tugas.findAll({
        where: {
          teknisi_id: teknisi.id,
          tanggal_ditugaskan: { [Op.between]: [currentMonthRange.start, currentMonthRange.end] }
        }
      });
      
      // Tugas yang selesai bulan ini
      const selesaiBulanIni = await Tugas.findAll({
        where: {
          teknisi_id: teknisi.id,
          status: 'selesai',
          tanggal_selesai: { [Op.between]: [currentMonthRange.start, currentMonthRange.end] }
        }
      });

      const total = tugas.length;
      const diambil = tugas.filter(t => t.tanggal_diambil || ['dalam_proses', 'selesai'].includes(t.status)).length;
      const selesai = selesaiBulanIni.length;
      const dalamProses = tugas.filter(t => ['menunggu_diambil', 'dalam_proses'].includes(t.status)).length;
      const successRate = diambil > 0 ? Math.round((selesai / diambil) * 100) : 0;
      
      // Hitung rata-rata durasi pengerjaan
      const durations = selesaiBulanIni
        .map(t => getDurationHours(t.tanggal_diambil, t.tanggal_selesai))
        .filter(value => value !== null);
      const avgWaktu = durations.length > 0
        ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length) * 10) / 10
        : 0;
      
      // Rating performa
      let performa = 'Perlu Ditingkatkan';
      if (successRate >= 80) performa = 'Sangat Baik';
      else if (successRate >= 60) performa = 'Baik';
      else if (successRate >= 40) performa = 'Cukup';
      
      return {
        id: teknisi.id, 
        nama: teknisi.nama_lengkap,
        username: teknisi.username,
        foto: teknisi.foto_base64,
        total_tugas: total, 
        diambil,
        selesai, 
        dalam_proses: dalamProses,
        success_rate: successRate, 
        avg_waktu: avgWaktu,
        performa
      };
    }));

    // ============ SUMMARY ============
    const totalTugas = kinerjaTeknisi.reduce((sum, item) => sum + item.total_tugas, 0);
    const totalDiambil = kinerjaTeknisi.reduce((sum, item) => sum + item.diambil, 0);
    const totalSelesai = kinerjaTeknisi.reduce((sum, item) => sum + item.selesai, 0);
    const totalDalamProses = kinerjaTeknisi.reduce((sum, item) => sum + item.dalam_proses, 0);
    const avgSuccessRate = totalDiambil > 0 ? Math.round((totalSelesai / totalDiambil) * 100) : 0;
    
    // Top 3 teknisi berdasarkan success rate
    const topTeknisi = [...kinerjaTeknisi]
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 3)
      .map(t => t.nama);
    
    const currentMonthLabel = `${fullMonthNames[currentMonth]} ${currentYear}`;

    return res.status(200).json({
      success: true,
      data: {
        trend,
        current_month_label: currentMonthLabel,
        summary: {
          total_tugas: totalTugas,
          diambil: totalDiambil,
          selesai: totalSelesai,
          dalam_proses: totalDalamProses,
          avg_success_rate: avgSuccessRate,
          top_teknisi: topTeknisi.join(', ') || '-'
        },
        kinerjaTeknisi: kinerjaTeknisi.sort((a, b) => b.success_rate - a.success_rate || b.total_tugas - a.total_tugas)
      }
    });
  } catch (error) {
    console.error('Get analisis kinerja error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + error.message 
    });
  }
};

module.exports = { getAnalisisKinerja };