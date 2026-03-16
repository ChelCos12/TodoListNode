const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { tagDecorator } = require('../decorators/tag.decorator');
const { paginate } = require('../utils/paginate');

const PER_PAGE = 5;
const BASE_PATH = 'http://localhost:3000/api/etiquetas';

const index = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tags WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    if (req.query.all === 'true') {
      return res.status(201).json({ data: rows.map(tagDecorator) });
    }
    res.json(paginate(rows.map(tagDecorator), req.query.page, PER_PAGE, BASE_PATH));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};


const store = async (req, res) => {
  try {
      const { nombre, color } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tags (id, nombre, color, user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [id, nombre, color || '#3498db', req.user.id]
    );
    const [[created]] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Etiqueta creada exitosamente',
      data: tagDecorator(created),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!tag){
      return res.json({ success: false, message: 'Etiqueta no encontrada' });
    }
    res.status(201).json({ success: true, data: tagDecorator(tag) });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const { id } = req.params;
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!tag){
      return res.json({ success: false, message: 'Etiqueta no encontrada' });
    }
    await pool.query(
      'UPDATE tags SET nombre = ?, color = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [nombre || tag.nombre, color || tag.color, id, req.user.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Etiqueta actualizada exitosamente',
      data: tagDecorator(updated),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!tag){
      return res.json({ success: false, message: 'Etiqueta no encontrada' });
    }
    await pool.query('DELETE FROM tags WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.status(201).json({ success: true, message: 'Etiqueta eliminada exitosamente', tag: tagDecorator(tag) });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

module.exports = { index, store, show, update, destroy };