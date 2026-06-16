// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/laporanDaruratController.js
const { Op } = require('sequelize');
const { LaporanDarurat, User, Notifikasi } = require('../../models');
const { saveActivityLog } = require('../aktivitasLogController');

const API_URL = process.env.API_URL || process.env.BACKEND_URL || 'https://sigapweb-production.up.railway.app';

function translateJenisKendala(jenis) {
  const map = {
    'infrastruktur': 'Infrastruktur',
    'operasional': 'Operasional',
    'pelayanan': 'Pelayanan',
    'sumber_daya': 'Sumber Daya',
    'lainnya': 'Lainnya'
  };
  return map[jenis] || jenis;
}

function translateStatusDarurat(status) {
  const map = {
    'dilaporkan': 'Dilaporkan',
    'diproses': 'Dalam Penanganan',
    'selesai': 'Selesai'
  };
  return map[status] || status;
}

// Helper untuk mendapatkan URL foto
const getFotoUrl = (fotoPath) => {
  if (!fotoPath) return null;
  if (fotoPath.startsWith('http') || fotoPath.startsWith('data:')) {
    return fotoPath;
  }
  const cleanPath = fotoPath.startsWith('/') ? fotoPath : `/uploads/laporan-darurat/${fotoPath}`;
  return `${API_URL}${cleanPath}`;
};

const getLaporanDarurat = async (req, res) => {
  try {
    const { page = 1, limit = 10, jenis = '', status = '', search = '' } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = {};

    if (jenis && jenis !== 'Semua Kendala') {
      const jenisMap = { 
        'Infrastruktur': 'infrastruktur', 
        'Operasional': 'operasional', 
        'Pelayanan': 'pelayanan', 
        'Sumber Daya': 'sumber_daya', 
        'Lainnya': 'lainnya',
        'infrastruktur': 'infrastruktur',
        'operasional': 'operasional',
        'pelayanan': 'pelayanan',
        'sumber_daya': 'sumber_daya',
        'lainnya': 'lainnya'
      };
      if (jenisMap[jenis]) whereClause.jenis_kendala = jenisMap[jenis];
    }
    if (status && status !== 'Semua Status') {
      const statusMap = { 
        'Selesai': 'selesai', 
        'Dalam Penanganan': 'diproses', 
        'Dilaporkan': 'dilaporkan',
        'selesai': 'selesai',
        'diproses': 'diproses',
        'dilaporkan': 'dilaporkan'
      };
      if (status === 'aktif') whereClause.status = { [Op.ne]: 'selesai' };
      else if (statusMap[status]) whereClause.status = statusMap[status];
    }
    if (search) {
      whereClause[Op.or] = [
        { judul_laporan: { [Op.like]: `%${search}%` } },
        { lokasi_laporan: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await LaporanDarurat.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'teknisi', attributes: ['id', 'nama_lengkap', 'username', 'foto_base64'] }],
      limit: parseInt(limit), 
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    const formatted = rows.map(l => {
      const fotoUrl = getFotoUrl(l.foto_laporan);
      return {
        id: l.id, 
        teknisi: l.teknisi?.nama_lengkap || '-', 
        teknisi_detail: l.teknisi,
        judul: l.judul_laporan,
        jenis_kendala: translateJenisKendala(l.jenis_kendala), 
        deskripsi: l.deskripsi_laporan,
        rekomendasi: l.rekomendasi_tindak_lanjut,
        lokasi: l.lokasi_laporan, 
        tanggal_kejadian: l.tanggal_kejadian,
        created_at: l.created_at, 
        updated_at: l.updated_at,
        status: l.status, 
        status_display: translateStatusDarurat(l.status),
        catatan: l.catatan_kepala_teknisi,
        foto: fotoUrl
      };
    });

    const summary = {
      total: await LaporanDarurat.count(),
      baru: await LaporanDarurat.count({ where: { status: 'dilaporkan' } }),
      selesai: await LaporanDarurat.count({ where: { status: 'selesai' } })
    };

    return res.status(200).json({
      success: true,
      data: { 
        laporan: formatted, 
        summary, 
        pagination: { 
          total: count, 
          page: parseInt(page), 
          limit: parseInt(limit), 
          totalPages: Math.ceil(count / limit) 
        } 
      }
    });
  } catch (error) {
    console.error('Get laporan darurat error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

const updateLaporanDaruratStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;
    
    const laporan = await LaporanDarurat.findByPk(id);
    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan darurat tidak ditemukan' });
    }

    const oldStatus = laporan.status;
    const newStatus = status === 'selesai' ? 'selesai' : status === 'diproses' ? 'diproses' : 'dilaporkan';
    
    await laporan.update({
      status: newStatus,
      catatan_kepala_teknisi: catatan || laporan.catatan_kepala_teknisi
    });

    // Kirim notifikasi ke teknisi yang melapor
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'info';
    
    if (newStatus === 'diproses') {
      notificationTitle = '🔄 Laporan Darurat Diproses';
      notificationMessage = `Laporan darurat "${laporan.judul_laporan}" sedang diproses oleh tim.${catatan ? `\n\nCatatan dari Kepala Teknisi: ${catatan}` : ''}`;
      notificationType = 'warning';
    } else if (newStatus === 'selesai') {
      notificationTitle = '✅ Laporan Darurat Selesai';
      notificationMessage = `Laporan darurat "${laporan.judul_laporan}" telah selesai ditangani.${catatan ? `\n\nCatatan: ${catatan}` : ''}`;
      notificationType = 'success';
    } else {
      notificationTitle = '📋 Laporan Darurat Diterima';
      notificationMessage = `Laporan darurat "${laporan.judul_laporan}" telah diterima dan akan segera diproses.`;
      notificationType = 'info';
    }
    
    await Notifikasi.create({
      user_id: laporan.teknisi_id,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType
    });

    // Log aktivitas
    await saveActivityLog({
      user_id: req.user.id,
      user_nama: req.user.nama_lengkap,
      user_role: req.user.role,
      tipe_aktivitas: 'update_status',
      deskripsi: `Mengubah status laporan darurat "${laporan.judul_laporan}" dari ${oldStatus} menjadi ${newStatus}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Status laporan darurat berhasil diperbarui', 
      data: { id: laporan.id, status: laporan.status } 
    });
  } catch (error) {
    console.error('Update laporan darurat status error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

module.exports = { getLaporanDarurat, updateLaporanDaruratStatus };
