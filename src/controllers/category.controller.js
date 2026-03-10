const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { categoryDecorator } = require('../decorators/category.decorator');

const index = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
  res.json(rows.map(categoryDecorator));
};

const store = async (req, res) => {
  const { nombre, color } = req.body;

  const id = uuidv4();
  await pool.query(
    'INSERT INTO categories (id, nombre, color, created_at) VALUES (?, ?, ?, NOW())',
    [id, nombre, color || '#3498db']
  );

  res.json(categoryDecorator({ id, nombre, color: color || '#3498db' }));
};

const show = async (req, res) => {
  const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (!category) return res.json(null);

  res.json(categoryDecorator(category));
};

const update = async (req, res) => {
  const { nombre, color } = req.body;
  const { id } = req.params;

  const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  if (!category) return res.json(null);

  await pool.query(
    'UPDATE categories SET nombre = ?, color = ?, updated_at = NOW() WHERE id = ?',
    [nombre || category.nombre, color || category.color, id]
  );

  res.json(categoryDecorator({ id, nombre: nombre || category.nombre, color: color || category.color }));
};

const destroy = async (req, res) => {
  const { id } = req.params;

  const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  if (!category) return res.json(null);

  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  res.json({ message: 'Categoría eliminada' });
};

module.exports = { index, store, show, update, destroy };