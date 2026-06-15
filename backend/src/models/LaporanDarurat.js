// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
// backend/src/models/LaporanDarurat.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanDarurat = sequelize.define('LaporanDarurat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teknisi_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  judul_laporan: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  jenis_kendala: {
    type: DataTypes.ENUM('infrastruktur', 'operasional', 'pelayanan', 'sumber_daya', 'lainnya'),
    allowNull: false
  },
  deskripsi_laporan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rekomendasi_tindak_lanjut: {
    type: DataTypes.TEXT
  },
  lokasi_laporan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tanggal_kejadian: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  foto_laporan: {
    type: DataTypes.STRING(500)  // Path foto
  },
  status: {
    type: DataTypes.ENUM('dilaporkan', 'diproses', 'selesai'),
    defaultValue: 'dilaporkan'
  },
  catatan_kepala_teknisi: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'laporan_darurat',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LaporanDarurat;