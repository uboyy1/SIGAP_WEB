// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
// backend/src/models/AktivitasLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AktivitasLog = sequelize.define('AktivitasLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_nama: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  user_role: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tipe_aktivitas: {
    type: DataTypes.ENUM(
      'login',
      'laporan_baru',
      'ambil_tugas',
      'laporan_darurat',
      'beri_tugas',
      'update_status',
      'hapus_laporan',
      'tambah_user',
      'edit_user',
      'hapus_user',
      'reset_password',
      'approve_reset',
      'reject_reset',
      'pelanggan_register',
      'pelanggan_login',
      'pelanggan_logout',
      'pelanggan_update_profile',
      'pelanggan_upload_photo',
      'pelanggan_update_password',
      'pelanggan_forgot_password',
      'pelanggan_buat_laporan',
      'pelanggan_edit_laporan',
      'pelanggan_hapus_laporan',
      'pelanggan_like_laporan',
      'pelanggan_komentar_laporan',
      'pelanggan_hapus_akun'
    ),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  detail_data: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string dari data terkait'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'aktivitas_log',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AktivitasLog;
