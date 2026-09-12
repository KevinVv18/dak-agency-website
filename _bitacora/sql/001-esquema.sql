-- DAK Bitacora — esquema.
--
-- Zona horaria: TODAS las fechas de negocio son de America/Lima. Los timestamps
-- se guardan en DATETIME (no TIMESTAMP) y PHP los escribe ya en hora de Lima —
-- ver lib/entorno.php. La razon esta explicada ahi y no es un detalle: un cierre
-- a las 20:00 de Lima cae en el dia siguiente si se calcula en UTC, y toda la
-- continuidad entre dias se desalinea.
--
-- Regla estructural: nada muta `piezas` sin escribir su fila en `eventos` dentro
-- de la misma transaccion. El unico camino es registrarEvento() en lib/eventos.php.

SET NAMES utf8mb4;

CREATE TABLE usuarios (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  correo        VARCHAR(190) NOT NULL,
  nombre        VARCHAR(120) NOT NULL,
  -- 'pendiente' es el estado de quien entra con un correo del dominio pero no
  -- esta dado de alta: se le crea la fila y se le niega el paso. Nunca hay
  -- auto-alta como admin.
  rol           ENUM('audiovisual','admin','pendiente') NOT NULL DEFAULT 'pendiente',
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  creado_en     DATETIME NOT NULL,
  visto_en      DATETIME NULL,
  UNIQUE KEY uq_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE piezas (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo          VARCHAR(200) NOT NULL,
  marca           ENUM('DAK','Vault','Cliente') NOT NULL,
  cliente_nombre  VARCHAR(120) NULL,
  tipo            VARCHAR(60) NULL,
  referencia_url  VARCHAR(500) NULL,
  estado          ENUM('BACKLOG','PROXIMO','EN_PRODUCCION','REVISION','CAMBIOS',
                       'PAUSADO','BLOQUEADO','TERMINADO') NOT NULL DEFAULT 'BACKLOG',
  -- Menor numero = antes. El admin reordena escribiendo aqui.
  prioridad       INT NOT NULL DEFAULT 100,
  asignada_a      INT UNSIGNED NULL,

  -- El par que hace que la app «recuerde». ultimo_punto responde «donde quedo»;
  -- siguiente_paso responde «que sigue». Ambos pueden estar vacios: una pieza
  -- recien creada no tiene punto, y eso se muestra como «sin dato», nunca como
  -- un relleno inventado.
  ultimo_punto    TEXT NULL,
  siguiente_paso  TEXT NULL,

  -- Se conservan al pausar/bloquear para poder retomar exactamente donde iba.
  motivo_pausa    VARCHAR(200) NULL,
  motivo_bloqueo  VARCHAR(200) NULL,
  -- Estado al que se vuelve al desbloquear. Sin esto, desbloquear tendria que
  -- adivinar, y adivinar es justo lo que esta app no hace.
  estado_previo   VARCHAR(20) NULL,

  -- De donde salio. La aprobacion de la socia ocurre en WhatsApp, fuera de aqui:
  -- que el registro lo diga en vez de fingir que se aprobo en la app.
  origen          ENUM('whatsapp','app','cliente') NOT NULL DEFAULT 'whatsapp',
  creada_por      INT UNSIGNED NULL,

  creada_en       DATETIME NOT NULL,
  iniciada_en     DATETIME NULL,
  terminada_en    DATETIME NULL,
  actualizada_en  DATETIME NOT NULL,

  KEY idx_estado (estado),
  KEY idx_asignada (asignada_a, estado),
  KEY idx_orden (estado, prioridad, actualizada_en),
  CONSTRAINT fk_piezas_asignada FOREIGN KEY (asignada_a) REFERENCES usuarios(id),
  CONSTRAINT fk_piezas_creador  FOREIGN KEY (creada_por) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jornadas (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT UNSIGNED NOT NULL,
  -- Fecha de Lima, explicita. NUNCA se deriva de un timestamp al leer ni se
  -- calcula en el cliente.
  fecha         DATE NOT NULL,
  abierta_en    DATETIME NULL,
  cerrada_en    DATETIME NULL,
  -- 'sin_cierre' = el dia paso sin que nadie lo cerrara. Se marca al reconciliar
  -- y se queda asi para siempre: el historial dice la verdad.
  estado        ENUM('abierta','cerrada','sin_cierre') NOT NULL DEFAULT 'abierta',
  cerrada_tarde TINYINT(1) NOT NULL DEFAULT 0,
  resumen_json  JSON NULL,
  UNIQUE KEY uq_usuario_fecha (usuario_id, fecha),
  KEY idx_estado_fecha (estado, fecha),
  CONSTRAINT fk_jornadas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- El plan CONGELADO del dia. Se escribe al pulsar «Comenzar jornada» y ya no se
-- recalcula: el cierre pregunta por lo que de verdad se planifico, no por una
-- lista regenerada que podria haber cambiado durante el dia.
CREATE TABLE jornada_piezas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  jornada_id     INT UNSIGNED NOT NULL,
  pieza_id       INT UNSIGNED NOT NULL,
  orden          TINYINT UNSIGNED NOT NULL,
  rol            ENUM('continuar','despues') NOT NULL,
  -- NULL mientras el dia esta abierto. Se rellena en el cierre.
  desenlace      ENUM('termine','continuo','pause','bloqueado','no_trabaje') NULL,
  nota           TEXT NULL,
  siguiente_paso TEXT NULL,
  UNIQUE KEY uq_jornada_pieza (jornada_id, pieza_id),
  KEY idx_pieza (pieza_id),
  CONSTRAINT fk_jp_jornada FOREIGN KEY (jornada_id) REFERENCES jornadas(id) ON DELETE CASCADE,
  CONSTRAINT fk_jp_pieza   FOREIGN KEY (pieza_id)   REFERENCES piezas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- La espina dorsal. SOLO-APPEND: no hay UPDATE ni DELETE sobre esta tabla en
-- ningun punto del codigo. El estado actual de una pieza es, en la practica, un
-- cache de la ultima fila de aqui.
CREATE TABLE eventos (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pieza_id        INT UNSIGNED NULL,
  jornada_id      INT UNSIGNED NULL,
  usuario_id      INT UNSIGNED NULL,
  tipo            VARCHAR(40) NOT NULL,
  estado_anterior VARCHAR(20) NULL,
  estado_nuevo    VARCHAR(20) NULL,
  nota            TEXT NULL,
  datos_json      JSON NULL,
  creado_en       DATETIME NOT NULL,
  KEY idx_pieza_tiempo (pieza_id, creado_en),
  KEY idx_tiempo (creado_en),
  CONSTRAINT fk_eventos_pieza   FOREIGN KEY (pieza_id)   REFERENCES piezas(id),
  CONSTRAINT fk_eventos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE revisiones (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pieza_id    INT UNSIGNED NOT NULL,
  revisor_id  INT UNSIGNED NULL,
  veredicto   ENUM('cambios','aprobado') NULL,
  comentario  TEXT NULL,
  -- creada_en = cuando la pieza ENTRO a revision. Es el reloj que hace visible
  -- lo que esta esperando a los jefes, no solo lo que espera a Fabian.
  creada_en   DATETIME NOT NULL,
  resuelta_en DATETIME NULL,
  KEY idx_pieza (pieza_id),
  KEY idx_pendientes (resuelta_en, creada_en),
  CONSTRAINT fk_rev_pieza   FOREIGN KEY (pieza_id)   REFERENCES piezas(id),
  CONSTRAINT fk_rev_revisor FOREIGN KEY (revisor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bloqueos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pieza_id    INT UNSIGNED NULL,
  jornada_id  INT UNSIGNED NULL,
  tipo        ENUM('falta_material','esperando_aprobacion','esperando_cliente',
                   'falta_recurso','problema_tecnico','otro') NOT NULL,
  detalle     VARCHAR(400) NULL,
  abierto_en  DATETIME NOT NULL,
  resuelto_en DATETIME NULL,
  KEY idx_abiertos (resuelto_en, abierto_en),
  KEY idx_pieza (pieza_id),
  CONSTRAINT fk_bloq_pieza FOREIGN KEY (pieza_id) REFERENCES piezas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ajustes (
  clave  VARCHAR(60) PRIMARY KEY,
  valor  VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO ajustes (clave, valor) VALUES
  ('umbral_cola', '3'),
  ('zona_horaria', 'America/Lima');
