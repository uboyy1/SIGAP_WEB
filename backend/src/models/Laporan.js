// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Laporan = sequelize.define('Laporan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pelanggan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kategori_gangguan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  judul: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT
  },
  lokasi: {
    type: DataTypes.TEXT
  },
  nomor_telepon: {
    type: DataTypes.STRING(20)
  },
  foto: {
    type: DataTypes.STRING(500)
  },
  opsi_privasi: {
    type: DataTypes.ENUM('anonim', 'rahasia', 'anonim_rahasia', 'tidak_ada'),
    defaultValue: 'tidak_ada'
  },
  sub_kategori: {
    type: DataTypes.STRING(255)
  },
  tanggal_kejadian: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('menunggu', 'divalidasi', 'ditolak', 'dalam_penanganan', 'selesai'),
    defaultValue: 'menunggu'
  },
  prioritas: {
    type: DataTypes.ENUM('rendah', 'sedang', 'tinggi'),
    defaultValue: 'sedang'
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'laporan',
  timestamps: true,
  underscored: true
});

module.exports = Laporan;