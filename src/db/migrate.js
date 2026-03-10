const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('./connection');

const runMigrations = async () => {
  await testConnection();
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    await pool.query(sql);
    console.log(`Migración:  ${file}`);
  }

  console.log('Migraciones completadas');
  process.exit(0);
};

runMigrations();