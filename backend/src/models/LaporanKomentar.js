// API Pelanggan - SIGAP: Model komentar laporan pelanggan.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanKomentar = sequelize.define('LaporanKomentar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  laporan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  komentar: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'laporan_komentar',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LaporanKomentar;
