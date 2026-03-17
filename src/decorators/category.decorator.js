const categoryDecorator = (category) => ({
  id: category.id,
  nombre: category.nombre,
  color: category.color,
  created_at: category.created_at,
  updated_at: category.updated_at,
});

module.exports = { categoryDecorator };