import sql from 'mssql';

// Creates the application database if it does not exist yet.
// TypeORM's synchronize creates the tables, but not the database itself.
const dbName = process.env.DB_NAME || 'venue_booking';

async function main() {
  const pool = await sql.connect({
    server: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 1433,
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'SqlExpress#2026',
    database: 'master',
    options: { encrypt: false, trustServerCertificate: true },
  });
  await pool.request().query(`IF DB_ID(N'${dbName}') IS NULL CREATE DATABASE [${dbName}]`);
  console.log(`Database "${dbName}" is ready`);
  await pool.close();
}

main().catch((err) => {
  console.error('Failed to create database:', err);
  process.exit(1);
});
