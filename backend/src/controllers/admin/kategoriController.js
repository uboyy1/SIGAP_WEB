// Fungsi: Controller admin untuk menangani logika fitur admin.
// backend/src/controllers/admin/kategoriController.js
const { KategoriGangguan } = require('../../models');

// Get all kategori gangguan
const getAllKategori = async (req, res) => {
  try {
    console.log('[Kategori] Memuat semua kategori...');
    
    const kategori = await KategoriGangguan.findAll({
      attributes: ['id', 'nama_kategori'],
      order: [['id', 'ASC']]
    });
    
    console.log(`✅ [Kategori] Found ${kategori.length} kategori`);
    
    return res.status(200).json({
      success: true,
      data: kategori
    });
  } catch (error) {
    console.error('❌ [Kategori] Get kategori error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

module.exports = { getAllKategori };
