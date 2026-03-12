const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { taskDecorator } = require('../decorators/task.decorator');

const getTaskFull = async (id) => {
  try {
      const [[task]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) return null;
    const [[categoria]] = await pool.query('SELECT * FROM categories WHERE id = ?', [task.categoria_id]);
    const [etiquetas] = await pool.query(
      `SELECT t.* FROM tags t
      INNER JOIN task_tags tt ON t.id = tt.etiqueta_id
      WHERE tt.tarea_id = ?`,
      [id]
    );
    return taskDecorator(task, categoria, etiquetas);
  } catch (error) {
    throw error;
  }
};

const index = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    const tasks = await Promise.all(rows.map(async (task) => {
      const [[categoria]] = await pool.query('SELECT * FROM categories WHERE id = ?', [task.categoria_id]);
      const [etiquetas] = await pool.query(
        `SELECT t.* FROM tags t
        INNER JOIN task_tags tt ON t.id = tt.etiqueta_id
        WHERE tt.tarea_id = ?`,
        [task.id]
      );
      return taskDecorator(task, categoria, etiquetas);
    }));
    res.json({ data: tasks });
  } catch (error) {
    res.json(error);
  }
};

const store = async (req, res) => {
  try {
    const { titulo, descripcion, categoria_id, etiquetas } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tasks (id, titulo, descripcion, categoria_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [id, titulo, descripcion || null, categoria_id || null]
    );

    if (etiquetas && etiquetas.length > 0) {
      for (const etiqueta_id of etiquetas) {
        await pool.query(
          'INSERT INTO task_tags (tarea_id, etiqueta_id) VALUES (?, ?)',
          [id, etiqueta_id]
        );
      }
    }
    const task = await getTaskFull(id);
    res.json({ data: task });
  } catch (error) {
    res.json(error);
  }
};

const show = async (req, res) => {
  try {
    const task = await getTaskFull(req.params.id);
    if (!task) return res.json(null);
    res.json({ data: task });
  } catch (error) {
    res.json(error);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria_id, completada, etiquetas } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) return res.json(null);
    await pool.query(
      'UPDATE tasks SET titulo = ?, descripcion = ?, categoria_id = ?, completada = ?, updated_at = NOW() WHERE id = ?',
      [
        titulo || existing.titulo,
        descripcion !== undefined ? descripcion : existing.descripcion,
        categoria_id !== undefined ? categoria_id : existing.categoria_id,
        completada !== undefined ? completada : existing.completada,
        id,
      ]
    );
    if (etiquetas !== undefined) {
      await pool.query('DELETE FROM task_tags WHERE tarea_id = ?', [id]);
      for (const etiqueta_id of etiquetas) {
        await pool.query(
          'INSERT INTO task_tags (tarea_id, etiqueta_id) VALUES (?, ?)',
          [id, etiqueta_id]
        );
      }
    }
    const task = await getTaskFull(id);
    res.json({ data: task });
  } catch (error) {
    res.json(error);
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existing) return res.json(null);
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.json(error);
  }
};

module.exports = { index, store, show, update, destroy };