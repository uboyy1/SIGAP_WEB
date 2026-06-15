// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
// backend/src/models/KategoriGangguan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KategoriGangguan = sequelize.define('KategoriGangguan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_kategori: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
  // Kolom deskripsi telah dihapus dari database
}, {
  tableName: 'kategori_gangguan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = KategoriGangguan;