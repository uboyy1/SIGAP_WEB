// API Pelanggan - SIGAP: Controller notifikasi pelanggan.
const { Notifikasi, NotifikasiState } = require('../../models');

const getNotifications = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const notifications = await Notifikasi.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit
    });

    const unreadCount = await Notifikasi.count({
      where: {
        user_id: req.user.id,
        is_read: false
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount
      }
    });
  } catch (error) {
    console.error('Pelanggan get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notifikasi.findOne({
      where: {
        id: req.params.id,
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
    console.error('Pelanggan mark notification error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
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
    console.error('Pelanggan mark all notifications error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
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
    console.error('Pelanggan delete all notifications error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications
};
