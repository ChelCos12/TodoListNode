const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('./connection');

const runMigrations = async () => {
  await testConnection();

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    const queries = sql.split(';').map(q => q.trim()).filter(q => q.length);

    for (const query of queries) {
      await pool.query(query);
    }

    console.log(`Migración ejecutada: ${file}`);
  }

  console.log('Migraciones completadas');
  process.exit(0);
};

runMigrations();