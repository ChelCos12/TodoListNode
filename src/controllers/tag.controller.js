const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { tagDecorator } = require('../decorators/tag.decorator');

const index = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tags ORDER BY created_at DESC');
    res.json(rows.map(tagDecorator));
  } catch (error) {
    res.json(error);
  }
};

const store = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tags (id, nombre, color, created_at) VALUES (?, ?, ?, NOW())',
      [id, nombre, color || '#3498db']
    );
    res.json(tagDecorator({ id, nombre, color: color || '#3498db' }));
  } catch (error) {
    res.json(error);
  }
};

const show = async (req, res) => {
  try {
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ?', [req.params.id]);
    if (!tag) return res.json(null);
    res.json(tagDecorator(tag));
  } catch (error) {
    res.json(error);
  }
};

const update = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const { id } = req.params;
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);
    if (!tag) return res.json(null);
    await pool.query(
      'UPDATE tags SET nombre = ?, color = ?, updated_at = NOW() WHERE id = ?',
      [nombre || tag.nombre, color || tag.color, id]
    );
    res.json(tagDecorator({ id, nombre: nombre || tag.nombre, color: color || tag.color }));
  } catch (error) {
    res.json(error);
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);
    if (!tag) return res.json(null);
    await pool.query('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ message: 'Etiqueta eliminada' });
  } catch (error) {
    res.json(error);
  }
};

module.exports = { index, store, show, update, destroy };