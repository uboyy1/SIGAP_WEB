// Fungsi: Controller admin untuk menangani logika fitur admin.
// backend/src/controllers/admin/authController.js
const jwt = require('jsonwebtoken');
const { User, PasswordResetRequest, Notifikasi } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const { saveActivityLog } = require('../aktivitasLogController');
const logger = require('../../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const failedLoginAttempts = new Map();
const isProduction = process.env.NODE_ENV === 'production';
const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const failedLoginWindowMs = toPositiveNumber(process.env.ADMIN_FAILED_LOGIN_WINDOW_MS, 15 * 60 * 1000);
const failedLoginBlockMs = toPositiveNumber(process.env.ADMIN_FAILED_LOGIN_BLOCK_MS, isProduction ? 15 * 60 * 1000 : 2 * 60 * 1000);
const failedLoginLimit = toPositiveNumber(process.env.ADMIN_FAILED_LOGIN_LIMIT, isProduction ? 10 : 50);

const getLoginAttemptKey = (req, email = '') => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  return `${ipAddress}:${String(email).toLowerCase()}`;
};

const getLoginAttempt = (key) => {
  const current = failedLoginAttempts.get(key);
  if (!current) return { count: 0, first_attempt_at: Date.now(), blocked_until: 0 };
  if (Date.now() - current.first_attempt_at > failedLoginWindowMs) {
    failedLoginAttempts.delete(key);
    return { count: 0, first_attempt_at: Date.now(), blocked_until: 0 };
  }
  return current;
};

const recordFailedLoginAttempt = (key) => {
  const attempt = getLoginAttempt(key);
  const nextAttempt = {
    count: attempt.count + 1,
    first_attempt_at: attempt.first_attempt_at || Date.now(),
    blocked_until: attempt.blocked_until || 0
  };

  if (nextAttempt.count >= failedLoginLimit) {
    nextAttempt.blocked_until = Date.now() + failedLoginBlockMs;
  }

  failedLoginAttempts.set(key, nextAttempt);
  return nextAttempt;
};

const clearFailedLoginAttempt = (key) => {
  failedLoginAttempts.delete(key);
};

// Login untuk Admin dan Kepala Teknisi
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const attemptKey = getLoginAttemptKey(req, email);
    const attempt = getLoginAttempt(attemptKey);

    if (attempt.blocked_until && attempt.blocked_until > Date.now()) {
      return res.status(429).json({
        success: false,
        message: 'Terlalu banyak percobaan login gagal. Coba lagi dalam 15 menit.'
      });
    }

    logger.info('Login attempt', { email });

    const user = await User.findOne({
      where: {
        email,
        role: { [Op.in]: ['admin', 'kepala_teknisi'] }
      }
    });

    if (!user) {
      recordFailedLoginAttempt(attemptKey);
      logger.warn('Login failed: email not found', { email });
      return res.status(401).json({
        success: false,
        code: 'EMAIL_INVALID',
        message: 'Email salah',
        errors: [{ field: 'email', message: 'Email salah atau tidak terdaftar' }]
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      recordFailedLoginAttempt(attemptKey);
      logger.warn('Login failed: invalid password', { email });
      return res.status(401).json({
        success: false,
        code: 'PASSWORD_INVALID',
        message: 'Kata sandi salah',
        errors: [{ field: 'password', message: 'Kata sandi salah' }]
      });
    }

    await user.update({
      last_login: new Date(),
      is_logged_in: true
    });

    const token = generateToken(user.id);
    clearFailedLoginAttempt(attemptKey);
    logger.info('Login successful', { email, role: user.role, user_id: user.id });

    await saveActivityLog({
      user_id: user.id,
      user_nama: user.nama_lengkap,
      user_role: user.role,
      tipe_aktivitas: 'login',
      deskripsi: `Login ke sistem sebagai ${user.role === 'admin' ? 'Admin' : 'Kepala Teknisi'}`,
      ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          username: user.username,
          email: user.email,
          role: user.role,
          foto_profil: user.foto_profil,
          foto_base64: user.foto_base64,
          no_telp: user.no_telp,
          bio: user.bio
        }
      }
    });
  } catch (error) {
    logger.error('Admin login error', { error });
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

const RESET_PASSWORD_ROLES = ['admin', 'kepala_teknisi'];

// Forgot Password: pengguna membuat permintaan reset yang diproses admin.
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Cari user yang boleh memakai alur reset password publik.
    const user = await User.findOne({
      where: {
        email,
        role: { [Op.in]: RESET_PASSWORD_ROLES }
      }
    });

    if (!user) {
      logger.warn('Forgot password requested for unknown email:', email);
      return res.status(404).json({
        success: false,
        message: 'Email admin atau kepala teknisi tidak ditemukan.'
      });
    }

    // Cek apakah sudah ada request pending
    const existingPending = await PasswordResetRequest.findOne({
      where: {
        user_id: user.id,
        status: 'pending'
      }
    });

    if (!existingPending) {
      // Buat request reset password
      const resetRequest = await PasswordResetRequest.create({
        user_id: user.id,
        nama_lengkap: user.nama_lengkap,
        identifier: user.email,
        used_identifier: email,
        no_telepon: user.no_telp || '-',
        status: 'pending',
        allow_reset: false,
        reset_completed: false
      });

      console.log(`📧 Reset password request created for user: ${user.nama_lengkap} (ID: ${resetRequest.id})`);

      await saveActivityLog({
        user_id: user.id,
        user_nama: user.nama_lengkap,
        user_role: user.role,
        tipe_aktivitas: 'reset_password',
        deskripsi: `Mengajukan permintaan reset password dengan email: ${email}`,
        ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      });

      const admins = await User.findAll({
        where: { role: 'admin', is_active: true },
        attributes: ['id']
      });

      await Promise.all(admins.map(async (admin) => {
        const requesterRole = user.role === 'kepala_teknisi'
          ? 'Kepala Teknisi'
          : user.role === 'admin'
            ? 'Admin'
            : 'Pengguna';
        const message = `${user.nama_lengkap} (${requesterRole}) mengajukan reset password untuk email ${user.email}.`;
        const existing = await Notifikasi.findOne({
          where: {
            user_id: admin.id,
            laporan_id: null,
            title: 'Permintaan Reset Password Baru',
            message,
            type: 'warning'
          }
        });

        if (!existing) {
          await Notifikasi.create({
            user_id: admin.id,
            title: 'Permintaan Reset Password Baru',
            message,
            type: 'warning'
          });
        }
      }));
    } else {
      console.log(`⚠️ Pending reset request already exists for user: ${user.nama_lengkap}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Permintaan reset password berhasil dikirim. Tunggu persetujuan admin.'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

const getResetPasswordStatus = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email,
        role: { [Op.in]: RESET_PASSWORD_ROLES }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email admin atau kepala teknisi tidak ditemukan.'
      });
    }

    // Cari request dengan status pending atau approved (belum completed)
    const request = await PasswordResetRequest.findOne({
      where: {
        user_id: user.id,
        reset_completed: false,
        status: { [Op.in]: ['pending', 'approved', 'rejected'] }
      },
      order: [['created_at', 'DESC']]
    });

    console.log(`🔍 Reset password status check for user: ${user.nama_lengkap}`, request ? `Status: ${request.status}` : 'No request found');

    if (!request) {
      return res.status(200).json({
        success: true,
        message: 'Belum ada permintaan reset password aktif.',
        data: {
          status: 'none',
          can_reset: false
        }
      });
    }

    if (request.status === 'approved' && request.allow_reset) {
      return res.status(200).json({
        success: true,
        message: 'Permintaan reset password sudah disetujui. Silakan buat password baru.',
        data: {
          status: 'approved',
          can_reset: true
        }
      });
    }

    if (request.status === 'rejected') {
      return res.status(200).json({
        success: true,
        message: request.catatan_admin
          ? `Permintaan reset password ditolak. Alasan: ${request.catatan_admin}`
          : 'Permintaan reset password ditolak.',
        data: {
          status: 'rejected',
          can_reset: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Permintaan reset password masih menunggu persetujuan admin.',
      data: {
        status: 'pending',
        can_reset: false
      }
    });
  } catch (error) {
    logger.error('Get reset password status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

const resetApprovedPassword = async (req, res) => {
  try {
    const { email, new_password } = req.body;

    const user = await User.findOne({
      where: {
        email,
        role: { [Op.in]: RESET_PASSWORD_ROLES }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak ditemukan'
      });
    }

    const request = await PasswordResetRequest.findOne({
      where: {
        user_id: user.id,
        status: 'approved',
        allow_reset: true,
        reset_completed: false
      },
      order: [['created_at', 'DESC']]
    });

    if (!request) {
      return res.status(403).json({
        success: false,
        message: 'Permintaan reset password belum disetujui admin atau sudah digunakan'
      });
    }

    await user.update({ password: new_password });
    await request.update({
      status: 'completed',
      allow_reset: false,
      reset_completed: true,
      reset_completed_at: new Date()
    });

    await saveActivityLog({
      user_id: user.id,
      user_nama: user.nama_lengkap,
      user_role: user.role,
      tipe_aktivitas: 'reset_password',
      deskripsi: 'Mengganti password setelah permintaan disetujui admin',
      ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    });

    logger.info('Approved password reset completed', { user_id: user.id, request_id: request.id });

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diganti. Silakan login dengan password baru.'
    });
  } catch (error) {
    logger.error('Reset approved password error', { error });
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Logout
const adminLogout = async (req, res) => {
  try {
    await User.update(
      { is_logged_in: false },
      { where: { id: req.user.id } }
    );

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    logger.error('Logout error', { error, user_id: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get Current User Profile
const getCurrentAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        role: user.role,
        foto_profil: user.foto_profil,
        foto_base64: user.foto_base64,
        no_telp: user.no_telp,
        bio: user.bio
      }
    });
  } catch (error) {
    logger.error('Get current admin error', { error, user_id: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Update Profile (termasuk username)
const updateAdminProfile = async (req, res) => {
  try {
    const { nama_lengkap, username, no_telp, bio } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Op.ne]: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan oleh pengguna lain'
        });
      }
    }

    await user.update({
      nama_lengkap: nama_lengkap || user.nama_lengkap,
      username: username || user.username,
      no_telp: no_telp !== undefined ? no_telp : user.no_telp,
      bio: bio !== undefined ? bio : user.bio
    });

    await user.reload();

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        role: user.role,
        foto_profil: user.foto_profil,
        foto_base64: user.foto_base64,
        no_telp: user.no_telp,
        bio: user.bio
      }
    });
  } catch (error) {
    logger.error('Update profile error', { error, user_id: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Update Password
const updateAdminPassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    const isPasswordValid = await user.comparePassword(current_password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password saat ini salah'
      });
    }

    await user.update({ password: new_password });

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    logger.error('Update password error', { error, user_id: req.user?.id });
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Upload foto profil (disimpan sebagai Base64)
const uploadAdminPhoto = async (req, res) => {
  try {
    logger.info('Upload profile photo requested', { user_id: req.user.id });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File gambar diperlukan'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const base64String = fileBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const fotoBase64 = `data:${mimeType};base64,${base64String}`;

    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    await user.update({
      foto_profil: req.file.filename,
      foto_base64: fotoBase64
    });
    await user.reload();

    logger.info('Profile photo saved', { user_id: user.id });

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil diupload',
      data: {
        foto_profil: req.file.filename,
        foto_base64: fotoBase64,
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          username: user.username,
          email: user.email,
          role: user.role,
          foto_profil: user.foto_profil,
          foto_base64: user.foto_base64,
          no_telp: user.no_telp,
          bio: user.bio
        }
      }
    });
  } catch (error) {
    logger.error('Upload admin photo error', { error, user_id: req.user?.id });
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server'
    });
  }
};

// Hapus foto profil dan kembalikan avatar default
const deleteAdminPhoto = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    await user.update({
      foto_profil: null,
      foto_base64: null
    });
    await user.reload();

    logger.info('Profile photo deleted', { user_id: user.id });

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil dihapus',
      data: {
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          username: user.username,
          email: user.email,
          role: user.role,
          foto_profil: user.foto_profil,
          foto_base64: user.foto_base64,
          no_telp: user.no_telp,
          bio: user.bio
        }
      }
    });
  } catch (error) {
    logger.error('Delete admin photo error', { error, user_id: req.user?.id });
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  adminLogin,
  forgotPassword,
  getResetPasswordStatus,
  resetApprovedPassword,
  adminLogout,
  getCurrentAdmin,
  updateAdminProfile,
  updateAdminPassword,
  uploadAdminPhoto,
  deleteAdminPhoto
};
