const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db/connection');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'FUNCIONANDO',
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();