// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tugas = sequelize.define('Tugas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  laporan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teknisi_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  kepala_teknisi_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  judul_tugas: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  deskripsi_tugas: {
    type: DataTypes.TEXT
  },
  lokasi_tugas: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nomor_telepon_pelanggan: {
    type: DataTypes.STRING(20)
  },
  prioritas: {
    type: DataTypes.ENUM('rendah', 'sedang', 'tinggi'),
    defaultValue: 'sedang'
  },
  status: {
    type: DataTypes.ENUM('menunggu_diambil', 'dalam_proses', 'selesai', 'dibatalkan'),
    defaultValue: 'menunggu_diambil'
  },
  catatan_teknisi: {
    type: DataTypes.TEXT
  },
  tanggal_ditugaskan: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tanggal_diambil: {
    type: DataTypes.DATE
  },
  tanggal_selesai: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'tugas',
  timestamps: true,
  underscored: true
});

module.exports = Tugas;