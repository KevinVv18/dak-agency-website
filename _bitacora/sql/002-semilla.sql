-- DAK Bitacora — datos de arranque.
--
-- Dos partes:
--   1. Los usuarios reales. Esto SI va a produccion.
--   2. Las piezas de demostracion (§22 del encargo). Esto se borra el dia que
--      entren las piezas de verdad — ver 003-vaciar-demo.sql.
--
-- Las piezas de demo son FEAS A PROPOSITO (regla 6 de AGENTS.md): hay una sin
-- «ultimo punto», una bloqueada hace cinco dias, una esperando revision hace
-- tres, una pausada por un cliente, y una jornada del 29 que nadie cerro. La
-- interfaz se disena contra eso, no contra un fixture limpio donde todo cuadra.
--
-- Las fechas son relativas a hoy, asi que la demo no caduca. Lima es UTC-5 fijo
-- (Peru no tiene horario de verano), asi que restar 5 horas a NOW() da la hora
-- de Lima sin depender de las tablas de zonas horarias de MySQL, que en hosting
-- compartido no siempre estan cargadas.

SET NAMES utf8mb4;
SET @ahora = NOW() - INTERVAL 5 HOUR;
SET @hoy   = DATE(@ahora);

-- ─── 1. Usuarios reales ────────────────────────────────────────────────────
--
-- ⚠️ Confirmar las direcciones exactas antes de dar por bueno el acceso. Si una
-- no coincide, esa persona entra como 'pendiente' y la app se lo dice al admin
-- en vez de dejarla pasar. Fallar cerrado es lo correcto aqui.

INSERT INTO usuarios (correo, nombre, rol, creado_en) VALUES
  ('fabian@dakagency.net',    'Fabián',     'audiovisual', @ahora),
  ('marketing@dakagency.net', 'DAK',        'admin',       @ahora);

SET @fabian = (SELECT id FROM usuarios WHERE correo = 'fabian@dakagency.net');
SET @jefe   = (SELECT id FROM usuarios WHERE correo = 'marketing@dakagency.net');

-- ─── 2. Piezas de demostracion ─────────────────────────────────────────────

INSERT INTO piezas
  (titulo, marca, cliente_nombre, tipo, estado, prioridad, asignada_a,
   ultimo_punto, siguiente_paso, motivo_pausa, motivo_bloqueo, estado_previo,
   origen, creada_por, creada_en, iniciada_en, actualizada_en)
VALUES
  -- La principal: el hilo que la app tiene que recordar entre dias.
  ('Animación trabajos realizados', 'DAK', NULL, 'Reel 40s', 'EN_PRODUCCION', 10, @fabian,
   'Escenas 1-4 terminadas', 'Escenas 5-6 + sonido', NULL, NULL, NULL,
   'whatsapp', @jefe, @ahora - INTERVAL 6 DAY, @ahora - INTERVAL 4 DAY, @ahora - INTERVAL 2 DAY),

  -- Esperando revision hace tres dias. Esto NO es deuda de Fabian: es deuda de
  -- los jefes, y el dashboard tiene que decirlo con esas palabras.
  ('Carrusel DAK #1', 'DAK', NULL, 'Carrusel', 'REVISION', 20, @fabian,
   'Cinco láminas montadas y exportadas', 'Esperando revisión', NULL, NULL, NULL,
   'whatsapp', @jefe, @ahora - INTERVAL 9 DAY, @ahora - INTERVAL 5 DAY, @ahora - INTERVAL 3 DAY),

  -- Pausada por un cliente. Conserva donde quedo para poder retomarla exacta.
  ('Reel complejo #1', 'DAK', NULL, 'Reel', 'PAUSADO', 30, @fabian,
   'Guion cerrado, primer corte sin música', 'Musicalizar y ajustar ritmo', 'Prioridad cliente', NULL, 'EN_PRODUCCION',
   'whatsapp', @jefe, @ahora - INTERVAL 8 DAY, @ahora - INTERVAL 6 DAY, @ahora - INTERVAL 4 DAY),

  -- Bloqueada hace cinco dias y nadie se ha enterado. Ese es exactamente el
  -- problema que esta app existe para hacer visible.
  ('Reel IA Vault', 'Vault', NULL, 'Reel', 'BLOQUEADO', 25, @fabian,
   'Estructura armada, faltan los planos de producto', NULL, NULL, 'Falta material: fotos de producto', 'EN_PRODUCCION',
   'whatsapp', @jefe, @ahora - INTERVAL 10 DAY, @ahora - INTERVAL 7 DAY, @ahora - INTERVAL 5 DAY),

  -- Sin «ultimo punto». Nunca se ha tocado. Se muestra «sin dato», no un cero.
  ('Reel complejo #2', 'DAK', NULL, 'Reel', 'PROXIMO', 40, @fabian,
   NULL, NULL, NULL, NULL, NULL,
   'whatsapp', @jefe, @ahora - INTERVAL 6 DAY, NULL, @ahora - INTERVAL 6 DAY),

  ('Reel corto #1', 'DAK', NULL, 'Reel corto', 'BACKLOG', 50, @fabian,
   NULL, NULL, NULL, NULL, NULL,
   'whatsapp', @jefe, @ahora - INTERVAL 6 DAY, NULL, @ahora - INTERVAL 6 DAY),

  ('Reel corto #2', 'DAK', NULL, 'Reel corto', 'BACKLOG', 60, @fabian,
   NULL, NULL, NULL, NULL, NULL,
   'whatsapp', @jefe, @ahora - INTERVAL 6 DAY, NULL, @ahora - INTERVAL 6 DAY),

  ('Carrusel DAK #2', 'DAK', NULL, 'Carrusel', 'BACKLOG', 70, @fabian,
   NULL, NULL, NULL, NULL, NULL,
   'whatsapp', @jefe, @ahora - INTERVAL 6 DAY, NULL, @ahora - INTERVAL 6 DAY),

  -- El cliente que desplazo el trabajo interno, ya cerrado. Sirve para que la
  -- app pueda sugerir «retomar Reel complejo #1 desde donde iba».
  ('Spot institucional', 'Cliente', 'Multisonrisas', 'Spot 30s', 'TERMINADO', 5, @fabian,
   'Entregado y aprobado por el cliente', NULL, NULL, NULL, NULL,
   'cliente', @jefe, @ahora - INTERVAL 5 DAY, @ahora - INTERVAL 4 DAY, @ahora - INTERVAL 1 DAY);

UPDATE piezas SET terminada_en = @ahora - INTERVAL 1 DAY WHERE titulo = 'Spot institucional';

-- La revision abierta que lleva tres dias esperando.
INSERT INTO revisiones (pieza_id, creada_en)
SELECT id, @ahora - INTERVAL 3 DAY FROM piezas WHERE titulo = 'Carrusel DAK #1';

-- El bloqueo que lleva cinco.
INSERT INTO bloqueos (pieza_id, tipo, detalle, abierto_en)
SELECT id, 'falta_material', 'Faltan los planos de producto para montar el reel', @ahora - INTERVAL 5 DAY
FROM piezas WHERE titulo = 'Reel IA Vault';

-- ─── 3. Jornadas ───────────────────────────────────────────────────────────
--
-- La del 29 (anteayer) quedo ABIERTA: se abrio y nadie la cerro. Es el caso del
-- §13 del encargo, y esta puesto a proposito para que la reconciliacion se vea
-- funcionando desde el primer login en vez de tener que provocarla a mano.

INSERT INTO jornadas (usuario_id, fecha, abierta_en, cerrada_en, estado, resumen_json) VALUES
  (@fabian, @hoy - INTERVAL 3 DAY, @ahora - INTERVAL 3 DAY - INTERVAL 10 HOUR,
   @ahora - INTERVAL 3 DAY - INTERVAL 1 HOUR, 'cerrada', NULL),
  (@fabian, @hoy - INTERVAL 2 DAY, @ahora - INTERVAL 2 DAY - INTERVAL 10 HOUR,
   NULL, 'abierta', NULL);

SET @jornada_vieja = (SELECT id FROM jornadas WHERE usuario_id = @fabian AND fecha = @hoy - INTERVAL 2 DAY);

-- El plan congelado de aquel dia que quedo sin cerrar. Son las dos piezas por
-- las que la app va a preguntar al abrirse.
INSERT INTO jornada_piezas (jornada_id, pieza_id, orden, rol)
SELECT @jornada_vieja, id, 1, 'continuar' FROM piezas WHERE titulo = 'Animación trabajos realizados';
INSERT INTO jornada_piezas (jornada_id, pieza_id, orden, rol)
SELECT @jornada_vieja, id, 2, 'despues'   FROM piezas WHERE titulo = 'Reel complejo #1';

-- ─── 4. Eventos ────────────────────────────────────────────────────────────
--
-- Historial minimo para que la pantalla de detalle tenga algo real que contar
-- desde el primer dia. De aqui en adelante los escribe registrarEvento().

INSERT INTO eventos (pieza_id, usuario_id, tipo, estado_anterior, estado_nuevo, nota, creado_en)
SELECT id, @jefe,   'creada',            NULL,            'BACKLOG',       NULL,                              @ahora - INTERVAL 6 DAY FROM piezas WHERE titulo = 'Animación trabajos realizados'
UNION ALL
SELECT id, @jefe,   'cambio_estado',     'BACKLOG',       'PROXIMO',       NULL,                              @ahora - INTERVAL 5 DAY FROM piezas WHERE titulo = 'Animación trabajos realizados'
UNION ALL
SELECT id, @fabian, 'produccion_inicio', 'PROXIMO',       'EN_PRODUCCION', NULL,                              @ahora - INTERVAL 4 DAY FROM piezas WHERE titulo = 'Animación trabajos realizados'
UNION ALL
SELECT id, @fabian, 'cierre',            'EN_PRODUCCION', 'EN_PRODUCCION', 'Escenas 1-4 terminadas',          @ahora - INTERVAL 3 DAY FROM piezas WHERE titulo = 'Animación trabajos realizados'
UNION ALL
SELECT id, @fabian, 'a_revision',        'EN_PRODUCCION', 'REVISION',      'Cinco láminas montadas',          @ahora - INTERVAL 3 DAY FROM piezas WHERE titulo = 'Carrusel DAK #1'
UNION ALL
SELECT id, @fabian, 'pausada',           'EN_PRODUCCION', 'PAUSADO',       'Prioridad cliente',               @ahora - INTERVAL 4 DAY FROM piezas WHERE titulo = 'Reel complejo #1'
UNION ALL
SELECT id, @fabian, 'bloqueada',         'EN_PRODUCCION', 'BLOQUEADO',     'Falta material: fotos de producto', @ahora - INTERVAL 5 DAY FROM piezas WHERE titulo = 'Reel IA Vault'
UNION ALL
SELECT id, @jefe,   'aprobada',          'REVISION',      'TERMINADO',     'Aprobado por el cliente',         @ahora - INTERVAL 1 DAY FROM piezas WHERE titulo = 'Spot institucional';
