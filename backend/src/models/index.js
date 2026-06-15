// Fungsi: Model Sequelize untuk struktur tabel dan relasi database.
const sequelize = require('../config/database');
const User = require('./User');
const KategoriGangguan = require('./KategoriGangguan');
const Laporan = require('./Laporan');
const Tugas = require('./Tugas');
const Notifikasi = require('./Notifikasi');
const NotifikasiState = require('./NotifikasiState');
const LaporanKomentar = require('./LaporanKomentar');
const LaporanLike = require('./LaporanLike');
const PasswordResetRequest = require('./PasswordResetRequest');
const LaporanDarurat = require('./LaporanDarurat');
const AktivitasLog = require('./AktivitasLog'); 

// Define associations
User.hasMany(Laporan, { foreignKey: 'pelanggan_id', as: 'laporans' });
Laporan.belongsTo(User, { foreignKey: 'pelanggan_id', as: 'pelanggan' });

Laporan.belongsTo(KategoriGangguan, { foreignKey: 'kategori_gangguan_id', as: 'kategori' });
KategoriGangguan.hasMany(Laporan, { foreignKey: 'kategori_gangguan_id', as: 'laporans' });

Laporan.hasMany(LaporanKomentar, { foreignKey: 'laporan_id', as: 'komentar' });
LaporanKomentar.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });
LaporanKomentar.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(LaporanKomentar, { foreignKey: 'user_id', as: 'komentar_laporan' });

Laporan.hasMany(LaporanLike, { foreignKey: 'laporan_id', as: 'likes' });
LaporanLike.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });
LaporanLike.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(LaporanLike, { foreignKey: 'user_id', as: 'likes_laporan' });

User.hasMany(Tugas, { foreignKey: 'teknisi_id', as: 'tugas_teknisi' });
User.hasMany(Tugas, { foreignKey: 'kepala_teknisi_id', as: 'tugas_kepala' });
Tugas.belongsTo(User, { foreignKey: 'teknisi_id', as: 'teknisi' });
Tugas.belongsTo(User, { foreignKey: 'kepala_teknisi_id', as: 'kepala_teknisi' });
Tugas.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });
Laporan.hasOne(Tugas, { foreignKey: 'laporan_id', as: 'tugas' });

User.hasMany(Notifikasi, { foreignKey: 'user_id', as: 'notifikasi' });
Notifikasi.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notifikasi.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });
User.hasOne(NotifikasiState, { foreignKey: 'user_id', as: 'notifikasi_state' });
NotifikasiState.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(PasswordResetRequest, { foreignKey: 'user_id', as: 'reset_requests' });
PasswordResetRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(LaporanDarurat, { foreignKey: 'teknisi_id', as: 'laporan_darurat' });
LaporanDarurat.belongsTo(User, { foreignKey: 'teknisi_id', as: 'teknisi' });

User.hasMany(AktivitasLog, { foreignKey: 'user_id', as: 'aktivitas_logs' });
AktivitasLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  KategoriGangguan,
  Laporan,
  Tugas,
  Notifikasi,
  NotifikasiState,
  LaporanKomentar,
  LaporanLike,
  PasswordResetRequest,
  LaporanDarurat,
  AktivitasLog 
};
