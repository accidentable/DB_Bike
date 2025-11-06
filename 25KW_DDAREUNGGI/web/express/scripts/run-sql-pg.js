const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

function splitStatements(sql) {
  // Simple splitter by semicolon; ignores semicolons in strings roughly
  // For provided files, this is sufficient. Empty/whitespace-only parts are filtered.
  const parts = sql
    .split(/;\s*\n|;\s*$/gm)
    .map(s => s.trim())
    .filter(Boolean);
  return parts;
}

async function main() {
  const sqlArg = process.argv[2];
  if (!sqlArg) {
    console.error('Usage: node scripts/run-sql-pg.js <path-to-sql>');
    process.exit(1);
  }

  const sqlPath = path.resolve(sqlArg);
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const targetDb = process.env.PGDATABASE || process.env.DB_NAME || 'ddareung';
  const getPassword = () => {
    const pwd = process.env.PGPASSWORD || process.env.DB_PASSWORD || '';
    return pwd === '' ? null : pwd;
  };
  const pass = getPassword();
  const bootstrapConfig = {
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    database: 'postgres',
  };
  if (pass !== null) bootstrapConfig.password = pass;
  const bootstrapClient = new Client(bootstrapConfig);

  await bootstrapClient.connect();
  try {
    await bootstrapClient.query(`CREATE DATABASE "${targetDb}"`);
  } catch (e) {
    // ignore if exists
  } finally {
    await bootstrapClient.end();
  }

  const clientConfig = {
    host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    database: targetDb,
  };
  if (pass !== null) clientConfig.password = pass;
  const client = new Client(clientConfig);

  await client.connect();
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = splitStatements(sql);

  try {
    for (const stmt of statements) {
      await client.query(stmt);
    }
    console.log(`Executed ${statements.length} statements from ${sqlPath}`);
  } catch (err) {
    console.error('SQL execution error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
