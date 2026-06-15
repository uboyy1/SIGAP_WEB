// Fungsi: Controller admin untuk menangani logika fitur admin.
// backend/src/controllers/admin/resetPasswordController.js
const { User, PasswordResetRequest, Notifikasi } = require('../../models');
const { Op } = require('sequelize');
const { saveActivityLog } = require('../aktivitasLogController');

// Get all password reset requests (admin)
const getAllResetRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    if (status && status !== 'Semua') {
      whereClause.status = status.toLowerCase();
    }
    
    console.log(`📋 Fetching reset requests with status filter: ${status || 'all'}`);
    
    const { count, rows } = await PasswordResetRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama_lengkap', 'email', 'no_langganan', 'no_telp']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ Found ${count} reset requests`);
    
    return res.status(200).json({
      success: true,
      data: {
        requests: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all reset requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

// Approve reset request
const approveResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan_admin } = req.body;
    
    const request = await PasswordResetRequest.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan sudah diproses'
      });
    }
    
    await request.update({
      status: 'approved',
      allow_reset: true,
      catatan_admin: catatan_admin || null,
      verified_by: req.user.id
    });
    
    // Create notification for user
    await Notifikasi.create({
      user_id: request.user_id,
      title: '✅ Permintaan Reset Password Disetujui',
      message: `Permintaan reset password Anda telah disetujui oleh Admin. Silakan buka aplikasi dan buat password baru.${catatan_admin ? `\n\nCatatan: ${catatan_admin}` : ''}`,
      type: 'success'
    });
    
    // Log activity
    await saveActivityLog({
      user_id: req.user.id,
      user_nama: req.user.nama_lengkap,
      user_role: req.user.role,
      tipe_aktivitas: 'approve_reset',
      deskripsi: `Menyetujui permintaan reset password untuk ${request.user?.nama_lengkap || request.nama_lengkap}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    console.log(`✅ Reset request ${id} approved for user: ${request.user?.nama_lengkap}`);
    
    return res.status(200).json({
      success: true,
      message: 'Permintaan reset password disetujui. Notifikasi telah dikirim ke pengguna.'
    });
  } catch (error) {
    console.error('Approve reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

// Reject reset request
const rejectResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan_admin } = req.body;
    
    const request = await PasswordResetRequest.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Permintaan sudah diproses'
      });
    }
    
    if (!catatan_admin) {
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan harus diisi'
      });
    }
    
    await request.update({
      status: 'rejected',
      allow_reset: false,
      catatan_admin: catatan_admin,
      verified_by: req.user.id
    });
    
    // Create notification for user
    await Notifikasi.create({
      user_id: request.user_id,
      title: '❌ Permintaan Reset Password Ditolak',
      message: `Permintaan reset password Anda ditolak oleh Admin.\n\nAlasan: ${catatan_admin}\n\nSilakan hubungi admin untuk informasi lebih lanjut.`,
      type: 'danger'
    });
    
    // Log activity
    await saveActivityLog({
      user_id: req.user.id,
      user_nama: req.user.nama_lengkap,
      user_role: req.user.role,
      tipe_aktivitas: 'reject_reset',
      deskripsi: `Menolak permintaan reset password untuk ${request.user?.nama_lengkap || request.nama_lengkap} dengan alasan: ${catatan_admin}`,
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });
    
    console.log(`❌ Reset request ${id} rejected for user: ${request.user?.nama_lengkap}`);
    
    return res.status(200).json({
      success: true,
      message: 'Permintaan reset password ditolak. Notifikasi telah dikirim ke pengguna.'
    });
  } catch (error) {
    console.error('Reject reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

// Get single reset request
const getResetRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await PasswordResetRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama_lengkap', 'email', 'no_langganan', 'no_telp']
        }
      ]
    });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Permintaan tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get reset request by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

module.exports = {
  getAllResetRequests,
  approveResetRequest,
  rejectResetRequest,
  getResetRequestById
};