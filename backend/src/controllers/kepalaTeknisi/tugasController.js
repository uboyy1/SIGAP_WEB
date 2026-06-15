// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/tugasController.js
const { Tugas, Laporan, User, KategoriGangguan } = require('../../models');

const getSemuaTugas = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = {};
    if (status && status !== 'Semua') whereClause.status = status;

    const { count, rows } = await Tugas.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Laporan, 
          as: 'laporan', 
          include: [
            { model: User, as: 'pelanggan', attributes: ['nama_lengkap', 'no_telp'] }, 
            { model: KategoriGangguan, as: 'kategori', attributes: ['nama_kategori'] }
          ] 
        },
        { model: User, as: 'teknisi', attributes: ['id', 'nama_lengkap'] },
        { model: User, as: 'kepala_teknisi', attributes: ['nama_lengkap'] }
      ],
      limit: parseInt(limit), 
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        tugas: rows, 
        pagination: { 
          total: count, 
          page: parseInt(page), 
          limit: parseInt(limit), 
          totalPages: Math.ceil(count / limit) 
        } 
      } 
    });
  } catch (error) {
    console.error('Get semua tugas error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

module.exports = { getSemuaTugas };