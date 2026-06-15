// Fungsi: Controller kepala teknisi untuk menangani logika fitur kepala teknisi.
// backend/src/controllers/kepalaTeknisi/profileController.js
const { Op } = require('sequelize');
const { User } = require('../../models');
const fs = require('fs');
const sharp = require('sharp');

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        username: user.username,
        role: user.role,
        no_telp: user.no_telp,
        bio: user.bio,
        foto_profil: user.foto_profil,
        foto_base64: user.foto_base64,
        jenis_kelamin: user.jenis_kelamin,
        tanggal_lahir: user.tanggal_lahir,
        alamat: user.alamat
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { nama_lengkap, username, no_telp, bio, jenis_kelamin, tanggal_lahir, alamat } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          username: username,
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
      bio: bio !== undefined ? bio : user.bio,
      jenis_kelamin: jenis_kelamin || user.jenis_kelamin,
      tanggal_lahir: tanggal_lahir || user.tanggal_lahir,
      alamat: alamat !== undefined ? alamat : user.alamat
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
        no_telp: user.no_telp,
        bio: user.bio,
        foto_profil: user.foto_profil,
        foto_base64: user.foto_base64,
        jenis_kelamin: user.jenis_kelamin,
        tanggal_lahir: user.tanggal_lahir,
        alamat: user.alamat
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru harus diisi'
      });
    }
    
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter'
      });
    }
    
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
    console.error('Update password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Upload profile photo with compression
const uploadProfilePhoto = async (req, res) => {
  try {
    console.log(`📸 Upload foto profil untuk user ID: ${req.user.id}`);

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

    let imageBuffer = fs.readFileSync(req.file.path);
    
    if (imageBuffer.length > 500 * 1024) {
      try {
        imageBuffer = await sharp(imageBuffer)
          .resize(500, 500, { fit: 'inside' })
          .jpeg({ quality: 70 })
          .toBuffer();
        console.log(`📸 Image compressed from ${req.file.size} to ${imageBuffer.length} bytes`);
      } catch (compressError) {
        console.warn('Compression failed, using original:', compressError.message);
      }
    }
    
    const base64String = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const fotoBase64 = `data:${mimeType};base64,${base64String}`;

    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    await user.update({ 
      foto_profil: req.file.filename,
      foto_base64: fotoBase64 
    });
    await user.reload();

    console.log('Foto profil berhasil disimpan');

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil diupload',
      data: {
        foto_profil: req.file.filename,
        foto_base64: fotoBase64,
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          email: user.email,
          username: user.username,
          role: user.role,
          foto_profil: user.foto_profil,
          foto_base64: user.foto_base64,
          no_telp: user.no_telp,
          bio: user.bio
        }
      }
    });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server'
    });
  }
};

const deleteProfilePhoto = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil dihapus',
      data: {
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          email: user.email,
          username: user.username,
          role: user.role,
          foto_profil: user.foto_profil,
          foto_base64: user.foto_base64,
          no_telp: user.no_telp,
          bio: user.bio
        }
      }
    });
  } catch (error) {
    console.error('Delete profile photo error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server'
    });
  }
};

module.exports = { getProfile, updateProfile, updatePassword, uploadProfilePhoto, deleteProfilePhoto };
