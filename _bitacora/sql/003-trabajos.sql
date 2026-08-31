-- DAK Bitacora — el trabajo suelto.
--
-- POR QUE EXISTE ESTA TABLA
--
-- El modelo original daba por hecho que el dia de Fabian son dos o tres piezas
-- con nombre que se arrastran entre jornadas. Sus informes reales de cuatro
-- dias seguidos dicen otra cosa:
--
--   25-ago  video de Oasis + imagenes IA + carrusel DAK + carrusel Vault
--   26-ago  prompts + 5 videos Vault con IA + carrusel DAK + video + imagen
--           + investigacion de temas para DAK y Vault
--   27-ago  prompts + 2 videos Vault con IA + carrusel DAK + 2 videos cortos
--   28-ago  prompts + 2 videos Vault con IA + animacion en After Effects
--
-- Entre tres y nueve salidas al dia, muchas en LOTE («5 videos»), y trabajo
-- recurrente que no es una pieza entregable: crear prompts, investigar temas.
--
-- Obligarle a dar de alta una pieza por cada video generado seria absurdo, y
-- sin esto el informe de la aplicacion diria MENOS que el mensaje de WhatsApp
-- que ya escribe. Una herramienta que registra menos que lo que sustituye no se
-- usa: se abandona.
--
-- Un trabajo suelto NO tiene estado ni continuidad. Es una linea de actividad
-- de una jornada concreta. Lo que tiene continuidad son las piezas, y eso no
-- cambia.

SET NAMES utf8mb4;

CREATE TABLE trabajos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  jornada_id  INT UNSIGNED NOT NULL,
  usuario_id  INT UNSIGNED NOT NULL,

  -- El vocabulario sale de sus propias palabras, no de una taxonomia inventada.
  tipo        ENUM('edicion','prompts','generacion_ia','carrusel','video_corto',
                   'animacion','imagenes','investigacion','otro') NOT NULL,
  marca       ENUM('DAK','Vault','Cliente') NOT NULL,

  -- La cantidad es lo que permite decir «5 videos» sin crear cinco registros.
  cantidad    TINYINT UNSIGNED NOT NULL DEFAULT 1,
  nota        VARCHAR(300) NULL,

  creado_en   DATETIME NOT NULL,

  KEY idx_jornada (jornada_id),
  KEY idx_usuario_tiempo (usuario_id, creado_en),
  CONSTRAINT fk_trab_jornada FOREIGN KEY (jornada_id) REFERENCES jornadas(id) ON DELETE CASCADE,
  CONSTRAINT fk_trab_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
