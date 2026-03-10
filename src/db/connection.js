const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});


const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL conectado');
  } catch (err) {
    console.error('Error MySQL:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };