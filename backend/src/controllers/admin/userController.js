// Fungsi: Controller admin untuk menangani logika fitur admin.
// backend/src/controllers/admin/userController.js
const { Notifikasi, User } = require('../../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { getUploadedFileUrl } = require('../../utils/uploadedFile');

// Helper generate username unik
const generateUniqueUsername = async (namaLengkap) => {
  let base = namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!base) base = 'user';
  let username = base;
  let counter = 1;
  let exists = await User.findOne({ where: { username } });
  while (exists) {
    username = `${base}${counter}`;
    exists = await User.findOne({ where: { username } });
    counter++;
  }
  return username;
};

const generateNoLangganan = (role = 'user') => {
  const prefix = role === 'pelanggan'
    ? 'PLG'
    : role.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) || 'USR';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    const inactiveCutoff = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));

    await User.update(
      { is_active: false, is_logged_in: false },
      {
        where: {
          is_active: true,
          [Op.or]: [
            { last_login: { [Op.lt]: inactiveCutoff } },
            {
              last_login: null,
              created_at: { [Op.lt]: inactiveCutoff }
            }
          ]
        }
      }
    );
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        [Op.or]: [
          { nama_lengkap: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { no_langganan: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (role && role !== 'Semua') {
      const roleMap = {
        'kepala teknisi': 'kepala_teknisi'
      };
      whereClause.role = roleMap[role.toLowerCase()] || role.toLowerCase();
    }

    if (status && status !== 'Semua' && status !== 'Semua Status') {
      const normalizedStatus = status.toLowerCase();
      whereClause.is_active = normalizedStatus === 'aktif' || normalizedStatus === 'active';
    }
    
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    const totalPelanggan = await User.count({ where: { role: 'pelanggan' } });
    const totalTeknisi = await User.count({ where: { role: 'teknisi' } });
    const totalKepalaTeknisi = await User.count({ where: { role: 'kepala_teknisi' } });
    const totalAdmin = await User.count({ where: { role: 'admin' } });
    
    return res.status(200).json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        statistics: {
          total_pelanggan: totalPelanggan,
          total_teknisi: totalTeknisi,
          total_kepala_teknisi: totalKepalaTeknisi,
          total_admin: totalAdmin,
          total_users: count
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by id error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const {
      no_langganan,
      nama_lengkap,
      email,
      no_telp,
      jenis_kelamin,
      tanggal_lahir,
      alamat,
      role,
      password
    } = req.body;
    
    const normalizedNoLangganan = no_langganan && no_langganan.trim()
      ? no_langganan.trim()
      : generateNoLangganan(role);

    if (normalizedNoLangganan) {
      const existingNoLangganan = await User.findOne({ where: { no_langganan: normalizedNoLangganan } });
      if (existingNoLangganan) {
        return res.status(400).json({
          success: false,
          message: 'No Langganan sudah digunakan'
        });
      }
    }
    
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan'
      });
    }
    
    const username = await generateUniqueUsername(nama_lengkap);
    
    const user = await User.create({
      no_langganan: normalizedNoLangganan,
      nama_lengkap,
      username,
      email,
      no_telp: no_telp || null,
      jenis_kelamin: jenis_kelamin || 'Laki-laki',
      tanggal_lahir: tanggal_lahir || null,
      alamat: alamat || '',
      role: role.toLowerCase(),
      password,
      is_active: true
    });
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    return res.status(201).json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors.map(e => e.path).join(', ');
      return res.status(400).json({
        success: false,
        message: `Data sudah ada: ${fields}`
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { no_langganan, nama_lengkap, email, no_telp, jenis_kelamin, tanggal_lahir, alamat, role, is_active } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    if (no_langganan && no_langganan !== user.no_langganan) {
      const existingNoLangganan = await User.findOne({ where: { no_langganan } });
      if (existingNoLangganan) {
        return res.status(400).json({
          success: false,
          message: 'No Langganan sudah digunakan'
        });
      }
    }
    
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }
    }
    
    await user.update({
      no_langganan: no_langganan !== undefined ? no_langganan : user.no_langganan,
      nama_lengkap: nama_lengkap || user.nama_lengkap,
      email: email || user.email,
      no_telp: no_telp || user.no_telp,
      jenis_kelamin: jenis_kelamin || user.jenis_kelamin,
      tanggal_lahir: tanggal_lahir || user.tanggal_lahir,
      alamat: alamat || user.alamat,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    });
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    return res.status(200).json({
      success: true,
      message: 'User berhasil diperbarui',
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
    }
    await user.destroy();
    return res.status(200).json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// Reset password
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    await user.update({ password: new_password });
    await Notifikasi.create({
      user_id: user.id,
      title: 'Password Direset',
      message: 'Password akun Anda telah direset oleh admin. Silakan gunakan password baru untuk masuk.',
      type: 'info'
    });
    return res.status(200).json({
      success: true,
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Upload profile picture - DIPERBAIKI
const uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📸 Upload foto profil untuk user ID: ${id}`);
    console.log(`📸 File received:`, req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'File gambar diperlukan' 
      });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      // Hapus file yang sudah terupload jika user tidak ditemukan
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      });
    }
    
    // Hapus foto lama jika ada (async, tidak blocking)
    if (user.foto_profil) {
      const oldPath = path.join(__dirname, '../../', user.foto_profil);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.error('Gagal hapus file lama:', err);
          else console.log('✅ File lama terhapus:', oldPath);
        });
      }
    }
    
    // Simpan path foto baru
    const fotoUrl = getUploadedFileUrl(req.file);
    await user.update({ foto_profil: fotoUrl, foto_base64: fotoUrl });
    
    console.log(`✅ Foto profil berhasil diupdate untuk user: ${user.nama_lengkap}`);
    
    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil diupload',
      data: { 
        foto_profil: fotoUrl,
        foto_base64: fotoUrl,
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          email: user.email,
          foto_profil: fotoUrl,
          foto_base64: fotoUrl
        }
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    // Hapus file jika terjadi error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  uploadProfilePicture
};
