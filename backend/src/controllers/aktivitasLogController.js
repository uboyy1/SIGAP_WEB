// Fungsi: Controller shared untuk logika backend lintas role.
// backend/src/controllers/aktivitasLogController.js
const { AktivitasLog, User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

const hashIpAddress = (ipAddress) => {
  if (!ipAddress) return null;
  const salt = process.env.IP_HASH_SALT || process.env.JWT_SECRET || 'sigap-ip-salt';
  return crypto.createHash('sha256').update(`${salt}:${ipAddress}`).digest('hex');
};

// Simpan aktivitas ke log
const saveActivityLog = async (data) => {
  try {
    await AktivitasLog.create({
      user_id: data.user_id,
      user_nama: data.user_nama,
      user_role: data.user_role,
      tipe_aktivitas: data.tipe_aktivitas,
      deskripsi: data.deskripsi,
      detail_data: data.detail_data || null,
      ip_address: hashIpAddress(data.ip_address),
      user_agent: data.user_agent || null
    });
  } catch (error) {
    console.error('Error saving activity log:', error);
  }
};

// API Pelanggan - SIGAP: Helper pencatatan aktivitas pelanggan.
const savePelangganActivity = async (req, user, tipeAktivitas, deskripsi, detailData = null) => {
  if (!user) return;

  await saveActivityLog({
    user_id: user.id,
    user_nama: user.nama_lengkap,
    user_role: 'pelanggan',
    tipe_aktivitas: tipeAktivitas,
    deskripsi,
    detail_data: detailData ? JSON.stringify(detailData) : null,
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  });
};

// Get aktivitas log dengan filter (hanya 24 jam terakhir untuk dashboard)
const getRecentActivities = async (req, res) => {
  try {
    const { limit = 15, days = 1 } = req.query;
    
    // Hitung tanggal batas (default 24 jam terakhir)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const activities = await AktivitasLog.findAll({
      where: {
        created_at: { [Op.gte]: startDate }
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });
    
    // Format waktu relatif
    const formatWaktu = (date) => {
      const now = new Date();
      const diffMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} jam lalu`;
      return `${Math.floor(diffMinutes / 1440)} hari lalu`;
    };
    
    const getTipeDisplay = (tipe) => {
      const map = {
        'login': 'Login',
        'laporan_baru': 'Laporan Baru',
        'pelanggan_register': 'Pelanggan Daftar',
        'pelanggan_login': 'Pelanggan Login',
        'pelanggan_logout': 'Pelanggan Logout',
        'pelanggan_update_profile': 'Update Profil Pelanggan',
        'pelanggan_upload_photo': 'Upload Foto Pelanggan',
        'pelanggan_update_password': 'Ubah Password Pelanggan',
        'pelanggan_forgot_password': 'Reset Password Pelanggan',
        'pelanggan_buat_laporan': 'Laporan Pelanggan',
        'pelanggan_edit_laporan': 'Edit Laporan Pelanggan',
        'pelanggan_hapus_laporan': 'Hapus Laporan Pelanggan',
        'pelanggan_like_laporan': 'Like Laporan',
        'pelanggan_komentar_laporan': 'Komentar Laporan',
        'pelanggan_hapus_akun': 'Hapus Akun Pelanggan',
        'ambil_tugas': 'Ambil Tugas',
        'laporan_darurat': 'Laporan Darurat',
        'beri_tugas': 'Penugasan',
        'update_status': 'Update Status',
        'hapus_laporan': 'Hapus Laporan',
        'tambah_user': 'Tambah User',
        'edit_user': 'Edit User',
        'hapus_user': 'Hapus User',
        'reset_password': 'Reset Password',
        'approve_reset': 'Approve Reset',
        'reject_reset': 'Reject Reset'
      };
      return map[tipe] || tipe;
    };
    
    const getBadgeColor = (tipe) => {
      const map = {
        'login': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'laporan_baru': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'pelanggan_register': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
        'pelanggan_login': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'pelanggan_buat_laporan': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'pelanggan_komentar_laporan': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        'pelanggan_hapus_akun': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'ambil_tugas': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'laporan_darurat': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'beri_tugas': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      };
      return map[tipe] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    };
    
    const formattedActivities = activities.map(act => ({
      waktu: formatWaktu(act.created_at),
      waktu_full: act.created_at,
      aktivitas: act.deskripsi,
      pengguna: act.user_nama,
      role: act.user_role === 'kepala_teknisi' ? 'kepala teknisi' : act.user_role,
      tipe: getTipeDisplay(act.tipe_aktivitas),
      badge_color: getBadgeColor(act.tipe_aktivitas)
    }));
    
    return res.status(200).json({
      success: true,
      data: formattedActivities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get all aktivitas log (untuk riwayat lengkap)
const getAllActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, tipe = '', search = '', dari_tanggal = '', sampai_tanggal = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (tipe && tipe !== 'Semua') {
      const tipeMap = {
        'Login': 'login',
        'Laporan Baru': 'laporan_baru',
        'Ambil Tugas': 'ambil_tugas',
        'Laporan Darurat': 'laporan_darurat',
        'Penugasan': 'beri_tugas'
      };
      if (tipeMap[tipe]) whereClause.tipe_aktivitas = tipeMap[tipe];
    }
    
    if (search) {
      whereClause[Op.or] = [
        { user_nama: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (dari_tanggal && sampai_tanggal) {
      whereClause.created_at = {
        [Op.between]: [new Date(dari_tanggal), new Date(sampai_tanggal + ' 23:59:59')]
      };
    }
    
    const { count, rows } = await AktivitasLog.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return res.status(200).json({
      success: true,
      data: {
        activities: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all activities error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

module.exports = { saveActivityLog, savePelangganActivity, getRecentActivities, getAllActivities };
