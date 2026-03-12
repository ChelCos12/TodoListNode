CREATE TABLE IF NOT EXISTS tasks (
  id CHAR(36) PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  categoria_id CHAR(36) NULL,
  completada BOOLEAN DEFAULT false,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (categoria_id) REFERENCES categories(id) ON DELETE SET NULL
);