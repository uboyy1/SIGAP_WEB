// Fungsi: Controller admin untuk menangani logika fitur admin.
const { Laporan, User, KategoriGangguan, Notifikasi, Tugas } = require('../../models');
const { Op } = require('sequelize');

// Get all laporan with filters (for admin)
const getAllLaporan = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '', kategori = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (status && status !== 'Semua Status') {
      const statusMap = {
        'Menunggu': 'menunggu',
        'Divalidasi': 'divalidasi',
        'Dalam Penanganan': 'dalam_penanganan',
        'Selesai': 'selesai',
        'Ditolak': 'ditolak'
      };
      whereClause.status = statusMap[status] || status.toLowerCase();
    }
    
    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { judul: { [Op.like]: `%${search}%` } },
          { deskripsi: { [Op.like]: `%${search}%` } },
          { lokasi: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'pelanggan',
          attributes: ['id', 'nama_lengkap', 'no_langganan', 'no_telp', 'email', 'foto_profil']
        },
        {
          model: KategoriGangguan,
          as: 'kategori',
          attributes: ['id', 'nama_kategori']
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
    console.error('Get all laporan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get single laporan by ID
const getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await Laporan.findByPk(id, {
      include: [
        {
          model: User,
          as: 'pelanggan',
          attributes: ['id', 'nama_lengkap', 'no_langganan', 'no_telp', 'email', 'foto_profil']
        },
        {
          model: KategoriGangguan,
          as: 'kategori',
          attributes: ['id', 'nama_kategori']
        }
      ]
    });
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: laporan
    });
  } catch (error) {
    console.error('Get laporan by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Update laporan status
const updateLaporanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;
    
    const laporan = await Laporan.findByPk(id);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    
    const oldStatus = laporan.status;
    await laporan.update({ status });
    
    // Create notification for pelanggan
    await Notifikasi.create({
      user_id: laporan.pelanggan_id,
      laporan_id: laporan.id,
      title: `Status Laporan: ${getStatusDisplayName(status)}`,
      message: `Laporan "${laporan.judul}" statusnya telah berubah dari ${getStatusDisplayName(oldStatus)} menjadi ${getStatusDisplayName(status)}.${catatan ? `\n\nCatatan: ${catatan}` : ''}`,
      type: getNotificationType(status),
      catatan_teknisi: catatan
    });
    
    return res.status(200).json({
      success: true,
      message: 'Status laporan berhasil diperbarui',
      data: { 
        id: laporan.id,
        status: laporan.status,
        status_display: getStatusDisplayName(status)
      }
    });
  } catch (error) {
    console.error('Update laporan status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Delete laporan
const deleteLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const laporan = await Laporan.findByPk(id);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    
    await laporan.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete laporan error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get laporan statistics for admin
const getLaporanStats = async (req, res) => {
  try {
    const total = await Laporan.count();
    const menunggu = await Laporan.count({ where: { status: 'menunggu' } });
    const divalidasi = await Laporan.count({ where: { status: 'divalidasi' } });
    const dalamPenanganan = await Laporan.count({ where: { status: 'dalam_penanganan' } });
    const selesai = await Laporan.count({ where: { status: 'selesai' } });
    const ditolak = await Laporan.count({ where: { status: 'ditolak' } });
    
    return res.status(200).json({
      success: true,
      data: {
        total,
        menunggu,
        divalidasi,
        dalam_penanganan: dalamPenanganan,
        selesai,
        ditolak
      }
    });
  } catch (error) {
    console.error('Get laporan stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

function getStatusDisplayName(status) {
  const names = {
    'menunggu': 'Menunggu',
    'divalidasi': 'Divalidasi',
    'ditolak': 'Ditolak',
    'dalam_penanganan': 'Dalam Penanganan',
    'selesai': 'Selesai'
  };
  return names[status] || status;
}

function getNotificationType(status) {
  const types = {
    'menunggu': 'pengajuan',
    'divalidasi': 'info',
    'ditolak': 'danger',
    'dalam_penanganan': 'dalam_penanganan',
    'selesai': 'selesai'
  };
  return types[status] || 'info';
}

// Get laporan with filters (untuk generate laporan)
const getLaporanWithFilters = async (req, res) => {
  try {
    const { dari_tanggal, sampai_tanggal, status, kategori_id, prioritas } = req.query;
    const { Op } = require('sequelize');
    let whereClause = {};

    if (dari_tanggal && sampai_tanggal) {
      whereClause.created_at = {
        [Op.between]: [new Date(dari_tanggal), new Date(sampai_tanggal + ' 23:59:59')]
      };
    }
    if (status && status !== 'Semua Status') {
      const statusMap = {
        'Menunggu': 'menunggu',
        'Divalidasi': 'divalidasi',
        'Dalam Penanganan': 'dalam_penanganan',
        'Selesai': 'selesai',
        'Ditolak': 'ditolak'
      };
      whereClause.status = statusMap[status] || status.toLowerCase();
    }
    if (kategori_id && kategori_id !== 'Semua Jenis') {
      whereClause.kategori_gangguan_id = parseInt(kategori_id);
    }
    if (prioritas && prioritas !== 'Semua Prioritas') {
      const prioritasMap = {
        Tinggi: 'tinggi',
        Sedang: 'sedang',
        Rendah: 'rendah'
      };
      whereClause.prioritas = prioritasMap[prioritas] || prioritas.toLowerCase();
    }

    const laporan = await Laporan.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'pelanggan', attributes: ['nama_lengkap', 'no_langganan', 'no_telp'] },
        { model: KategoriGangguan, as: 'kategori', attributes: ['nama_kategori'] },
        {
          model: Tugas,
          as: 'tugas',
          required: false,
          include: [
            { model: User, as: 'teknisi', attributes: ['nama_lengkap', 'no_telp'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({ success: true, data: laporan });
  } catch (error) {
    console.error('Get laporan filters error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getAllLaporan,
  getLaporanById,
  updateLaporanStatus,
  deleteLaporan,
  getLaporanStats,
  getLaporanWithFilters  
};
