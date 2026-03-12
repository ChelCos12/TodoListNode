const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { categoryDecorator } = require('../decorators/category.decorator');
const { paginate } = require('../utils/paginate');

const PER_PAGE = 5;
const BASE_PATH = 'http://localhost:3000/api/categories';

const index = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    if (req.query.all === 'true') {
      return res.status(201).json({ data: rows.map(categoryDecorator) });
    }

    res.status(201).json(paginate(rows.map(categoryDecorator), req.query.page, PER_PAGE, BASE_PATH));
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
      'INSERT INTO categories (id, nombre, color, user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [id, nombre, color || '#3498db', req.user.id]
    );
    const [[created]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoryDecorator(created),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!category) return res.json({ success: false, message: 'Categoría no encontrada' });

    res.status(201).json({ success: true, data: categoryDecorator(category) });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { nombre, color } = req.body;
    const { id } = req.params;
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!nombre) {
      return res.status(400).json({ message: 'El campo nombre es obligatorio' });
    }
    if (!category){
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    await pool.query(
      'UPDATE categories SET nombre = ?, color = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [nombre || category.nombre, color || category.color, id, req.user.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoryDecorator(updated),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!category){
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.status(201).json({ success: true, message: 'Categoría eliminada exitosamente', category: categoryDecorator(category) });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

module.exports = { index, store, show, update, destroy };