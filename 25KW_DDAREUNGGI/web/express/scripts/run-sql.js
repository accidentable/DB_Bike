const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const sqlArg = process.argv[2];
  if (!sqlArg) {
    console.error('Usage: node scripts/run-sql.js <path-to-sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(sqlArg);
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || 'ddareung';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  // Split by semicolon but preserve statements across lines; handle DELIMITER not used here
  try {
    console.log(`Running SQL: ${sqlPath}`);
    await connection.query(sql);
    console.log('Done.');
  } catch (err) {
    console.error('SQL execution error:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();


