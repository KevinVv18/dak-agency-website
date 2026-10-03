# DAK — Plan maestro de la demo de showroom inmobiliario

**Versión:** 1.0  
**Fecha:** 3 de octubre de 2026  
**Referencia principal:** President Tower / Urbania 3D  
**Estado:** definición terminada; búsqueda del ejemplar pendiente.  
**Objetivo inmediato:** encontrar un proyecto y un conjunto de materiales coherentes, con derechos de uso suficientes, antes de construir la demo.

## 1. Qué queremos construir

Una demo comercial de un showroom web para edificios y departamentos en preventa. El comprador debe poder conocer el edificio, elegir un piso, seleccionar una unidad, entender su distribución, explorar sus interiores y consultar por esa unidad desde una experiencia continua.

La demo debe servir a DAK como muestra vendible y como primer caso de una estructura reutilizable para futuros clientes. No buscamos copiar la marca ni los materiales de President Tower: buscamos reproducir el tipo de experiencia y la conexión entre sus funciones usando contenido autorizado.

**Recorrido principal:** portada → exterior del edificio → piso → unidad → ficha y contenido → consulta.

**Recorrido alternativo:** catálogo de unidades → filtros → unidad → comparación o consulta.

El valor comercial está en que planos, renders, panoramas, vistas, disponibilidad y datos pertenecen a la misma unidad. La coherencia entre estas piezas tiene prioridad sobre acumular efectos.

### Relación con la demo de lotes

Esta es una segunda línea de producto. La primera sigue siendo el explorador de lotes con panoramas aéreos y polígonos. Este documento desarrolla en detalle la línea de edificios; no reemplaza el proyecto de lotes ni presupone que ambos deban construirse simultáneamente.

Pueden compartir fichas, estados, archivos, contactos y configuración de marca. Cambia la navegación espacial: en lotes es proyecto → manzana → lote; en edificios es edificio → piso → departamento. No se necesita unificar ambos motores visuales en la primera demo.

## 2. Referencias y alcance de la evidencia

### Fuentes revisadas

- Web: https://president-tower.urbania3d.app/
- Catálogo: https://president-tower.urbania3d.app/units
- TikTok suministrado: https://vt.tiktok.com/ZSbhXQYuy/
- Video adjunto: `ssstik.io_@joan.barenghi_1791068456212.mp4`, duración aproximada 5:05.

Se navegó por el showroom y se inspeccionaron sus pantallas. El TikTok no pudo reproducirse inicialmente por una pantalla de registro; después se obtuvo una transcripción automática del video adjunto y se revisaron fotogramas seleccionados. La transcripción tiene errores menores, por lo que aquí se usa una síntesis de su contenido, no citas literales.

**Niveles de evidencia:**

- **Observado:** visible al navegar la web o en los fotogramas revisados.
- **Narrado:** afirmado en el video; no necesariamente comprobado en el sistema administrativo.
- **Propuesto:** decisión de diseño para DAK, sujeta al material encontrado.

Las observaciones corresponden a esta revisión. El inventario de la referencia puede cambiar. No se inspeccionó su backend ni se verificaron sus mecanismos de sincronización.

### Desglose de la referencia

| Componente | Evidencia obtenida | Aplicación para DAK |
| --- | --- | --- |
| Portada | Presentación animada con cambio de iluminación, logo y botón Ingresar. Observado y narrado. | Entrada breve, con imagen alternativa y opción de continuar sin esperar toda la animación. |
| Exterior | Carrusel identificado con seis imágenes, zoom y control día/noche. El narrador describe giros de 360°. | Vistas preparadas del edificio; no exigir un modelo navegable libremente para la primera versión. |
| Entorno | Edificio vecino semitransparente. El narrador explica que fue pedido del cliente, 0:40–0:53. | Mantener contexto y jerarquía visual; cualquier simplificación debe ser deliberada y no engañosa. |
| Pisos | Selector vertical desde primer piso hasta 27 y azotea; plantas amobladas. Observado. | Navegación por piso, con indicación inequívoca del piso activo. |
| Selección | Zona de la unidad resaltada en verde y apertura de panel. Observado. | Polígono vinculado a un identificador de unidad, su ficha y su estado. |
| Disponibilidad | Disponible y vendido visibles; el narrador afirma actualización en tiempo real, 1:17–1:30. | Estados por unidad; la demo debe identificar que usa inventario de ejemplo. |
| Ficha | Superficies, ambientes, dormitorios, baños, cocheras, precio bajo consulta, PDF y compartir. Observado. | Datos estructurados y consistentes en ficha, catálogo y exportación. |
| PDF y QR | Botones visibles; el video explica generación automática y QR de la sección, 1:44–2:02. | PDF desde datos y enlace profundo por unidad/sección. |
| Vistas | El narrador explica capturas de dron para altura y orientación específicas, 2:15–2:31. | Metadatos de altura/orientación; no presentar una vista genérica como exacta. |
| Plano 2D | El narrador dice que lo entrega el cliente, 2:31–2:34. | Obtener documentación arquitectónica y cotejarla con renders. |
| Tour | Visor Kuula integrado, colección visible de 55 escenas con interiores y amenities. Observado. | Integrar un visor existente o propio; esas 55 escenas no equivalen a 55 escenas de una sola unidad. |
| Comparador | Pantalla dividida con selección de otra unidad y modos de contenido. Observado. | Comparación de dos unidades; empezar por datos y planos. |
| Catálogo | Tipologías Planta Tipo y Dúplex; indicadores de disponibilidad. Observado. | Agrupar por tipología y permitir acceso a unidades concretas. |
| Ubicación | Menú de ubicación y mapa. El video explica puntos de interés, rutas y tiempos, 3:38–4:08. | Mapa básico primero; rutas multimodales como ampliación. |
| Contacto | El narrador describe consulta de precio mediante formulario que llega por correo, 1:47–1:53. | Capturar la unidad de interés y dirigir la consulta a un destino configurado. |

### Ejemplo concreto inspeccionado

La unidad 25 mostraba 429,42 m² totales, 391,92 m² cubiertos, cuatro dormitorios, cuatro baños y estado disponible. Es evidencia del nivel de detalle de la ficha, no una especificación que nuestra demo deba copiar. El catálogo mostraba 13 unidades disponibles de Planta Tipo y un Dúplex vendido; estos valores no se usarán como inventario propio.

### Lo que no está demostrado

- Que la experiencia completa sea un modelo 3D en tiempo real con cámara libre.
- Qué programa se utilizó para producir los renders o el exterior animado.
- Cómo funciona el panel administrativo, sus permisos o su base de datos.
- La latencia real de actualización de disponibilidad o sus integraciones comerciales.
- Costos, plazos o rendimiento en todos los dispositivos.
- Permiso para reutilizar sus imágenes, panoramas, planos, marca o código.

## 3. Experiencia que debe transmitir nuestra demo

### Dirección visual

Proyecto residencial contemporáneo y creíble para Perú o un mercado latinoamericano comparable. Prioridad geográfica para la búsqueda: Perú; después Paraguay, Ecuador, Colombia, Bolivia y otros contextos latinoamericanos pertinentes. La elección final dependerá del aspecto urbano, la arquitectura y la disponibilidad del conjunto de materiales, no solo del país.

Evitar paisajes nevados, arquitectura ajena al comprador objetivo o entornos que parezcan Canadá o Islandia. También evitar elegir una torre gigantesca solo por impacto visual si sus recursos no permiten construir la experiencia completa.

Interfaz limpia, imagen protagonista, tipografía legible, paneles compactos y controles con texto comprensible. La paleta se elegirá con la marca de demo; no es necesario copiar el rojo de Urbania. Los archivos nunca deben aparecer al comprador con nombres técnicos como `360_PALIERPT.png`.

### Principios de interacción

1. Mantener visible qué edificio, piso y unidad se está explorando.
2. Permitir volver sin perder la selección ni los filtros útiles.
3. Ofrecer entrada visual y entrada por catálogo.
4. No depender únicamente de color o de hover para comunicar disponibilidad.
5. Conservar la identidad de unidad al abrir ficha, tour, PDF, comparación o consulta.
6. Adaptar la interacción a móvil sin superponer paneles que tapen todo el contenido.
7. Mostrar estados de carga y contenido alternativo cuando un recurso falle.
8. Identificar claramente los datos y vistas de demostración.

## 4. Alcance propuesto

Las cantidades siguientes son una base de trabajo, no requisitos derivados de President Tower. Se ajustarán al ejemplar seleccionado.

### A. Corte funcional inicial

- Un edificio y una marca de muestra.
- Una vista exterior de calidad.
- Un piso con al menos una unidad seleccionable.
- Ficha con datos estructurados.
- Planta amoblada y plano 2D coherentes.
- Un panorama interior funcional.
- Enlace directo a la unidad y consulta contextual en modo demo.

**Objetivo:** probar de punta a punta una sola unidad antes de multiplicar pisos o producir animaciones.

### B. Demo comercial completa

- Un edificio, preferentemente con dos tipologías y varios pisos navegables.
- Inventario de ejemplo pequeño, orientativamente de 8 a 20 unidades; cada una con ID propio.
- Tres a seis vistas exteriores si el material permite una secuencia coherente.
- Variante nocturna opcional según disponibilidad de recursos.
- Una tipología desarrollada en profundidad y una segunda suficiente para comparación.
- Entre tres y cinco panoramas interiores enlazados para la tipología principal.
- Un amenity con galería o panorama.
- Estados disponible, reservado y vendido representados explícitamente.
- Filtros por piso, superficie, tipología y disponibilidad; precio solo si se publica.
- Galería, planta amoblada, plano técnico y vistas cuando existan.
- PDF generado, enlaces profundos y QR por unidad/sección.
- Comparación básica de dos unidades.
- Ubicación y puntos de interés básicos.
- Flujo de contacto contextual, sin enviar consultas a terceros durante las pruebas.
- Presentación responsive y contenidos optimizados.

### C. Ampliaciones posteriores

- Rutas y tiempos en distintos medios de transporte.
- Comparación simultánea de panoramas o galerías.
- Administrador con usuarios, permisos, historial y publicación de inventario.
- Integración con CRM, correo transaccional y registro de conversiones.
- Simulador financiero, multidioma, avances de obra y enlaces para asesores.
- Varias torres o proyectos dentro de una misma instalación.
- Modelo 3D en tiempo real si aporta valor suficiente frente a su costo de producción y mantenimiento.

Estas ampliaciones no deben bloquear la búsqueda ni el primer corte funcional.

## 5. Geometría: qué necesitamos realmente

### Exterior del edificio

Para la primera demo bastan renders desde cámaras definidas o imágenes de una secuencia. Cada vista necesita su identificador y, si corresponde, zonas interactivas adaptadas a esa perspectiva. Un polígono dibujado sobre una vista no se reutiliza automáticamente en otra cámara.

Si se desea seleccionar pisos directamente sobre la fachada, se deben producir y validar sus contornos en cada vista habilitada. Como alternativa inicial, el exterior abre un selector de pisos sin contornos en fachada. Esta segunda opción reduce trabajo y sigue reproduciendo el flujo principal.

### Plantas y selección de departamentos

La planta amoblada puede ser una imagen. Encima se sitúan polígonos SVG o una capa equivalente con coordenadas normalizadas. Cada polígono apunta a una unidad o a una posición de unidad dentro del piso. El sistema debe conservar la alineación al redimensionar, ampliar o desplazar la imagen.

Cuando varios pisos comparten planta, se reutiliza la imagen y la plantilla de geometría. Los IDs, precios y estados de sus unidades permanecen separados. No se deducen superficies legales a partir de píxeles: las medidas deben venir de la documentación o estar marcadas como datos ficticios.

### Panoramas

Se necesitan panoramas compatibles con el visor elegido, idealmente originales equirectangulares completos, o un recorrido embebible con permiso. Una fotografía convencional no equivale a un panorama 360°. Cada escena necesita nombre, posición lógica, orientación inicial y vínculos hacia otras escenas.

La navegación entre panoramas puede usar puntos de salto. No equivale a caminar libremente por un modelo 3D y no debe prometerse como tal.

### Vistas exteriores desde una unidad

Registrar procedencia, posición, orientación y altura cuando se conozcan. Distinguir entre vista real capturada, visualización proyectada y vista ilustrativa. Si la misma tipología se repite en varios pisos, se puede compartir su tour de distribución, pero no atribuir la misma vista exterior a todas las alturas como si fuera exacta.

## 6. Paquete de datos y materiales a buscar

| Recurso | Mínimo para empezar | Preferido para la demo comercial | Validación |
| --- | --- | --- | --- |
| Derechos | Permiso claro para el uso previsto | Licencia reutilizable o autorización escrita para publicación comercial | Registrar fuente, titular, términos y atribución. |
| Identidad de proyecto | Nombre de trabajo y contexto | Ubicación, descripción y marca autorizada o ficticia | No sugerir una relación comercial inexistente. |
| Exterior | Una imagen de buena calidad | Varias cámaras coherentes y versión nocturna | Mismo edificio y entorno. |
| Plano arquitectónico | Planta legible con distribución | PDF vectorial, DWG/DXF u otro original disponible | Correspondencia con la unidad y las medidas. |
| Planta amoblada | Una vista superior de la tipología principal | Una por tipología | Muros, puertas, ventanas y mobiliario compatibles con los interiores. |
| Interiores | Galería y un panorama | Tres a cinco panoramas conectados y galería | Mismo departamento o misma tipología documentada. |
| Inventario | Datos ficticios identificados | Tabla de pisos/unidades/tipologías/estados | IDs estables y sin contradicciones. |
| Vistas | Opcional en el corte inicial | Capturas por altura/orientación | Etiqueta de fidelidad y procedencia. |
| Amenities | Opcional en el corte inicial | Una galería o panorama coherente | Pertenencia al proyecto. |
| Modelo fuente | No obligatorio si el paquete visual está completo | Modelo editable con materiales y cámaras | Formatos y permisos compatibles con la producción requerida. |

**Preferencia central:** encontrar un paquete coherente del mismo proyecto. No formar un edificio ficticio combinando una fachada, una planta y un tour que se contradicen.

## 7. Fase 1 — Búsqueda y elección del ejemplar

Esta es la siguiente fase a ejecutar. Este documento no declara que ya se haya encontrado un ejemplar válido.

### 7.1 Vías de búsqueda, por prioridad

1. **Proyecto real autorizado:** estudio, desarrollador o colaborador que permita usar planos, renders y panoramas como caso demostrativo. No contactar personas ni enviar solicitudes sin autorización para hacerlo.
2. **Conjunto abierto coherente:** escena arquitectónica o proyecto con licencia explícita que permita generar y publicar los recursos necesarios.
3. **Conjunto de pago:** registrar precio, licencia, materiales incluidos y trabajo pendiente; no comprar sin autorización.
4. **Proyecto de muestra producido por DAK:** usar un modelo base autorizado y generar renders/panoramas propios. Debe identificarse como proyecto conceptual cuando no represente un desarrollo real.

Un showroom público sirve para investigar interacciones. Su acceso público no lo convierte en una fuente de assets reutilizables. “Descarga gratis” tampoco prueba permiso comercial o de redistribución.

### 7.2 Búsqueda concreta

Buscar inicialmente en fuentes oficiales de estudios y desarrolladores, repositorios de arquitectura, bibliotecas de escenas y plataformas de modelos que publiquen licencias claras. Antes de priorizar una fuente, comprobar que realmente distribuye materiales y no solo imágenes de portafolio.

Consultas orientativas para adaptar al buscador:

- `edificio residencial Perú planos renders recorrido virtual 360`
- `departamentos Paraguay planta amoblada tour virtual`
- `proyecto multifamiliar Latinoamérica modelo 3D licencia comercial`
- `apartment building complete scene floor plan panorama commercial license`
- `residential architectural scene equirectangular panorama source model`
- `edificio residencial cena completa planta panorama 360 licença comercial`

No restringir la búsqueda a la palabra “masterplan”: para edificios son más útiles “planta”, “tipología”, “escena arquitectónica”, “showroom” y “panorama interior”.

### 7.3 Embudo de selección

1. Recopilar entre 8 y 12 candidatos relevantes; detener antes si aparece un paquete claramente suficiente.
2. Descartar candidatos sin acceso razonable a materiales, con derechos incompatibles o con incongruencias importantes.
3. Evaluar a fondo los tres mejores.
4. Descargar únicamente muestras autorizadas necesarias para comprobar resolución, formato y coherencia.
5. Presentar una opción recomendada y una alternativa, indicando exactamente qué tienen y qué falta producir.
6. Cerrar la selección antes de desarrollar toda la interfaz.

Si ninguna opción pasa los requisitos mínimos, entregar el diagnóstico y proponer producción propia desde un modelo autorizado. No alargar indefinidamente la búsqueda ni ocultar carencias de material.

### 7.4 Ficha obligatoria por candidato

```yaml
candidato_id: pendiente
nombre: pendiente
url_fuente: pendiente
autor_o_titular: pendiente
pais_y_contexto_visual: pendiente
tipo: proyecto_real_o_conceptual
licencia_o_permiso: pendiente
evidencia_de_permiso: pendiente
permite_demo_publica_comercial: pendiente
permite_modificacion_y_renders_derivados: pendiente
restricciones_de_redistribucion: pendiente
atribucion_requerida: pendiente
costo_y_fecha_de_consulta: pendiente
materiales_disponibles: []
materiales_faltantes: []
modelo_y_formatos: []
panoramas_y_resoluciones: []
coherencia_plano_render_tour: pendiente
trabajo_de_adaptacion: pendiente
decision: investigar
```

### 7.5 Matriz propuesta de evaluación

La puntuación es una herramienta interna de decisión, no una medida objetiva del mercado.

| Criterio | Peso |
| --- | ---: |
| Claridad y adecuación de derechos | 25 |
| Coherencia entre exterior, planos e interiores | 25 |
| Cobertura de materiales necesarios | 20 |
| Afinidad visual con Perú/Latinoamérica | 15 |
| Calidad técnica y visual | 10 |
| Esfuerzo de adaptación | 5 |
| **Total** | **100** |

Un problema de derechos bloquea la publicación aunque la puntuación total sea alta. Un candidato sin panoramas puede pasar a evaluación si dispone de un modelo autorizado capaz de producirlos; el esfuerzo pendiente debe quedar explícito.

### 7.6 Criterio de salida de búsqueda

- Un candidato principal y una alternativa documentados.
- Derechos compatibles o autorización pendiente claramente identificada; sin publicación hasta resolverla.
- Una unidad/tipología con plano e interior compatibles.
- Una imagen exterior coherente con el proyecto.
- Un panorama utilizable o ruta concreta para producirlo desde un modelo fuente.
- Lista de faltantes con responsable y esfuerzo estimado tras revisar los archivos.
- Decisión sobre si la demo representa un proyecto real o conceptual.

**Entregable:** dossier de candidatos, matriz comparativa, inventario de recursos y recomendación fundamentada. La decisión de compra, si la hubiera, queda separada de la investigación.

## 8. Fases completas de ejecución

### Fase 0 — Definición del producto

**Estado:** este documento es el entregable inicial.

Consolidar evidencia de referencia, alcance, principios visuales y requisitos de búsqueda. Mantener explícita la diferencia entre demo de lotes y showroom de edificios.

**Salida:** objetivo y alcance inicial suficientemente definidos para buscar materiales. Las cantidades concretas y el proveedor visual siguen abiertos.

### Fase 1 — Búsqueda del ejemplar

Ejecutar el procedimiento de la sección 7. No iniciar una implementación completa basada en imágenes provisionales inconexas.

**Salida:** ejemplar viable, permisos documentados y faltantes dimensionados.

### Fase 2 — Auditoría y preparación de materiales

1. Ordenar originales y conservar procedencia/licencia.
2. Relacionar edificio, pisos, tipologías, unidades y archivos.
3. Cotejar puertas, ventanas, balcones y circulación entre planos e interiores.
4. Identificar plantas repetidas y excepciones.
5. Normalizar nombres y crear IDs estables.
6. Preparar derivados web, miniaturas y alternativas de carga.
7. Definir polígonos sobre plantas y, si entra en alcance, sobre fachadas.
8. Registrar metadatos de panoramas y vistas.

**Salida:** paquete listo para una unidad completa; manifiesto de assets con tamaños, dimensiones, créditos y correspondencias. Ninguna inconsistencia esencial de distribución sin resolver.

### Fase 3 — Diseño de experiencia y prueba del flujo

Diseñar portada, exterior, selector de pisos, unidad, catálogo y contacto. Definir versión móvil, paneles, navegación atrás, estados vacíos y carga. La identidad visual será original para la demo.

**Salida:** flujo verificable de una unidad desde entrada hasta consulta, con jerarquía visual clara. Elegir tecnologías después de conocer formato de recursos, requisitos del visor y destino de publicación.

### Fase 4 — Corte funcional de una unidad

Implementar el recorrido mínimo completo con recursos reales del paquete seleccionado. Vincular selección, ficha, panorama y enlace directo mediante el mismo ID de unidad.

**Salida:** la unidad puede abrirse desde una URL, seleccionarse en la planta y consultarse sin perder contexto. Si el material no funciona aquí, corregir antes de escalar.

### Fase 5 — Navegación e inventario de demo

Extender a varios pisos y tipologías. Incorporar estados, catálogo y filtros. Reutilizar plantas donde corresponda sin compartir accidentalmente el estado de distintas unidades. Añadir cambios de vista exterior y variante nocturna si el material los admite.

**Salida:** ficha, plano y catálogo muestran la misma información; no hay unidades huérfanas ni selección desalineada con zoom o tamaño de pantalla.

### Fase 6 — Contenido y herramientas comerciales

Integrar galerías, panoramas enlazados, un amenity, vistas etiquetadas, PDF, QR, comparación básica y mapa. Configurar consulta contextual y distinguir claramente simulación de envío real.

**Salida:** PDF y enlaces reproducen la unidad correcta; el comparador funciona con las dos tipologías; no se envían mensajes involuntarios durante la demostración.

### Fase 7 — Validación y optimización

Verificar un recorrido representativo en escritorio y móvil, incluyendo una unidad disponible y otra vendida. Probar zoom, cambio de piso, enlaces directos, vuelta atrás, escenas 360, PDF y recursos faltantes. Revisar contraste, controles táctiles, teclado en navegación principal y movimiento reducido cuando haya animaciones.

Medir carga en un dispositivo y una conexión documentados. Cargar primero portada y recursos del paso actual; evitar descargar todos los panoramas al inicio. Proponer presupuestos de peso y rendimiento después de medir el material real.

**Salida:** sin fallos que bloqueen el recorrido comercial; limitaciones conocidas registradas. Priorizar pruebas de integración de datos y navegación sobre tests que solo repitan código trivial.

### Fase 8 — Publicación de demo y presentación comercial

Confirmar licencia, créditos, identidad de demo y contactos configurados. Publicar cuando corresponda a la instrucción de implementación, comprobar la URL y preparar un guion breve para mostrar el producto a inmobiliarias.

**Salida:** demo accesible, identificación de contenido ficticio, copia reproducible y lista de materiales que debe entregar un cliente real. Publicar una demo no implica activar reservas ni disponibilidad comercial real.

### Fase 9 — Conversión a producto reutilizable

Extraer configuración de marca y proyecto, separar contenido del código e incorporar importación validada de inventario. Definir administrador, roles, historial y proceso de actualización según necesidades comerciales reales.

**Salida:** incorporar un segundo proyecto no exige reescribir el visor ni duplicar lógica. La sincronización de inventario debe diseñarse y verificarse antes de ofrecer actualización en tiempo real a clientes.

## 9. Estructura de datos propuesta

La estructura es conceptual; no impone framework, base de datos o proveedor.

| Entidad | Campos principales |
| --- | --- |
| Proyecto | ID, nombre, marca, ubicación, descripción, modo demo, contacto y créditos. |
| Edificio | ID, proyecto, vistas exteriores, pisos y amenidades. |
| Piso | ID, edificio, etiqueta, orden, altura si se conoce y plantilla de planta. |
| Tipología | ID, nombre, distribución, superficies de referencia y contenido compartido. |
| Unidad | ID, piso, tipología, nombre, estado, superficie, orientación, precio opcional y excepciones de contenido. |
| Geometría | ID, recurso visual, vista, coordenadas normalizadas, unidad o posición de plantilla asociada. |
| Escena 360 | ID, recurso/URL, nombre legible, dirección inicial, hotspots y ámbito: unidad, tipología o amenity. |
| Vista exterior | ID, unidad/piso, orientación, altura conocida, procedencia y fidelidad declarada. |
| Asset | ID, archivo, clase, dimensiones, peso, autor, licencia, atribución y derivados. |
| Consulta | Unidad, piso, sección de origen y campos de contacto mínimos si se habilita envío real. |

Un precio desconocido se representa como ausencia de precio, no como cero. Una unidad vendida puede conservar su contenido para demostrar la tipología, pero su llamada a la acción debe ajustarse y no ofrecer reserva.

Los PDF se generan desde los mismos datos de ficha. Los QR codifican URLs públicas estables de unidad/sección, sin datos personales. No guardar datos de clientes en parámetros de URL.

## 10. Organización lógica del proyecto futuro

- `docs/`: plan, decisiones, fuentes, licencias y guía de entrega.
- `data/`: proyecto, edificios, pisos, tipologías, unidades y manifiesto de assets.
- `assets/source/`: originales autorizados; no publicar por defecto todo el material fuente.
- `assets/web/`: imágenes, panoramas y documentos preparados para el navegador.
- `geometry/`: contornos y correspondencias con las plantas/vistas.
- `src/`: navegación, catálogo, ficha, visor, comparación y exportación.
- `tests/`: verificaciones relevantes de correspondencia, rutas y flujo comercial.

La estructura física se adaptará al entorno elegido. No se ha fijado todavía hosting, framework ni motor de panoramas. Kuula es parte de la referencia observada, no una compra ni una dependencia decidida para DAK.

## 11. Qué pedir a un cliente real

### Información y documentos

- Planos actualizados del edificio, plantas tipo y excepciones.
- Tabla de unidades con piso, tipología, áreas, distribución, orientación y estado.
- Definición de si se muestran precios, moneda y fecha de actualización.
- Identidad visual, descripción del proyecto, amenities y contactos autorizados.
- Permisos de uso de imágenes, modelos y documentos suministrados.

### Material visual

- Renders exteriores e interiores en originales de buena calidad.
- Plantas amobladas; si no existen, incluir su producción en alcance.
- Panoramas originales o permiso para integrar un tour existente.
- Modelo editable si habrá que generar cámaras o panoramas nuevos.
- Para vistas reales: coordinar con el operador del dron puntos, alturas, orientaciones y registro de captura.

Si solo entregan fotos convencionales y medidas, primero se debe dimensionar la producción visual faltante. No prometer el resultado de President Tower con ese material sin trabajo adicional.

## 12. Riesgos y decisiones de alcance

| Riesgo | Respuesta prevista |
| --- | --- |
| Paquete bonito pero incompleto | Validar una unidad de punta a punta antes de elegir definitivamente. |
| Recursos públicos sin permiso de reutilización | Usarlos solo como referencia; conseguir autorización o cambiar de fuente. |
| Planos y renders incompatibles | Corregir desde el modelo/documentación; no ocultarlo con hotspots. |
| Vistas genéricas presentadas como exactas | Etiquetar ilustrativas o producir capturas adecuadas. |
| Panoramas pesados | Derivados y carga progresiva; medir en móvil antes de ampliar. |
| Dependencia de un visor externo | Revisar permiso de embedding, marca, condiciones, disponibilidad y alternativa. |
| Polígonos desalineados | Coordenadas normalizadas y pruebas con zoom/redimensionado. |
| Confundir demo con inventario real | Etiqueta visible y estados ficticios documentados. |
| Exceso de alcance | Cerrar primero una unidad completa; dejar ampliaciones para después. |
| IA genera habitaciones inconsistentes | Usar IA para tareas donde no rompa la geometría; basar continuidad espacial en un modelo/plano coherente. |

## 13. Definición de demo terminada

- [ ] Material coherente y con derechos documentados para la publicación prevista.
- [ ] Identidad propia y contexto visual adecuado al mercado objetivo.
- [ ] Recorrido exterior → piso → unidad → tour → consulta completo.
- [ ] Dos tipologías o alternativa justificada según el paquete seleccionado.
- [ ] Inventario de demo consistente en todas las pantallas.
- [ ] Geometría alineada y controles utilizables en móvil.
- [ ] Ficha, plano técnico y planta amoblada compatibles.
- [ ] Panoramas funcionales con nombres legibles y navegación clara.
- [ ] PDF, URL y QR apuntan a la unidad y sección correctas.
- [ ] Comparación básica y al menos un amenity disponibles.
- [ ] Vistas reales/ilustrativas diferenciadas si se incluyen.
- [ ] Consulta contextual verificada sin envíos involuntarios.
- [ ] Carga y estados de error revisados en condiciones documentadas.
- [ ] Créditos y carácter demostrativo visibles donde corresponda.
- [ ] Proceso de incorporar otro proyecto documentado.

## 14. Próxima acción y encargo para retomar

**Próxima acción: ejecutar la búsqueda del ejemplar de la fase 1.** No desarrollar aún la web completa ni descargar assets de las referencias como si fueran de libre uso.

Texto de trabajo para retomar:

> Buscar un proyecto residencial coherente para una demo DAK inspirada en la experiencia de President Tower: exterior, selección por piso, planta con unidades clicables, ficha, renders y tour interior 360. Priorizar Perú y contextos latinoamericanos visualmente familiares. Evaluar paquetes con licencia compatible, proyectos con autorización posible y modelos fuente desde los que producir recursos faltantes. Presentar hasta tres finalistas con enlaces, derechos, archivos disponibles, carencias, esfuerzo de adaptación y recomendación. No comprar ni contactar titulares sin autorización. No dar por abierta una licencia porque un showroom sea público. El objetivo es elegir un ejemplar que permita completar una unidad de punta a punta y después escalar la demo.

### Decisiones todavía abiertas

- Proyecto y país del ejemplar final.
- Material abierto, autorizado, comprado o producido desde un modelo.
- Marca conceptual y tipologías definitivas.
- Cantidad de pisos/unidades de la demo.
- Visor 360, infraestructura y tecnología de implementación.
- Alcance del administrador y canal comercial real.
- Cronograma y presupuesto: estimarlos después de auditar los recursos, separando búsqueda, producción visual, desarrollo y operación.

**Hito inmediato de éxito:** disponer de un ejemplar con el que sea viable reproducir la experiencia completa de una unidad, con derechos claros y sin contradicciones entre plano, render y recorrido.
