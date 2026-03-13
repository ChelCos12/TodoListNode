const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { categoryDecorator } = require('../decorators/category.decorator');

const index = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.status(201).json(rows.map(categoryDecorator));
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
      'INSERT INTO categories (id, nombre, color, created_at) VALUES (?, ?, ?, NOW())',
      [id, nombre, color || '#3498db']
    );
    res.status(201).json(categoryDecorator({ id, nombre, color: color || '#3498db' }));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category){
       return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(201).json(categoryDecorator(category));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const { id } = req.params;
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (!nombre) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }
    if (!category){
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    await pool.query(
      'UPDATE categories SET nombre = ?, color = ?, updated_at = NOW() WHERE id = ?',
      [nombre, color || category.color, id]
    );
    res.status(201).json(categoryDecorator({ id, nombre: nombre, color: color || category.color ,created_at: category.created_at, updated_at: category.updated_at}));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category){
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Categoría eliminada' });
    res.status(201).json(categoryDecorator(category));
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

module.exports = { index, store, show, update, destroy };