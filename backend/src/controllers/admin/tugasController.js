// Fungsi: Controller admin untuk menangani logika fitur admin.
const { Tugas, Laporan, User, Notifikasi, KategoriGangguan } = require('../../models');
const { Op } = require('sequelize');

// Get all tugas (for admin)
const getAllTugas = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (status && status !== 'Semua') {
      whereClause.status = status;
    }
    
    const { count, rows } = await Tugas.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Laporan,
          as: 'laporan',
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
          ]
        },
        {
          model: User,
          as: 'teknisi',
          attributes: ['id', 'nama_lengkap', 'no_telp', 'foto_profil', 'is_active']
        },
        {
          model: User,
          as: 'kepala_teknisi',
          attributes: ['id', 'nama_lengkap']
        }
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
    console.error('Get all tugas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Create new tugas (admin/kepala teknisi)
const createTugas = async (req, res) => {
  try {
    const {
      laporan_id,
      judul_tugas,
      deskripsi_tugas,
      lokasi_tugas,
      nomor_telepon_pelanggan,
      prioritas
    } = req.body;
    
    if (!laporan_id || !judul_tugas || !lokasi_tugas) {
      return res.status(400).json({
        success: false,
        message: 'Laporan ID, judul tugas, dan lokasi tugas harus diisi'
      });
    }
    
    const laporan = await Laporan.findByPk(laporan_id);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan'
      });
    }
    
    const tugas = await Tugas.create({
      laporan_id,
      kepala_teknisi_id: req.user.id,
      judul_tugas,
      deskripsi_tugas: deskripsi_tugas || laporan.deskripsi,
      lokasi_tugas: lokasi_tugas || laporan.lokasi,
      nomor_telepon_pelanggan: nomor_telepon_pelanggan || laporan.nomor_telepon,
      prioritas: prioritas || 'sedang',
      status: 'menunggu_diambil',
      tanggal_ditugaskan: new Date()
    });
    
    // Update laporan status to 'divalidasi'
    await laporan.update({ status: 'divalidasi' });

    await Notifikasi.create({
      user_id: laporan.pelanggan_id,
      laporan_id: laporan.id,
      title: 'Laporan Divalidasi',
      message: `Laporan "${laporan.judul}" telah divalidasi dan akan diproses oleh petugas.`,
      type: 'success'
    });
    
    // Create notification for all teknisi about new tugas
    const teknisiList = await User.findAll({
      where: { role: 'teknisi', is_active: true }
    });
    
    for (const teknisi of teknisiList) {
      await Notifikasi.create({
        user_id: teknisi.id,
        laporan_id: laporan.id,
        title: 'Tugas Baru Tersedia',
        message: `Tugas baru "${judul_tugas}" tersedia untuk diambil.`,
        type: 'penugasan'
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Tugas berhasil dibuat',
      data: tugas
    });
  } catch (error) {
    console.error('Create tugas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Assign tugas to teknisi
const assignTugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { teknisi_id } = req.body;
    
    const tugas = await Tugas.findByPk(id);
    
    if (!tugas) {
      return res.status(404).json({
        success: false,
        message: 'Tugas tidak ditemukan'
      });
    }
    
    const teknisi = await User.findByPk(teknisi_id);
    
    // Validasi teknisi: harus role teknisi dan aktif
    if (!teknisi || teknisi.role !== 'teknisi' || !teknisi.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Teknisi tidak tersedia atau tidak aktif'
      });
    }
    
    await tugas.update({
      teknisi_id,
      status: 'dalam_proses',
      tanggal_diambil: new Date()
    });
    
    // Update laporan status
    await Laporan.update(
      { status: 'dalam_penanganan' },
      { where: { id: tugas.laporan_id } }
    );
    const laporan = await Laporan.findByPk(tugas.laporan_id);
    
    // Notification for teknisi
    await Notifikasi.create({
      user_id: teknisi_id,
      laporan_id: tugas.laporan_id,
      title: 'Tugas Ditugaskan',
      message: `Anda ditugaskan untuk mengerjakan tugas "${tugas.judul_tugas}".`,
      type: 'penugasan'
    });

    if (laporan) {
      await Notifikasi.create({
        user_id: laporan.pelanggan_id,
        laporan_id: laporan.id,
        title: 'Laporan Dalam Proses',
        message: `Laporan "${laporan.judul}" sedang dalam proses penanganan oleh petugas.`,
        type: 'dalam_penanganan'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Tugas berhasil ditugaskan',
      data: tugas
    });
  } catch (error) {
    console.error('Assign tugas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Complete tugas
const completeTugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan_teknisi } = req.body;
    
    const tugas = await Tugas.findByPk(id);
    
    if (!tugas) {
      return res.status(404).json({
        success: false,
        message: 'Tugas tidak ditemukan'
      });
    }
    
    await tugas.update({
      status: 'selesai',
      catatan_teknisi,
      tanggal_selesai: new Date()
    });
    
    // Update laporan status
    await Laporan.update(
      { status: 'selesai' },
      { where: { id: tugas.laporan_id } }
    );
    
    // Notification for pelanggan
    const laporan = await Laporan.findByPk(tugas.laporan_id);
    
    await Notifikasi.create({
      user_id: laporan.pelanggan_id,
      laporan_id: tugas.laporan_id,
      title: 'Laporan Selesai',
      message: `Laporan "${laporan.judul}" telah selesai ditangani.${catatan_teknisi ? `\nCatatan teknisi: ${catatan_teknisi}` : ''}`,
      type: 'selesai',
      catatan_teknisi
    });
    
    return res.status(200).json({
      success: true,
      message: 'Tugas berhasil diselesaikan',
      data: tugas
    });
  } catch (error) {
    console.error('Complete tugas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Delete tugas
const deleteTugas = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tugas = await Tugas.findByPk(id);
    
    if (!tugas) {
      return res.status(404).json({
        success: false,
        message: 'Tugas tidak ditemukan'
      });
    }
    
    await tugas.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Tugas berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete tugas error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  getAllTugas,
  createTugas,
  assignTugas,
  completeTugas,
  deleteTugas
};
