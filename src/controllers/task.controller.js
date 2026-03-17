const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { taskDecorator } = require('../decorators/task.decorator');
const { paginate } = require('../utils/paginate');
const user_id = 1;

const PER_PAGE = 5;
const BASE_PATH = 'http://localhost:3000/api/tareas';

const getTaskFull = async (id, user_id) => {
  try {
    const [[task]] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, user_id]);
    if (!task) {
      return null;
    }
    const [[categoria]] = await pool.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [task.categoria_id, user_id]);
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
    const [rows] = await pool.query(
      `SELECT t.*, tt.etiqueta_id, tag.nombre AS tag_nombre, tag.color AS tag_color
       FROM tasks t
       LEFT JOIN task_tags tt ON tt.tarea_id = t.id
       LEFT JOIN tags tag ON tag.id = tt.etiqueta_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [user_id]
    );
    if (rows.length === 0) {
      return res.json(paginate([], req.query.page, PER_PAGE, BASE_PATH));
    }
    const taskMap = new Map();
    for (const row of rows) {
      if (!taskMap.has(row.id)) {
        taskMap.set(row.id, { ...row, etiquetas: [] });
      }
      if (row.etiqueta_id) {
        taskMap.get(row.id).etiquetas.push({
          id: row.etiqueta_id,
          nombre: row.tag_nombre,
          color: row.tag_color,
        });
      }
    }
    const categoryIds = [...new Set(
      Array.from(taskMap.values()).map(t => t.categoria_id).filter(Boolean)
    )];
    let categoriesMap = {};

    if (categoryIds.length > 0) {
      const [categories] = await pool.query(
        'SELECT * FROM categories WHERE id IN (?)',
        [categoryIds]
      );
      for (const cat of categories) {
        categoriesMap[cat.id] = cat;
      }
    }
    const result = Array.from(taskMap.values()).map(task =>
      taskDecorator(task, categoriesMap[task.categoria_id] || null, task.etiquetas)
    );
    res.status(201).json(paginate(result, req.query.page, PER_PAGE, BASE_PATH));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const store = async (req, res) => {
  try {
    const { titulo, descripcion, categoria_id, etiquetas } = req.body;
    if (!titulo) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }
    if (etiquetas && (!Array.isArray(etiquetas) || etiquetas.some(e => typeof e !== 'string'))) {
      return res.status(400).json({ message: 'Etiquetas debe ser un array de IDs válidos' });
    }
    if (categoria_id && typeof categoria_id !== 'string') {
      return res.status(400).json({ message: 'categoria_id debe ser un ID válido' });
    }
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tasks (id, titulo, descripcion, categoria_id, user_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [id, titulo, descripcion || null, categoria_id || null, user_id]
    );

    if (etiquetas && etiquetas.length > 0) {
      for (const etiqueta_id of etiquetas) {
        await pool.query(
          'INSERT INTO task_tags (tarea_id, etiqueta_id) VALUES (?, ?)',
          [id, etiqueta_id]
        );
      }
    }
    const task = await getTaskFull(id, user_id);
    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const task = await getTaskFull(req.params.id, user_id);
    if (!task) {
       return res.status(400).json({ success: false, message: 'Tarea no encontrada' });
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria_id, status, etiquetas } = req.body;
    if (!titulo) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }
    const [[existing]] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }
    await pool.query(
      'UPDATE tasks SET titulo = ?, descripcion = ?, categoria_id = ?, status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [
        titulo || existing.titulo,
        descripcion !== undefined ? descripcion : existing.descripcion,
        categoria_id !== undefined ? categoria_id : existing.categoria_id,
        status !== undefined ? status : existing.status,
        id, user_id,
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

    const task = await getTaskFull(id, user_id);

    res.status(201).json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const [[existing]] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    if (!existing){
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }
    await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, user_id]);

    res.status(201).json({ success: true, message: 'Tarea eliminada exitosamente', task: taskDecorator(task)});
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

module.exports = { index, store, show, update, destroy };