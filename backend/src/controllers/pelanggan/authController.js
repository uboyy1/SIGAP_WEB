// API Pelanggan - SIGAP: Controller autentikasi dan profil pelanggan.
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const {
  sequelize,
  User,
  PasswordResetRequest,
  Notifikasi,
  NotifikasiState,
  Laporan,
  LaporanKomentar,
  LaporanLike
} = require('../../models');
const { savePelangganActivity } = require('../aktivitasLogController');
const { createNotificationWithCooldown } = require('../../utils/notificationHelper');
const { sendVerificationEmail } = require('../../utils/emailService');
const { getUploadedFileName, getUploadedFileUrl } = require('../../utils/uploadedFile');
const {
  DEFAULT_PROFILE_COVER_ID,
  PROFILE_COVER_OPTIONS,
  getProfileCoverOption
} = require('../../utils/profileCoverOptions');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d'
});

const LOGIN_BLOCK_THRESHOLD = Number(process.env.PELANGGAN_LOGIN_BLOCK_THRESHOLD || 5);
const LOGIN_BLOCK_MS = Number(process.env.PELANGGAN_LOGIN_BLOCK_MS || 15 * 60 * 1000);
const SUSPICIOUS_IP_WINDOW_MS = Number(process.env.PELANGGAN_SUSPICIOUS_IP_WINDOW_MS || 15 * 60 * 1000);
const SUSPICIOUS_IP_THRESHOLD = Number(process.env.PELANGGAN_SUSPICIOUS_IP_THRESHOLD || 3);
const loginFailures = new Map();
const loginIdentifierIps = new Map();

const hashValue = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const hashVerificationToken = (token) => hashValue(`${process.env.JWT_SECRET || 'sigap'}:${token}`);
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

const getLoginAttemptKey = (req, identifier) => `${req.ip || 'unknown'}:${String(identifier || '').trim().toLowerCase()}`;

const getBlockedLogin = (req, identifier) => {
  const record = loginFailures.get(getLoginAttemptKey(req, identifier));
  if (!record?.blockedUntil) return null;

  if (record.blockedUntil <= Date.now()) {
    loginFailures.delete(getLoginAttemptKey(req, identifier));
    return null;
  }

  return record;
};

const notifyAdminsAboutSuspiciousLogin = async (identifier, req) => {
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  if (!normalizedIdentifier) return;

  const now = Date.now();
  const current = loginIdentifierIps.get(normalizedIdentifier) || [];
  const nextRecords = [
    ...current.filter((item) => item.at >= now - SUSPICIOUS_IP_WINDOW_MS),
    { ipHash: hashValue(req.ip || 'unknown'), at: now }
  ];
  loginIdentifierIps.set(normalizedIdentifier, nextRecords);

  const uniqueIpCount = new Set(nextRecords.map((item) => item.ipHash)).size;
  if (uniqueIpCount < SUSPICIOUS_IP_THRESHOLD) return;

  const admins = await User.findAll({ where: { role: 'admin', is_active: true } });
  await Promise.all(admins.map((admin) => createNotificationWithCooldown({
    user_id: admin.id,
    title: 'Aktivitas Login Pelanggan Mencurigakan',
    message: `Ada banyak percobaan akses pelanggan untuk identifier ${normalizedIdentifier} dari beberapa koneksi berbeda.`,
    type: 'warning',
    cooldownMs: 15 * 60 * 1000
  })));
};

const recordFailedLogin = async (req, identifier) => {
  const key = getLoginAttemptKey(req, identifier);
  const current = loginFailures.get(key) || { count: 0, blockedUntil: null };
  const count = current.count + 1;
  loginFailures.set(key, {
    count,
    blockedUntil: count >= LOGIN_BLOCK_THRESHOLD ? Date.now() + LOGIN_BLOCK_MS : null
  });

  await notifyAdminsAboutSuspiciousLogin(identifier, req);
};

const clearFailedLogin = (req, identifier) => {
  loginFailures.delete(getLoginAttemptKey(req, identifier));
};

const sanitizeUser = (user) => {
  const plain = user?.toJSON ? user.toJSON() : user;
  if (!plain) return null;
  delete plain.password;
  delete plain.email_verification_token;
  return plain;
};

const buildDuplicateUserErrors = (users, values = {}) => {
  const errors = [];
  const rows = Array.isArray(users) ? users : [];
  const normalizedEmail = String(values.email || '').trim().toLowerCase();
  const normalizedNoLangganan = String(values.no_langganan || '').trim();
  const normalizedUsername = String(values.username || '').trim().toLowerCase();

  if (normalizedEmail && rows.some((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail)) {
    errors.push({ field: 'email', message: 'Email sudah terdaftar. Gunakan email Gmail lain.' });
  }

  if (normalizedNoLangganan && rows.some((user) => String(user.no_langganan || '').trim() === normalizedNoLangganan)) {
    errors.push({ field: 'no_langganan', message: 'Nomor langganan sudah terdaftar.' });
  }

  if (normalizedUsername && rows.some((user) => String(user.username || '').trim().toLowerCase() === normalizedUsername)) {
    errors.push({ field: 'username', message: 'Username sudah digunakan.' });
  }

  return errors;
};

const sendDuplicateResponse = (res, errors, fallbackMessage) => res.status(409).json({
  success: false,
  code: 'DUPLICATE_PELANGGAN_DATA',
  message: fallbackMessage,
  errors
});

const register = async (req, res) => {
  try {
    const {
      no_langganan,
      nama_lengkap,
      username,
      email,
      password,
      no_telp,
      jenis_kelamin,
      tanggal_lahir,
      alamat
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedNoLangganan = String(no_langganan || '').trim();
    const trimmedUsername = username ? String(username).trim() : '';
    const existing = await User.findAll({
      where: {
        [Op.or]: [
          { email: normalizedEmail },
          { no_langganan: normalizedNoLangganan },
          ...(trimmedUsername ? [{ username: trimmedUsername }] : [])
        ]
      }
    });

    if (existing.length > 0) {
      const errors = buildDuplicateUserErrors(existing, {
        email: normalizedEmail,
        no_langganan: normalizedNoLangganan,
        username: trimmedUsername
      });
      return sendDuplicateResponse(res, errors, 'Email, username, atau nomor langganan sudah terdaftar');
    }

    const user = await User.create({
      no_langganan: normalizedNoLangganan,
      nama_lengkap,
      username: trimmedUsername || null,
      email: normalizedEmail,
      password,
      no_telp,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      role: 'pelanggan',
      is_active: true,
      is_logged_in: false,
      email_verified_at: new Date(),
      email_verification_token: null,
      email_verification_expires_at: null
    });

    await savePelangganActivity(req, user, 'pelanggan_register', 'Pelanggan membuat akun baru');

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Silakan login menggunakan No Langganan dan kata sandi.',
      data: {
        user: sanitizeUser(user),
        verification_email_sent: false
      }
    });
  } catch (error) {
    console.error('Pelanggan register error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const login = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email;
    const { password } = req.body;

    if (!identifier) {
      return res.status(422).json({
        success: false,
        message: 'Nomor langganan harus diisi'
      });
    }

    const blockedLogin = getBlockedLogin(req, identifier);
    if (blockedLogin) {
      return res.status(429).json({
        success: false,
        code: 'LOGIN_TEMPORARILY_BLOCKED',
        message: 'Login diblokir sementara karena terlalu banyak percobaan gagal. Silakan coba lagi 15 menit kemudian.',
        retry_after_seconds: Math.ceil((blockedLogin.blockedUntil - Date.now()) / 1000)
      });
    }

    const user = await User.findOne({
      where: {
        role: 'pelanggan',
        no_langganan: identifier
      }
    });

    if (!user) {
      await recordFailedLogin(req, identifier);
      return res.status(401).json({
        success: false,
        code: 'NO_LANGGANAN_INVALID',
        message: 'Nomor langganan salah',
        errors: [{ field: 'identifier', message: 'Nomor langganan salah atau tidak terdaftar' }]
      });
    }

    if (!(await user.comparePassword(password))) {
      await recordFailedLogin(req, identifier);
      return res.status(401).json({
        success: false,
        code: 'PASSWORD_INVALID',
        message: 'Kata sandi salah',
        errors: [{ field: 'password', message: 'Kata sandi salah' }]
      });
    }

    if (user.email_verification_token || user.email_verification_expires_at) {
      await user.update({
        email_verified_at: user.email_verified_at || new Date(),
        email_verification_token: null,
        email_verification_expires_at: null,
        is_active: true
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun pelanggan tidak aktif'
      });
    }

    clearFailedLogin(req, identifier);

    await user.update({
      is_logged_in: true,
      last_login: new Date()
    });

    await savePelangganActivity(req, user, 'pelanggan_login', 'Pelanggan masuk ke aplikasi');

    return res.status(200).json({
      success: true,
      message: 'Login pelanggan berhasil',
      data: {
        token: generateToken(user.id),
        user: sanitizeUser(user)
      }
    });
  } catch (error) {
    console.error('Pelanggan login error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const logout = async (req, res) => {
  try {
    await savePelangganActivity(req, req.user, 'pelanggan_logout', 'Pelanggan keluar dari aplikasi');

    return res.status(200).json({
      success: true,
      message: 'Anda berhasil keluar.'
    });
  } catch (error) {
    console.error('Pelanggan logout error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const me = async (req, res) => res.status(200).json({
  success: true,
  data: sanitizeUser(req.user)
});

const updateProfile = async (req, res) => {
  try {
    const allowed = ['nama_lengkap', 'username', 'email', 'no_telp', 'jenis_kelamin', 'tanggal_lahir', 'alamat', 'bio'];
    const payload = Object.fromEntries(
      allowed
        .filter((key) => req.body[key] !== undefined)
        .map((key) => [key, req.body[key]])
    );

    if (payload.email || payload.username) {
      const duplicateWhere = [];
      if (payload.email) duplicateWhere.push({ email: payload.email });
      if (payload.username) duplicateWhere.push({ username: payload.username });

      const duplicate = await User.findOne({
        where: {
          id: { [Op.ne]: req.user.id },
          [Op.or]: duplicateWhere
        }
      });

      if (duplicate) {
        const errors = buildDuplicateUserErrors([duplicate], payload);
        return sendDuplicateResponse(res, errors, 'Email atau username sudah digunakan');
      }
    }

    const user = await User.findByPk(req.user.id);
    await user.update(payload);
    await savePelangganActivity(req, user, 'pelanggan_update_profile', 'Pelanggan memperbarui profil');

    return res.status(200).json({
      success: true,
      message: 'Profil pelanggan berhasil diperbarui',
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Pelanggan update profile error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const getProfileCovers = async (req, res) => res.status(200).json({
  success: true,
  data: {
    default_cover_id: DEFAULT_PROFILE_COVER_ID,
    active_cover_id: req.user?.profile_cover_id || DEFAULT_PROFILE_COVER_ID,
    covers: PROFILE_COVER_OPTIONS
  }
});

const updateProfileCover = async (req, res) => {
  try {
    const coverId = getProfileCoverOption(req.body.profile_cover_id).id;
    const user = await User.findByPk(req.user.id);
    await user.update({ profile_cover_id: coverId });

    await savePelangganActivity(req, user, 'pelanggan_update_profile', 'Pelanggan memperbarui cover profil');

    return res.status(200).json({
      success: true,
      message: 'Cover profil berhasil diperbarui',
      data: {
        user: sanitizeUser(user),
        active_cover_id: coverId,
        cover: getProfileCoverOption(coverId)
      }
    });
  } catch (error) {
    console.error('Pelanggan update profile cover error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File foto belum dipilih' });
    }

    const fotoUrl = getUploadedFileUrl(req.file);

    const user = await User.findByPk(req.user.id);
    await user.update({
      foto_profil: fotoUrl || getUploadedFileName(req.file),
      foto_base64: fotoUrl
    });

    await savePelangganActivity(req, user, 'pelanggan_upload_photo', 'Pelanggan memperbarui foto profil');

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil diunggah',
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Pelanggan upload photo error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    await user.update({
      foto_profil: null,
      foto_base64: null
    });

    await savePelangganActivity(req, user, 'pelanggan_upload_photo', 'Pelanggan menghapus foto profil');

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil dihapus',
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Pelanggan delete photo error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!(await user.comparePassword(current_password))) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah'
      });
    }

    await user.update({ password: new_password });
    await savePelangganActivity(req, user, 'pelanggan_update_password', 'Pelanggan mengubah password');

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui'
    });
  } catch (error) {
    console.error('Pelanggan update password error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const findPelangganByIdentifier = (identifier) => User.findOne({
  where: {
    role: 'pelanggan',
    [Op.or]: [
      { email: identifier },
      { no_langganan: identifier },
      { username: identifier }
    ]
  }
});

const forgotPassword = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email;
    if (!identifier) {
      return res.status(422).json({
        success: false,
        message: 'Email atau nomor langganan harus diisi'
      });
    }

    const user = await findPelangganByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Akun pelanggan tidak ditemukan'
      });
    }

    const [request] = await PasswordResetRequest.findOrCreate({
      where: {
        user_id: user.id,
        status: 'pending'
      },
      defaults: {
        user_id: user.id,
        nama_lengkap: user.nama_lengkap,
        identifier: user.email,
        used_identifier: identifier,
        no_telepon: user.no_telp || '-',
        status: 'pending',
        allow_reset: false,
        reset_completed: false
      }
    });

    if (!request.isNewRecord) {
      await request.update({
        used_identifier: identifier,
        nama_lengkap: user.nama_lengkap,
        no_telepon: user.no_telp || '-'
      });
    }

    const admins = await User.findAll({ where: { role: 'admin', is_active: true } });
    await Promise.all(admins.map((admin) => createNotificationWithCooldown({
      user_id: admin.id,
      title: 'Permintaan Reset Password Pelanggan',
      message: `${user.nama_lengkap} mengajukan reset password pelanggan untuk ${user.email}.`,
      type: 'warning',
      cooldownMs: 10 * 60 * 1000
    })));

    await savePelangganActivity(req, user, 'pelanggan_forgot_password', 'Pelanggan mengajukan reset password');

    return res.status(200).json({
      success: true,
      message: 'Permintaan reset password dikirim ke admin'
    });
  } catch (error) {
    console.error('Pelanggan forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const resetStatus = async (req, res) => {
  try {
    const identifier = req.query.identifier || req.query.email || req.user?.email;

    if (!identifier && !req.user) {
      return res.status(422).json({
        success: false,
        message: 'Identifier reset harus diisi'
      });
    }

    const user = req.user
      ? await User.findByPk(req.user.id)
      : await findPelangganByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email pelanggan tidak ditemukan'
      });
    }

    const request = await PasswordResetRequest.findOne({
      where: {
        user_id: user.id,
        reset_completed: false,
        status: { [Op.in]: ['pending', 'approved', 'rejected'] }
      },
      order: [['created_at', 'DESC']]
    });

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
    console.error('Pelanggan reset status error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const resetApprovedPassword = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email;
    const { new_password } = req.body;

    if (!identifier) {
      return res.status(422).json({
        success: false,
        message: 'Email pelanggan harus diisi'
      });
    }

    const user = await findPelangganByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email pelanggan tidak ditemukan'
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

    await savePelangganActivity(req, user, 'pelanggan_update_password', 'Pelanggan mengganti password setelah permintaan reset disetujui');

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diganti. Silakan login dengan password baru.'
    });
  } catch (error) {
    console.error('Pelanggan reset approved password error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = String(req.query.token || '').trim();
    if (!token) {
      return res.status(422).json({
        success: false,
        message: 'Tautan verifikasi email tidak ditemukan'
      });
    }

    const user = await User.findOne({
      where: {
        role: 'pelanggan',
        email_verification_token: hashVerificationToken(token)
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Tautan verifikasi tidak valid atau sudah digunakan'
      });
    }

    if (
      user.email_verification_expires_at
      && new Date(user.email_verification_expires_at).getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tautan verifikasi sudah kedaluwarsa. Silakan kirim ulang verifikasi.'
      });
    }

    await user.update({
      email_verified_at: new Date(),
      email_verification_token: null,
      email_verification_expires_at: null,
      is_active: true
    });

    return res.status(200).json({
      success: true,
      message: 'Email berhasil diverifikasi. Silakan login ke SIGAP.'
    });
  } catch (error) {
    console.error('Pelanggan verify email error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email;
    if (!identifier) {
      return res.status(422).json({
        success: false,
        message: 'Email atau nomor langganan harus diisi'
      });
    }

    const user = await findPelangganByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Akun pelanggan tidak ditemukan'
      });
    }

    if (user.email_verified_at) {
      return res.status(200).json({
        success: true,
        message: 'Email akun ini sudah terverifikasi.'
      });
    }

    const verificationToken = generateVerificationToken();
    await user.update({
      email_verification_token: hashVerificationToken(verificationToken),
      email_verification_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const verificationEmail = await sendVerificationEmail({ user, token: verificationToken });

    return res.status(200).json({
      success: true,
      message: verificationEmail.sent
        ? 'Email verifikasi berhasil dikirim ulang.'
        : 'Email verifikasi belum terkirim. Silakan hubungi admin bila masalah berlanjut.',
      data: {
        verification_email_sent: verificationEmail.sent
      }
    });
  } catch (error) {
    console.error('Pelanggan resend verification error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

const deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(req.user.id, { transaction });
    if (!user || user.role !== 'pelanggan') {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Akun pelanggan tidak ditemukan'
      });
    }

    const laporan = await Laporan.findAll({
      where: { pelanggan_id: user.id },
      attributes: ['id'],
      transaction
    });
    const laporanIds = laporan.map((item) => item.id);

    await Promise.all([
      LaporanKomentar.destroy({
        where: {
          [Op.or]: [
            { user_id: user.id },
            ...(laporanIds.length ? [{ laporan_id: { [Op.in]: laporanIds } }] : [])
          ]
        },
        transaction
      }),
      LaporanLike.destroy({
        where: {
          [Op.or]: [
            { user_id: user.id },
            ...(laporanIds.length ? [{ laporan_id: { [Op.in]: laporanIds } }] : [])
          ]
        },
        transaction
      }),
      Notifikasi.destroy({
        where: {
          [Op.or]: [
            { user_id: user.id },
            ...(laporanIds.length ? [{ laporan_id: { [Op.in]: laporanIds } }] : [])
          ]
        },
        transaction
      }),
      PasswordResetRequest.destroy({ where: { user_id: user.id }, transaction }),
      NotifikasiState.destroy({ where: { user_id: user.id }, transaction })
    ]);

    await Laporan.destroy({ where: { pelanggan_id: user.id }, transaction });
    await user.destroy({ transaction });
    await transaction.commit();

    await savePelangganActivity(req, req.user, 'pelanggan_hapus_akun', 'Pelanggan menghapus akun dan data terkait');

    return res.status(200).json({
      success: true,
      message: 'Akun pelanggan dan data terkait berhasil dihapus'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Pelanggan delete account error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  register,
  login,
  logout,
  me,
  updateProfile,
  getProfileCovers,
  updateProfileCover,
  uploadPhoto,
  deletePhoto,
  updatePassword,
  forgotPassword,
  resetStatus,
  resetApprovedPassword,
  verifyEmail,
  resendVerificationEmail,
  deleteAccount
};
