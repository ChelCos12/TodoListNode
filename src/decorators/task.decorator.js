const taskDecorator = (task, categoria, etiquetas = []) => ({
  id: task.id,
  titulo: task.titulo,
  descripcion: task.descripcion,
  categoria_id: task.categoria_id,
  completada: Boolean(task.status),
  created_at: task.created_at,
  updated_at: task.updated_at,
  categoria: categoria ? {
    id: categoria.id,
    nombre: categoria.nombre,
    color: categoria.color,
    created_at: categoria.created_at,
    updated_at: categoria.updated_at,
  } : null,
  etiquetas: etiquetas.map(e => ({
    id: e.id,
    nombre: e.nombre,
    color: e.color,
    created_at: e.created_at,
    updated_at: e.updated_at,
    pivot: {
      tarea_id: task.id,
      etiqueta_id: e.id,
    },
  })),
});

module.exports = { taskDecorator };