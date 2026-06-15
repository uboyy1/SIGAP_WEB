const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const aktivitasTypes = [
  'login',
  'laporan_baru',
  'ambil_tugas',
  'laporan_darurat',
  'beri_tugas',
  'update_status',
  'hapus_laporan',
  'tambah_user',
  'edit_user',
  'hapus_user',
  'reset_password',
  'approve_reset',
  'reject_reset',
  'pelanggan_register',
  'pelanggan_login',
  'pelanggan_logout',
  'pelanggan_update_profile',
  'pelanggan_upload_photo',
  'pelanggan_update_password',
  'pelanggan_forgot_password',
  'pelanggan_buat_laporan',
  'pelanggan_edit_laporan',
  'pelanggan_hapus_laporan',
  'pelanggan_like_laporan',
  'pelanggan_komentar_laporan',
  'pelanggan_hapus_akun'
];

const columns = [
  ['email_verified_at', 'DATETIME NULL'],
  ['email_verification_token', 'VARCHAR(128) NULL'],
  ['email_verification_expires_at', 'DATETIME NULL']
];

const tableExists = async (connection, tableName) => {
  const [rows] = await connection.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return Number(rows[0]?.count || 0) > 0;
};

const columnExists = async (connection, tableName, columnName) => {
  const [rows] = await connection.query(
    `SHOW COLUMNS FROM ${connection.escapeId(tableName)} LIKE ?`,
    [columnName]
  );

  return rows.length > 0;
};

const indexExists = async (connection, tableName, indexName) => {
  const [rows] = await connection.query(
    `SHOW INDEX FROM ${connection.escapeId(tableName)} WHERE Key_name = ?`,
    [indexName]
  );

  return rows.length > 0;
};

const createIndexIfMissing = async (connection, tableName, indexName, sql) => {
  if (!(await tableExists(connection, tableName))) {
    console.log(`table missing ${tableName}, skipped index ${indexName}`);
    return;
  }

  if (await indexExists(connection, tableName, indexName)) {
    console.log(`index exists ${indexName}`);
    return;
  }

  await connection.query(sql);
  console.log(`added index ${indexName}`);
};

const ensureEmailVerificationColumns = async (connection) => {
  for (const [name, type] of columns) {
    if (!(await columnExists(connection, 'users', name))) {
      await connection.query(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
      console.log(`added column ${name}`);
    } else {
      console.log(`column exists ${name}`);
    }
  }

  await connection.query(`
    UPDATE users
    SET email_verified_at = COALESCE(email_verified_at, created_at, NOW())
    WHERE role = 'pelanggan'
      AND email_verified_at IS NULL
      AND email_verification_token IS NULL
  `);
  console.log('existing pelanggan accounts marked as verified');

  await createIndexIfMissing(
    connection,
    'users',
    'idx_users_email_verification_token',
    'CREATE INDEX idx_users_email_verification_token ON users (email_verification_token)'
  );
};

const ensurePelangganTables = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS laporan_komentar (
      id INT AUTO_INCREMENT PRIMARY KEY,
      laporan_id INT NOT NULL,
      user_id INT NOT NULL,
      komentar TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_laporan_komentar_laporan_id (laporan_id),
      INDEX idx_laporan_komentar_user_id (user_id)
    )
  `);
  console.log('table ready laporan_komentar');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS laporan_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      laporan_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_like (laporan_id, user_id),
      INDEX idx_laporan_likes_laporan_id (laporan_id),
      INDEX idx_laporan_likes_user_id (user_id)
    )
  `);
  console.log('table ready laporan_likes');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS notification_states (
      user_id INT NOT NULL PRIMARY KEY,
      notifications_cleared_at DATETIME NULL,
      CONSTRAINT fk_notification_states_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  console.log('table ready notification_states');
};

const ensureIndexes = async (connection) => {
  await createIndexIfMissing(
    connection,
    'laporan_komentar',
    'idx_laporan_komentar_laporan_id',
    'CREATE INDEX idx_laporan_komentar_laporan_id ON laporan_komentar (laporan_id)'
  );
  await createIndexIfMissing(
    connection,
    'laporan_komentar',
    'idx_laporan_komentar_user_id',
    'CREATE INDEX idx_laporan_komentar_user_id ON laporan_komentar (user_id)'
  );
  await createIndexIfMissing(
    connection,
    'laporan_likes',
    'idx_laporan_likes_laporan_id',
    'CREATE INDEX idx_laporan_likes_laporan_id ON laporan_likes (laporan_id)'
  );
  await createIndexIfMissing(
    connection,
    'laporan_likes',
    'idx_laporan_likes_user_id',
    'CREATE INDEX idx_laporan_likes_user_id ON laporan_likes (user_id)'
  );
  await createIndexIfMissing(
    connection,
    'laporan',
    'idx_laporan_pelanggan_created_at',
    'CREATE INDEX idx_laporan_pelanggan_created_at ON laporan (pelanggan_id, created_at)'
  );
  await createIndexIfMissing(
    connection,
    'laporan',
    'idx_laporan_public_feed',
    'CREATE INDEX idx_laporan_public_feed ON laporan (status, opsi_privasi, created_at)'
  );
  await createIndexIfMissing(
    connection,
    'notifications',
    'idx_notifications_user_created_at',
    'CREATE INDEX idx_notifications_user_created_at ON notifications (user_id, created_at)'
  );
};

const ensureAktivitasEnum = async (connection) => {
  if (!(await tableExists(connection, 'aktivitas_log'))) {
    console.log('table missing aktivitas_log, skipped enum sync');
    return;
  }

  const enumValues = aktivitasTypes.map((type) => connection.escape(type)).join(', ');
  await connection.query(`
    ALTER TABLE aktivitas_log
      MODIFY tipe_aktivitas ENUM(${enumValues}) NOT NULL
  `);
  console.log('aktivitas_log tipe_aktivitas enum synced');
};

const main = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    await ensureEmailVerificationColumns(connection);
    await ensurePelangganTables(connection);
    await ensureIndexes(connection);
    await ensureAktivitasEnum(connection);
    console.log('pelanggan database compatibility migration completed');
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
