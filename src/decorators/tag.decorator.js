const tagDecorator = (tag) => ({
  id: tag.id,
  nombre: tag.nombre,
  color: tag.color,
  created_at: tag.created_at,
  updated_at: tag.updated_at,
});

module.exports = { tagDecorator };