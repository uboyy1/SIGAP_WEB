// Fungsi: Controller shared untuk logika backend lintas role.
const { Op } = require('sequelize');
const { Notifikasi, NotifikasiState, PasswordResetRequest, User, Laporan, LaporanDarurat, Tugas } = require('../models');

const getNotificationsClearedAt = async (userId) => {
  const state = await NotifikasiState.findByPk(userId);
  return state?.notifications_cleared_at || null;
};

const isOlderThanClearTime = (sourceCreatedAt, clearedAt) => {
  if (!sourceCreatedAt || !clearedAt) return false;
  return new Date(sourceCreatedAt).getTime() <= new Date(clearedAt).getTime();
};

const getCreatedAt = (record) => record?.created_at || record?.createdAt || null;

const createNotificationOnce = async ({ user_id, laporan_id = null, title, message, type = 'info', catatan_teknisi = null, source_created_at = null }) => {
  if (!user_id || !title || !message) return null;

  const clearedAt = await getNotificationsClearedAt(user_id);
  if (isOlderThanClearTime(source_created_at, clearedAt)) return null;

  const where = { user_id, title, message, type };
  if (laporan_id) {
    where.laporan_id = laporan_id;
  } else {
    where.laporan_id = null;
  }

  const existing = await Notifikasi.findOne({ where });
  if (existing) return existing;

  return Notifikasi.create({
    user_id,
    laporan_id,
    title,
    message,
    type,
    catatan_teknisi
  });
};

const syncAdminNotifications = async () => {
  const [admins, resetRequests] = await Promise.all([
    User.findAll({
      where: { role: 'admin', is_active: true },
      attributes: ['id']
    }),
    PasswordResetRequest.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['nama_lengkap', 'email', 'role'] }],
      order: [['created_at', 'DESC']],
      limit: 30
    })
  ]);

  await Promise.all(resetRequests.flatMap((request) => {
    const requesterName = request.user?.nama_lengkap || request.nama_lengkap || 'Pengguna';
    const requesterEmail = request.user?.email || request.identifier || request.used_identifier || '-';
    const requesterRole = request.user?.role === 'kepala_teknisi'
      ? 'Kepala Teknisi'
      : request.user?.role === 'admin'
        ? 'Admin'
        : 'Pengguna';

    return admins.map((admin) => createNotificationOnce({
      user_id: admin.id,
      title: 'Permintaan Reset Password Baru',
      message: `${requesterName} (${requesterRole}) mengajukan reset password untuk email ${requesterEmail}.`,
      type: 'warning',
      source_created_at: getCreatedAt(request)
    }));
  }));
};

const syncKepalaTeknisiNotifications = async (currentUser) => {
  const kepalaTeknisiUsers = currentUser?.role === 'kepala_teknisi'
    ? [currentUser]
    : await User.findAll({
      where: { role: 'kepala_teknisi', is_active: true },
      attributes: ['id']
    });

  const kepalaTeknisiIds = kepalaTeknisiUsers.map((item) => item.id).filter(Boolean);
  if (kepalaTeknisiIds.length === 0) return;

  const [laporanMasuk, laporanDarurat, tugasDiambil, tugasSelesai] = await Promise.all([
    Laporan.findAll({
      where: { status: 'menunggu' },
      include: [{ model: User, as: 'pelanggan', attributes: ['nama_lengkap'] }],
      order: [['created_at', 'DESC']],
      limit: 30
    }),
    LaporanDarurat.findAll({
      where: { status: 'dilaporkan' },
      include: [{ model: User, as: 'teknisi', attributes: ['nama_lengkap'] }],
      order: [['created_at', 'DESC']],
      limit: 30
    }),
    Tugas.findAll({
      where: {
        status: { [Op.in]: ['dalam_proses', 'selesai'] },
        tanggal_diambil: { [Op.ne]: null }
      },
      include: [
        { model: User, as: 'teknisi', attributes: ['nama_lengkap'] },
        { model: Laporan, as: 'laporan', attributes: ['id', 'judul'] }
      ],
      order: [['tanggal_diambil', 'DESC']],
      limit: 30
    }),
    Tugas.findAll({
      where: {
        status: 'selesai',
        tanggal_selesai: { [Op.ne]: null }
      },
      include: [
        { model: User, as: 'teknisi', attributes: ['nama_lengkap'] },
        { model: Laporan, as: 'laporan', attributes: ['id', 'judul'] }
      ],
      order: [['tanggal_selesai', 'DESC']],
      limit: 30
    })
  ]);

  const notifyAllKepalaTeknisi = (payloadFactory) => kepalaTeknisiIds.map((userId) => (
    createNotificationOnce({ user_id: userId, ...payloadFactory() })
  ));

  const tasks = [
    ...laporanMasuk.flatMap((laporan) => notifyAllKepalaTeknisi(() => ({
      laporan_id: laporan.id,
      title: 'Laporan Masuk Baru',
      message: `${laporan.pelanggan?.nama_lengkap || 'Pengguna'} mengirim laporan "${laporan.judul}".`,
      type: 'pengajuan',
      source_created_at: getCreatedAt(laporan)
    }))),
    ...laporanDarurat.flatMap((laporan) => notifyAllKepalaTeknisi(() => ({
      title: 'Laporan Darurat Baru',
      message: `${laporan.teknisi?.nama_lengkap || 'Teknisi'} mengirim laporan darurat "${laporan.judul_laporan}".`,
      type: 'laporan_darurat',
      source_created_at: getCreatedAt(laporan)
    }))),
    ...tugasDiambil.map((tugas) => createNotificationOnce({
      user_id: tugas.kepala_teknisi_id,
      laporan_id: tugas.laporan_id,
      title: 'Tugas Diambil Teknisi',
      message: `${tugas.teknisi?.nama_lengkap || 'Teknisi'} mengambil tugas "${tugas.judul_tugas || tugas.laporan?.judul || 'Tugas'}".`,
      type: 'pengambilan_tugas',
      source_created_at: tugas.tanggal_diambil
    })),
    ...tugasSelesai.map((tugas) => createNotificationOnce({
      user_id: tugas.kepala_teknisi_id,
      laporan_id: tugas.laporan_id,
      title: 'Tugas Selesai',
      message: `${tugas.teknisi?.nama_lengkap || 'Teknisi'} menyelesaikan tugas "${tugas.judul_tugas || tugas.laporan?.judul || 'Tugas'}".`,
      type: 'selesai',
      catatan_teknisi: tugas.catatan_teknisi,
      source_created_at: tugas.tanggal_selesai
    }))
  ];

  await Promise.all(tasks);
};

const syncRoleNotifications = async (user) => {
  if (user?.role === 'admin') {
    await syncAdminNotifications();
  }

  if (user?.role === 'kepala_teknisi') {
    await syncKepalaTeknisiNotifications(user);
  }
};

const getRecentNotifications = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 10);
    await syncRoleNotifications(req.user);

    const [notifications, unreadCount] = await Promise.all([
      Notifikasi.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit
      }),
      Notifikasi.count({
        where: {
          user_id: req.user.id,
          is_read: false
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount
      }
    });
  } catch (error) {
    console.error('Get recent notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notifikasi.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    await notification.update({ is_read: true });

    return res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notifikasi.update(
      { is_read: true },
      {
        where: {
          user_id: req.user.id,
          is_read: false
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai sudah dibaca'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const clearedAt = new Date();
    await NotifikasiState.upsert({
      user_id: req.user.id,
      notifications_cleared_at: clearedAt
    });

    const deletedCount = await Notifikasi.destroy({
      where: {
        user_id: req.user.id
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Semua notifikasi berhasil dihapus',
      data: {
        deleted_count: deletedCount
      }
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
  createNotificationOnce
};
