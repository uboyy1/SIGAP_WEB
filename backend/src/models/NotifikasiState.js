// Fungsi: Model untuk menyimpan preferensi status notifikasi per user.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotifikasiState = sequelize.define('NotifikasiState', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  notifications_cleared_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'notification_states',
  timestamps: false,
  underscored: true
});

module.exports = NotifikasiState;
