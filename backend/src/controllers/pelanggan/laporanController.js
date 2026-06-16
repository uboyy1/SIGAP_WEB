// API Pelanggan - SIGAP: Controller laporan, feed publik, like, dan komentar pelanggan.
const { Op } = require('sequelize');
const {
  Laporan,
  User,
  KategoriGangguan,
  LaporanKomentar,
  LaporanLike
} = require('../../models');
const { savePelangganActivity } = require('../aktivitasLogController');
const { createNotificationWithCooldown } = require('../../utils/notificationHelper');
const { getUploadedFileUrl } = require('../../utils/uploadedFile');

const laporanInclude = [
  { model: KategoriGangguan, as: 'kategori', attributes: ['id', 'nama_kategori'] },
  { model: User, as: 'pelanggan', attributes: ['id', 'nama_lengkap', 'no_langganan', 'foto_base64'] }
];
const publicVisibleStatuses = ['divalidasi', 'dalam_penanganan', 'selesai'];

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 50);
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
};

const refreshCounters = async (laporanId) => {
  const [likeCount, commentCount] = await Promise.all([
    LaporanLike.count({ where: { laporan_id: laporanId } }),
    LaporanKomentar.count({ where: { laporan_id: laporanId } })
  ]);

  await Laporan.update(
    { like_count: likeCount, comment_count: commentCount },
    { where: { id: laporanId } }
  );

  return { like_count: likeCount, comment_count: commentCount };
};

const attachFreshCounters = async (laporanRows, userId = null) => {
  const rows = Array.isArray(laporanRows) ? laporanRows : [];
  if (rows.length === 0) return rows;

  const counters = await Promise.all(rows.map((laporan) => refreshCounters(laporan.id)));
  const likedIds = userId
    ? new Set((await LaporanLike.findAll({
      attributes: ['laporan_id'],
      where: {
        user_id: userId,
        laporan_id: rows.map((laporan) => laporan.id)
      }
    })).map((like) => Number(like.laporan_id)))
    : new Set();

  return rows.map((laporan, index) => {
    laporan.setDataValue('like_count', counters[index].like_count);
    laporan.setDataValue('comment_count', counters[index].comment_count);
    laporan.setDataValue('liked', likedIds.has(Number(laporan.id)));
    return laporan;
  });
};

const getMyLaporan = async (req, res) => {
  try {
    const { status = '', search = '' } = req.query;
    const { page, limit, offset } = getPagination(req.query);
    const where = { pelanggan_id: req.user.id };

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      include: laporanInclude,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    const laporan = await attachFreshCounters(rows, req.user?.id);

    return res.status(200).json({
      success: true,
      data: {
        laporan,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Pelanggan get my laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getMyLaporanDetail = async (req, res) => {
  try {
    const laporan = await Laporan.findOne({
      where: {
        id: req.params.id,
        pelanggan_id: req.user.id
      },
      include: [
        ...laporanInclude,
        {
          model: LaporanKomentar,
          as: 'komentar',
          include: [{ model: User, as: 'user', attributes: ['id', 'nama_lengkap', 'foto_base64'] }],
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!laporan) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: laporan });
  } catch (error) {
    console.error('Pelanggan get laporan detail error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const createLaporan = async (req, res) => {
  try {
    const laporan = await Laporan.create({
      pelanggan_id: req.user.id,
      kategori_gangguan_id: req.body.kategori_gangguan_id,
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      lokasi: req.body.lokasi,
      nomor_telepon: req.body.nomor_telepon || req.user.no_telp,
      foto: req.file ? getUploadedFileUrl(req.file) : null,
      opsi_privasi: req.body.opsi_privasi || 'tidak_ada',
      sub_kategori: req.body.sub_kategori || null,
      tanggal_kejadian: req.body.tanggal_kejadian || null,
      prioritas: req.body.prioritas || 'sedang',
      status: 'menunggu'
    });

    const kepalaTeknisi = await User.findAll({ where: { role: 'kepala_teknisi', is_active: true } });
    await Promise.all(kepalaTeknisi.map((user) => createNotificationWithCooldown({
      user_id: user.id,
      laporan_id: laporan.id,
      title: 'Laporan Masuk Baru',
      message: `${req.user.nama_lengkap} mengirim laporan "${laporan.judul}".`,
      type: 'pengajuan'
    })));

    await createNotificationWithCooldown({
      user_id: req.user.id,
      laporan_id: laporan.id,
      title: 'Laporan Berhasil Dikirim',
      message: `Laporan "${laporan.judul}" berhasil dikirim dan menunggu validasi petugas.`,
      type: 'success'
    });

    await savePelangganActivity(req, req.user, 'pelanggan_buat_laporan', `Pelanggan membuat laporan "${laporan.judul}"`, { laporan_id: laporan.id });

    const created = await Laporan.findByPk(laporan.id, { include: laporanInclude });
    return res.status(201).json({
      success: true,
      message: 'Laporan berhasil dibuat',
      data: created
    });
  } catch (error) {
    console.error('Pelanggan create laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const updateLaporan = async (req, res) => {
  try {
    const laporan = req.laporan;
    if (laporan.status !== 'menunggu') {
      return res.status(400).json({
        success: false,
        message: 'Laporan hanya dapat diedit saat status menunggu'
      });
    }

    const allowed = [
      'kategori_gangguan_id',
      'judul',
      'deskripsi',
      'lokasi',
      'nomor_telepon',
      'opsi_privasi',
      'sub_kategori',
      'tanggal_kejadian',
      'prioritas'
    ];
    const payload = Object.fromEntries(
      allowed
        .filter((key) => req.body[key] !== undefined)
        .map((key) => [key, req.body[key]])
    );

    if (req.file) payload.foto = getUploadedFileUrl(req.file);

    await laporan.update(payload);
    await savePelangganActivity(req, req.user, 'pelanggan_edit_laporan', `Pelanggan mengedit laporan "${laporan.judul}"`, { laporan_id: laporan.id });

    const updated = await Laporan.findByPk(laporan.id, { include: laporanInclude });
    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Pelanggan update laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const deleteLaporan = async (req, res) => {
  try {
    const laporan = req.laporan;
    if (laporan.status !== 'menunggu') {
      return res.status(400).json({
        success: false,
        message: 'Laporan hanya dapat dihapus saat status menunggu'
      });
    }

    await laporan.destroy();
    await savePelangganActivity(req, req.user, 'pelanggan_hapus_laporan', `Pelanggan menghapus laporan "${laporan.judul}"`, { laporan_id: laporan.id });

    return res.status(200).json({
      success: true,
      message: 'Laporan berhasil dihapus'
    });
  } catch (error) {
    console.error('Pelanggan delete laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getPublicLaporan = async (req, res) => {
  try {
    const { search = '', kategori = '' } = req.query;
    const { page, limit, offset } = getPagination(req.query);
    const where = {
      opsi_privasi: { [Op.notIn]: ['rahasia', 'anonim_rahasia'] },
      status: { [Op.in]: publicVisibleStatuses }
    };

    if (kategori) where.kategori_gangguan_id = kategori;
    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } },
        { lokasi: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      include: laporanInclude,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    const laporan = await attachFreshCounters(rows, req.user?.id);

    return res.status(200).json({
      success: true,
      data: {
        laporan,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Pelanggan public laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getLaporanCount = async (req, res) => {
  try {
    const total = await Laporan.count({
      where: {
        status: { [Op.ne]: 'ditolak' }
      }
    });

    return res.status(200).json({
      success: true,
      data: { total }
    });
  } catch (error) {
    console.error('Pelanggan laporan count error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });

    const existing = await LaporanLike.findOne({
      where: {
        laporan_id: laporan.id,
        user_id: req.user.id
      }
    });

    const liked = !existing;
    if (existing) {
      await existing.destroy();
    } else {
      await LaporanLike.create({ laporan_id: laporan.id, user_id: req.user.id });
    }

    const counters = await refreshCounters(laporan.id);
    await savePelangganActivity(req, req.user, 'pelanggan_like_laporan', `${liked ? 'Like' : 'Unlike'} laporan "${laporan.judul}"`, { laporan_id: laporan.id });

    return res.status(200).json({
      success: true,
      data: {
        liked,
        ...counters
      }
    });
  } catch (error) {
    console.error('Pelanggan like laporan error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const addComment = async (req, res) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });

    const komentar = await LaporanKomentar.create({
      laporan_id: laporan.id,
      user_id: req.user.id,
      komentar: req.body.komentar
    });

    const counters = await refreshCounters(laporan.id);
    await savePelangganActivity(req, req.user, 'pelanggan_komentar_laporan', `Pelanggan mengomentari laporan "${laporan.judul}"`, { laporan_id: laporan.id });

    const detail = await LaporanKomentar.findByPk(komentar.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nama_lengkap', 'foto_base64'] }]
    });

    return res.status(201).json({
      success: true,
      message: 'Komentar berhasil terkirim',
      data: {
        komentar: detail,
        ...counters
      }
    });
  } catch (error) {
    console.error('Pelanggan add comment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getComments = async (req, res) => {
  try {
    const laporan = await Laporan.findByPk(req.params.id);
    if (!laporan) return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });

    const comments = await LaporanKomentar.findAll({
      where: { laporan_id: laporan.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'nama_lengkap', 'foto_base64'] }],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Pelanggan get comments error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getMyLaporan,
  getMyLaporanDetail,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  getPublicLaporan,
  getLaporanCount,
  toggleLike,
  addComment,
  getComments
};
