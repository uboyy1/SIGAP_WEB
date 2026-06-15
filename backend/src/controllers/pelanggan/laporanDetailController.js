// API Pelanggan - SIGAP: Controller detail laporan, like, komentar, dan counter.
const {
  Laporan,
  LaporanKomentar,
  LaporanLike,
  User
} = require('../../models');
const { savePelangganActivity } = require('../aktivitasLogController');

const getValidLaporanId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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

const getLaporanOr404 = async (req, res) => {
  const laporanId = getValidLaporanId(req.params.id);
  if (!laporanId) {
    res.status(400).json({ success: false, message: 'ID laporan tidak valid' });
    return null;
  }

  const laporan = await Laporan.findByPk(laporanId);
  if (!laporan) {
    res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    return null;
  }

  return laporan;
};

const toggleLike = async (req, res) => {
  try {
    const laporan = await getLaporanOr404(req, res);
    if (!laporan) return null;

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
    const laporan = await getLaporanOr404(req, res);
    if (!laporan) return null;

    const komentar = await LaporanKomentar.create({
      laporan_id: laporan.id,
      user_id: req.user.id,
      komentar: req.body.komentar
    });

    const counters = await refreshCounters(laporan.id);
    await savePelangganActivity(req, req.user, 'pelanggan_komentar_laporan', `Pelanggan mengomentari laporan "${laporan.judul}"`, { laporan_id: laporan.id });

    const detail = await LaporanKomentar.findByPk(komentar.id, {
      attributes: ['id', 'laporan_id', 'user_id', 'komentar', 'created_at'],
      include: [{ model: User, as: 'user', attributes: ['id', 'nama_lengkap', 'foto_base64'], required: false }]
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
    const laporan = await getLaporanOr404(req, res);
    if (!laporan) return null;

    if (['rahasia', 'anonim_rahasia'].includes(laporan.opsi_privasi)) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    const comments = await LaporanKomentar.findAll({
      attributes: ['id', 'laporan_id', 'user_id', 'komentar', 'created_at'],
      where: { laporan_id: laporan.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'nama_lengkap', 'foto_base64'], required: false }],
      order: [['created_at', 'DESC']]
    });

    const counters = await refreshCounters(laporan.id);

    return res.status(200).json({
      success: true,
      data: comments,
      meta: counters
    });
  } catch (error) {
    console.error('Pelanggan get comments error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  toggleLike,
  addComment,
  getComments
};
