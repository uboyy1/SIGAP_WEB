// API Pelanggan - SIGAP: Controller dashboard dan data referensi pelanggan.
const { Laporan, KategoriGangguan, Notifikasi } = require('../../models');

const getStats = async (req, res) => {
  try {
    const where = { pelanggan_id: req.user.id };
    const [total, menunggu, divalidasi, dalamPenanganan, selesai, ditolak, unreadNotifications] = await Promise.all([
      Laporan.count({ where }),
      Laporan.count({ where: { ...where, status: 'menunggu' } }),
      Laporan.count({ where: { ...where, status: 'divalidasi' } }),
      Laporan.count({ where: { ...where, status: 'dalam_penanganan' } }),
      Laporan.count({ where: { ...where, status: 'selesai' } }),
      Laporan.count({ where: { ...where, status: 'ditolak' } }),
      Notifikasi.count({ where: { user_id: req.user.id, is_read: false } })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        menunggu,
        divalidasi,
        dalam_penanganan: dalamPenanganan,
        selesai,
        ditolak,
        unread_notifications: unreadNotifications
      }
    });
  } catch (error) {
    console.error('Pelanggan dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getKategori = async (req, res) => {
  try {
    const kategori = await KategoriGangguan.findAll({
      attributes: ['id', 'nama_kategori'],
      order: [['nama_kategori', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: kategori
    });
  } catch (error) {
    console.error('Pelanggan get kategori error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getStats,
  getKategori
};
