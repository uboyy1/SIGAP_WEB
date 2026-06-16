const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const DEFAULT_PROFILE_COVER_ID = 'sigap-default';

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

const main = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    if (!(await columnExists(connection, 'users', 'profile_cover_id'))) {
      await connection.query(
        'ALTER TABLE users ADD COLUMN profile_cover_id VARCHAR(64) NOT NULL DEFAULT ?',
        [DEFAULT_PROFILE_COVER_ID]
      );
      console.log('added column users.profile_cover_id');
    } else {
      console.log('column exists users.profile_cover_id');
    }

    await connection.query(
      'UPDATE users SET profile_cover_id = ? WHERE profile_cover_id IS NULL OR profile_cover_id = ""',
      [DEFAULT_PROFILE_COVER_ID]
    );
    console.log('empty profile cover values normalized');

    if (!(await indexExists(connection, 'users', 'idx_users_profile_cover_id'))) {
      await connection.query('CREATE INDEX idx_users_profile_cover_id ON users (profile_cover_id)');
      console.log('added index idx_users_profile_cover_id');
    } else {
      console.log('index exists idx_users_profile_cover_id');
    }

    console.log('profile cover migration completed');
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
