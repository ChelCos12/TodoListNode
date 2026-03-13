const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { tagDecorator } = require('../decorators/tag.decorator');

const index = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tags ORDER BY created_at DESC');
    res.status(201).json(rows.map(tagDecorator));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const store = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tags (id, nombre, color, created_at) VALUES (?, ?, ?, NOW())',
      [id, nombre, color || '#3498db']
    );
    res.status(201).json(tagDecorator({ id, nombre, color: color || '#3498db' }));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ?', [req.params.id]);
    if (!tag){
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    res.status(201).json(tagDecorator(tag));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const { id } = req.params;
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);
    if (!nombre) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }
    if (!tag){
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    await pool.query(
      'UPDATE tags SET nombre = ?, color = ?, updated_at = NOW() WHERE id = ?',
      [nombre, color || tag.color, id]
    );
    res.status(201).json(tagDecorator({ id, nombre: nombre || tag.nombre, color: color || tag.color ,created_at: tag.created_at, updated_at: tag.updated_at}));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [[tag]] = await pool.query('SELECT * FROM tags WHERE id = ?', [id]);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }
    await pool.query('DELETE FROM tags WHERE id = ?', [id]);
    res.status(201).json({message: 'Etiqueta eliminada',tag: tagDecorator(tag)});
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

module.exports = { index, store, show, update, destroy };