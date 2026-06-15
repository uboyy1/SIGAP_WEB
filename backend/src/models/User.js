// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  no_langganan: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  no_telp: {
    type: DataTypes.STRING(20)
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('Laki-laki', 'Perempuan')
  },
  tanggal_lahir: {
    type: DataTypes.DATEONLY
  },
  alamat: {
    type: DataTypes.TEXT
  },
  foto_profil: {
    type: DataTypes.STRING(500)
  },
  foto_base64: {
    type: DataTypes.TEXT('long')
  },
  bio: {
    type: DataTypes.TEXT
  },
  role: {
    type: DataTypes.ENUM('pelanggan', 'teknisi', 'kepala_teknisi', 'admin'),
    defaultValue: 'pelanggan'
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_logged_in: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  remember_me: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_verification_token: {
    type: DataTypes.STRING(128),
    allowNull: true
  },
  email_verification_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

const normalizeBcryptHash = (hash) => {
  const value = String(hash || '');
  return value.startsWith('$2y$') ? `$2a$${value.slice(4)}` : value;
};

User.prototype.comparePassword = async function(password) {
  if (!password || !this.password) return false;
  return await bcrypt.compare(password, normalizeBcryptHash(this.password));
};

module.exports = User;
