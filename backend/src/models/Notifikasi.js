// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notifikasi = sequelize.define('Notifikasi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  laporan_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('pengajuan', 'ditolak', 'dalam_penanganan', 'selesai', 'penugasan', 'pengambilan_tugas', 'laporan_darurat', 'info', 'success', 'warning', 'danger'),
    defaultValue: 'info'
  },
  catatan_teknisi: {
    type: DataTypes.TEXT
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Notifikasi;