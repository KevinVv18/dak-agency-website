-- Cuando cada persona dio el tutorial por visto.
--
-- Va en el SERVIDOR y no en localStorage a proposito: «no volver a mostrarlo»
-- tiene que significar nunca mas, no «nunca mas en este navegador». Fabian
-- entra desde el telefono y algun dia entrara desde otro; que la guia le
-- reaparezca ahi seria un fallo pequeño y muy molesto.
--
-- NULL = no lo ha marcado. Saltarlo sin marcar la casilla NO escribe aqui: es
-- «ahora no», no «nunca mas».
ALTER TABLE usuarios
  ADD COLUMN tutorial_visto_en DATETIME NULL AFTER visto_en;
