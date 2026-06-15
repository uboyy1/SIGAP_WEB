// API Pelanggan - SIGAP: Model like laporan pelanggan.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanLike = sequelize.define('LaporanLike', {
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
  }
}, {
  tableName: 'laporan_likes',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['laporan_id', 'user_id']
    }
  ]
});

module.exports = LaporanLike;
