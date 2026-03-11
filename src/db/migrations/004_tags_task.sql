CREATE TABLE IF NOT EXISTS task_tags (
  tarea_id CHAR(36) NOT NULL,
  etiqueta_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  PRIMARY KEY (tarea_id, etiqueta_id),
  FOREIGN KEY (tarea_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (etiqueta_id) REFERENCES tags(id) ON DELETE CASCADE
);