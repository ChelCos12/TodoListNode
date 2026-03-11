require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db/connection');
const userRoutes  = require('./routes/user.routes'); 
const categoryRoutes = require('./routes/category.routes');
const tagRoutes = require('./routes/tag.routes');
const taskRoutes = require('./routes/task.routes');
const authMiddleware = require('./middlewares/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'FUNCIONANDO',
  });
});

app.use('/api', userRoutes);
app.use('/api/categorias',authMiddleware, categoryRoutes);
app.use('/api/etiquetas',authMiddleware, tagRoutes);
app.use('/api/tareas',authMiddleware, taskRoutes);

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