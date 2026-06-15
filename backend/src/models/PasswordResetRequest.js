// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetRequest = sequelize.define('PasswordResetRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  identifier: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'email atau no_langganan'
  },
  used_identifier: {
    type: DataTypes.STRING(100),
    comment: 'Identifier yang digunakan saat request'
  },
  no_telepon: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  allow_reset: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '1 jika user boleh reset password'
  },
  reset_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '1 jika user sudah reset password'
  },
  reset_completed_at: {
    type: DataTypes.DATE,
    comment: 'waktu user selesai reset'
  },
  catatan_admin: {
    type: DataTypes.TEXT
  },
  verified_by: {
    type: DataTypes.INTEGER,
    comment: 'admin yang memverifikasi'
  }
}, {
  tableName: 'password_reset_requests',
  timestamps: true,
  underscored: true
});

module.exports = PasswordResetRequest;