// Fungsi: Konfigurasi backend untuk koneksi database Railway.
// backend/src/config/database.js
const { Sequelize } = require('sequelize');

require('./env');

if (process.env.NODE_ENV !== 'production') {
  console.log('DB_HOST=', process.env.DB_HOST);
  console.log('DB_PORT=', process.env.DB_PORT);
  console.log('DB_NAME=', process.env.DB_NAME);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
