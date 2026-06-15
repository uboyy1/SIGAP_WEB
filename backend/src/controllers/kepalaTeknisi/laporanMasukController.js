// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/laporanMasukController.js
const { Op, Sequelize } = require('sequelize');
const { Laporan, User, KategoriGangguan, Tugas, Notifikasi } = require('../../models');

function getStatusDisplay(status) {
  const map = {
    menunggu: 'Menunggu',
    divalidasi: 'Disetujui',
    ditolak: 'Ditolak',
    dalam_penanganan: 'Dalam Penanganan',
    selesai: 'Selesai'
  };
  return map[status] || status;
}

function formatDateTime(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const getLaporanMasuk = async (req, res) => {
  try {
    const { page = 1, limit = 10, kategori = '', prioritas = '', search = '' } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = { status: 'menunggu' };

    if (kategori && kategori !== 'Semua Jenis' && kategori !== 'Semua Kategori') {
      if (/^\d+$/.test(String(kategori))) {
        whereClause.kategori_gangguan_id = Number(kategori);
      } else {
        const kategoriData = await KategoriGangguan.findOne({
          where: { nama_kategori: kategori },
          attributes: ['id']
        });
        whereClause.kategori_gangguan_id = kategoriData ? kategoriData.id : -1;
  }
}

function getEstimasiPenanganan(kategori = '') {
  const normalized = kategori.toLowerCase();
  if (normalized.includes('bocor') || normalized.includes('pipa')) return '2-4 jam';
  if (normalized.includes('air') || normalized.includes('tekanan')) return '1-3 jam';
  if (normalized.includes('meter')) return '1 hari';
  return '2-6 jam';
}
    if (prioritas && prioritas !== 'Semua Prioritas') {
      whereClause.prioritas = prioritas.toLowerCase();
    }
    if (search) {
      whereClause[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'pelanggan', attributes: ['id', 'nama_lengkap', 'no_langganan', 'no_telp', 'email', 'alamat'] },
        { model: KategoriGangguan, as: 'kategori', attributes: ['id', 'nama_kategori'] }
      ],
      limit: parseInt(limit), 
      offset: parseInt(offset),
      order: [
        [Sequelize.literal("CASE prioritas WHEN 'tinggi' THEN 1 WHEN 'sedang' THEN 2 WHEN 'rendah' THEN 3 ELSE 4 END"), 'ASC'],
        ['created_at', 'ASC']
      ]
    });

    const formatted = rows.map(l => {
      const createdAt = l.createdAt || l.created_at;
      return {
        id: l.id,
        pelanggan: l.pelanggan,
        kategori_id: l.kategori?.id,
        kategori: l.kategori?.nama_kategori || '-',
        prioritas: l.prioritas,
        judul: l.judul,
        deskripsi: l.deskripsi,
        lokasi: l.lokasi,
        nomor_telepon: l.nomor_telepon,
        foto: l.foto,
        created_at: createdAt,
        created_at_formatted: formatDateTime(createdAt),
        is_overdue_24h: createdAt ? (Date.now() - new Date(createdAt).getTime()) > (24 * 60 * 60 * 1000) : false,
        estimasi_penanganan: getEstimasiPenanganan(l.kategori?.nama_kategori || ''),
        status: l.status,
        status_display: getStatusDisplay(l.status)
      };
    });

    return res.status(200).json({
      success: true,
      data: { 
        laporan: formatted, 
        pagination: { 
          total: count, 
          page: parseInt(page), 
          limit: parseInt(limit), 
          totalPages: Math.ceil(count / limit) 
        } 
      }
    });
  } catch (error) {
    console.error('Get laporan masuk error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

const getLaporanMasukDetail = async (req, res) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id, {
      include: [
        { model: User, as: 'pelanggan', attributes: ['id', 'nama_lengkap', 'no_langganan', 'no_telp', 'email', 'alamat'] },
        { model: KategoriGangguan, as: 'kategori', attributes: ['id', 'nama_kategori'] }
      ]
    });

    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    const createdAt = laporan.createdAt || laporan.created_at;
    const updatedAt = laporan.updatedAt || laporan.updated_at;
    const tugas = await Tugas.findOne({
      where: { laporan_id: laporan.id },
      include: [
        { model: User, as: 'teknisi', attributes: ['id', 'nama_lengkap', 'username', 'no_telp', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: {
        id: laporan.id,
        pelanggan: laporan.pelanggan,
        kategori: laporan.kategori,
        judul: laporan.judul,
        deskripsi: laporan.deskripsi,
        lokasi: laporan.lokasi,
        nomor_telepon: laporan.nomor_telepon,
        foto: laporan.foto,
        prioritas: laporan.prioritas,
        status: laporan.status,
        status_display: getStatusDisplay(laporan.status),
        tanggal_kejadian: laporan.tanggal_kejadian,
        created_at: createdAt,
        created_at_formatted: formatDateTime(createdAt),
        updated_at: updatedAt,
        updated_at_formatted: formatDateTime(updatedAt),
        tugas: tugas ? {
          id: tugas.id,
          status: tugas.status,
          teknisi: tugas.teknisi
        } : null
      }
    });
  } catch (error) {
    console.error('Get laporan detail error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

// Get semua teknisi (tanpa filter is_active)
const getTeknisiOptions = async (req, res) => {
  try {
    console.log('Memuat semua teknisi...');
    
    // Ambil SEMUA user dengan role 'teknisi', tidak peduli status is_active
    const teknisi = await User.findAll({
      where: { 
        role: 'teknisi'
      },
      attributes: ['id', 'nama_lengkap', 'username', 'no_telp', 'foto_base64', 'is_active'],
      order: [['nama_lengkap', 'ASC']]
    });
    
    console.log(`Ditemukan ${teknisi.length} teknisi`);
    
    if (teknisi.length === 0) {
      console.warn('Tidak ada teknisi. Silakan tambahkan akun dengan peran teknisi.');
    }
    
    return res.status(200).json({ 
      success: true, 
      data: teknisi,
      count: teknisi.length
    });
  } catch (error) {
    console.error('❌ Get teknisi options error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server: ' + error.message 
    });
  }
};

const terimaLaporan = async (req, res) => {
  try {
    const { teknisi_id } = req.body;
    const laporan = await Laporan.findByPk(req.params.id, {
      include: [{ model: KategoriGangguan, as: 'kategori', attributes: ['nama_kategori'] }]
    });

    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }
    if (laporan.status !== 'menunggu') {
      return res.status(400).json({ success: false, message: 'Hanya laporan menunggu yang bisa disetujui' });
    }

    // Cek apakah teknisi ada (tanpa filter is_active)
    const teknisi = await User.findOne({ 
      where: { 
        id: teknisi_id, 
        role: 'teknisi'
      } 
    });
    
    if (!teknisi) {
      return res.status(400).json({ success: false, message: 'Teknisi tidak ditemukan' });
    }

    const existingTugas = await Tugas.findOne({ where: { laporan_id: laporan.id } });
    if (existingTugas) {
      return res.status(400).json({ success: false, message: 'Laporan ini sudah memiliki tugas' });
    }

    const tugas = await Tugas.create({
      laporan_id: laporan.id,
      teknisi_id: teknisi.id,
      kepala_teknisi_id: req.user.id,
      judul_tugas: laporan.judul,
      deskripsi_tugas: laporan.deskripsi,
      lokasi_tugas: laporan.lokasi || '-',
      nomor_telepon_pelanggan: laporan.nomor_telepon,
      prioritas: laporan.prioritas || 'sedang',
      status: 'menunggu_diambil',
      tanggal_ditugaskan: new Date()
    });

    await laporan.update({ status: 'divalidasi' });

    await Notifikasi.create({
      user_id: laporan.pelanggan_id,
      laporan_id: laporan.id,
      title: 'Laporan Divalidasi',
      message: `Laporan "${laporan.judul}" telah divalidasi dan ditugaskan kepada teknisi ${teknisi.nama_lengkap}.`,
      type: 'success'
    });

    await Notifikasi.create({
      user_id: teknisi.id,
      laporan_id: laporan.id,
      title: 'Tugas Baru',
      message: `Anda ditugaskan menangani laporan "${laporan.judul}".`,
      type: 'penugasan'
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil disetujui dan ditugaskan',
      data: { laporan_id: laporan.id, status: 'divalidasi', tugas_id: tugas.id }
    });
  } catch (error) {
    console.error('Terima laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

const tolakLaporan = async (req, res) => {
  try {
    const { catatan = '' } = req.body;
    const laporan = await Laporan.findByPk(req.params.id);

    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }
    if (laporan.status !== 'menunggu') {
      return res.status(400).json({ success: false, message: 'Hanya laporan menunggu yang bisa ditolak' });
    }

    await laporan.update({ status: 'ditolak' });
    await Notifikasi.create({
      user_id: laporan.pelanggan_id,
      laporan_id: laporan.id,
      title: 'Laporan Ditolak',
      message: `Laporan "${laporan.judul}" ditolak.${catatan ? `\nCatatan: ${catatan}` : ''}`,
      type: 'ditolak',
      catatan_teknisi: catatan
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil ditolak',
      data: { laporan_id: laporan.id, status: 'ditolak' }
    });
  } catch (error) {
    console.error('Tolak laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + error.message });
  }
};

module.exports = {
  getLaporanMasuk,
  getLaporanMasukDetail,
  getTeknisiOptions,
  terimaLaporan,
  tolakLaporan
};
