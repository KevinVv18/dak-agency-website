# ExcelAg — documento interno

### Todo lo que necesitas saber para defender la propuesta en la reunión

**Uso interno de DAK Agency. No compartir con el cliente.**
Fecha: julio 2026 · Datos verificados por rastreo directo de excelag.com el 28-jul-2026

---

## Nota de método, antes de nada

Todo lo que sigue con la marca **[VERIFICADO]** salió de rastrear su sitio directamente: contar etiquetas en las 93 URLs de producto, descargar y abrir las imágenes de programa, revisar los 15 sitemaps, consultar el WHOIS de punto.pe. Son observaciones, no opiniones.

Lo marcado **[SIN VERIFICAR]** no lo pude comprobar y **no debe decirse como si fuera dato**. Está listado al final para que sepas exactamente dónde está el límite de lo que podés afirmar.

Una advertencia metodológica honesta: las búsquedas se hicieron desde una herramienta que consulta Google de Estados Unidos. **Los resultados que observé no son idénticos a los que ve alguien en Chiclayo.** Eso debilita específicamente las conclusiones sobre términos locales; las conclusiones sobre su sitio no dependen de eso.

---

## 1. Cómo está construido su sitio

**[VERIFICADO]** Stack: WordPress 6.8.1, tema Astra, Elementor, Yoast SEO y WPML para el multiidioma. Elementor aparece 1.170 veces en el HTML de la portada.

**[VERIFICADO]** Volumen real de contenido — y es mucho más de lo que parece a simple vista:

| | Cantidad |
|---|---|
| Fichas de producto | 93 |
| Páginas de cultivo | 20 |
| Páginas de país | ~20, duplicadas en dos juegos de URLs |
| Notas del blog | 46 |
| URLs únicas en sitemap | 302 |

**[VERIFICADO]** No hay ecommerce. `/shop/`, `/cart/`, `/checkout/` y `/my-account/` devuelven 404. Las menciones a «woocommerce» en el HTML son solo selectores CSS del tema Astra. **Es un catálogo, no una tienda.** Su única conversión es un formulario genérico.

### Menú y arquitectura

Products | Crop Solutions | News and Results | Company | Contact, más un selector de regiones (USA, México, Centroamérica, Sudamérica, Caribe, Far East, África) y Public Health.

**Esto es importante y juega a nuestro favor:** su arquitectura es prácticamente la que construimos nosotros por otro camino. Organizan por líneas de producto y por cultivo, con su marco NIP. No les vamos a proponer un modelo mental ajeno.

---

## 2. Cómo está funcionando — el diagnóstico duro

Esta es la sección que sostiene toda la propuesta. Cada punto es comprobable en vivo delante de ellos.

### 2.1 El SEO on-page está prácticamente sin hacer

**[VERIFICADO]** De sus 93 fichas de producto:

- **92 no tienen meta description.** Solo `/excel-ag-product/aramite/` la tiene.
- **0 tienen datos estructurados de tipo Product.** Solo emiten el grafo genérico de Yoast, idéntico en todo el sitio.
- **35 no tienen H1** y 7 tienen más de uno.
- **En ninguna el H1 contiene el nombre del producto.** Los H1 más frecuentes son «Case Studies» (31 páginas) y «Crop Programs» (27).
- **La portada tampoco tiene H1.**

Traducción para la reunión: tienen 93 páginas de producto y ninguna le dice a Google de qué producto habla.

### 2.2 El activo más valioso está en una imagen

**[VERIFICADO]** Descargué y abrí sus gráficos de programa:

- El de palto (`NIP-Programs-Img-Avocado`) **sí** contiene el programa completo —etapas Germination, Vegetative Growth, Flower & Fruit Development, 70% Bloom, Maturation, con Humiplant, Saeta, Kompat, Fortex, Magnet B y Best K— todo dibujado dentro del JPEG. Se sirve con `alt=""`.
- El de arándano (`GROW141_CropChart-BLUEBERRIES`) es peor: **no nombra ni un solo producto.** Solo dibuja las etapas y una leyenda de colores vacía. La página se titula «Blueberries NIP Crop Program» y su gráfico central no mapea nada.

**[VERIFICADO]** 19 de las 20 páginas de cultivo **no tienen ni una sola tabla HTML**. Solo `/tomato/` tiene dos.

> **Este es el momento de la demo.** Abrí su página de arándano y la nuestra al lado. No hace falta explicar nada.

### 2.3 Cero señal geográfica hacia el Perú

**[VERIFICADO]** El español existe y técnicamente está bien montado: `lang=es-ES`, hreflang recíproco, canonical correcto, y el contenido realmente traducido. Pero:

- **Se sirve con el parámetro `?lang=es`** — que es exactamente la estructura que la documentación de Google marca como *«Not recommended»*.
- **El hreflang es `en` / `es` / `x-default`, sin ningún código de país.** No dice `es-PE` en ninguna parte.
- **Ninguna página en español tiene meta description.**
- **Solo 31 de 302 URLs del sitemap son españolas** (10%). En el sitemap de páginas, 8 de 70.

Para Google, hoy ExcelAg es una empresa estadounidense con versión en español. No hay una sola señal de que esté en el Perú.

### 2.4 Defectos técnicos concretos

**[VERIFICADO]** Todos comprobables en un minuto:

- **Los sitemaps duplican literalmente cada URL.** 186 entradas para 93 productos, 127 para 70 páginas, 67 para 46 posts. Exactamente el doble.
- **El sitemap declara URLs que dan 404:** `/?page_id=5814` y `/?page_id=6985`.
- **La `/sample-page/` de WordPress sigue publicada,** con 200, 400 palabras y listada en el sitemap.
- **La taxonomía `/crop/` está rota:** `/crop/rice/` y `/crop/pineapple/` sirven contenido idéntico —una entrada de Sri Lanka— sin relación con arroz ni piña. Y chocan con las páginas reales `/rice/` y `/pineapple/`.
- **La producción depende de un dominio de staging.** Los sellos OMRI, KIWA y FIBL y las fuentes de Elementor se cargan desde `live-excelag-new.pantheonsite.io`, que sigue vivo y sirve una copia completa del sitio. Son 6 referencias solo en la portada.

### 2.5 Un error de traducción que se repite en 11 páginas

**[VERIFICADO]** En 11 de las 16 páginas de cultivo en español dice **«mayor resistencia a la biotina y al estrés biótico»**. La biotina es una vitamina. Debería decir «estrés biótico y abiótico».

El origen es un typo en el inglés original —«a biotic» en vez de «abiotic»— que la traducción convirtió en un disparate técnico.

> **Cómo usar esto:** con muchísimo cuidado. Es el ejemplo más contundente de que nadie está revisando el español, pero señalarlo mal suena a superioridad. La forma correcta es mencionarlo como algo que encontraste revisando y que te llamó la atención *porque un agrónomo lo va a notar*. El daño no es de SEO, es de credibilidad técnica ante su propio cliente.

### 2.6 Su página de Perú

**[VERIFICADO]** Es una página real, no un placeholder: ~450 palabras, tres representantes con teléfono y correo, bloques de categorías de producto y tres programas de cultivo enlazados.

Pero:
- **Se sirve en inglés por defecto.**
- El título visible es un `H2`; sus dos `H1` son «Crop Programs» y «Case Studies».
- **Sus casos de éxito no son peruanos:** son los mismos genéricos de la página de Sudamérica.

---

## 3. «Su página vende mucho» — la revisión que pediste

Esta es la parte más delicada de la reunión y la que hay que manejar con más cuidado. **Las dos afirmaciones son separables, y la evidencia las separa con claridad.**

### Sí venden en el Perú. Eso es cierto y hay que reconocerlo.

**[VERIFICADO]**
- Al menos **tres distribuidores peruanos** comercializan producto formulado por ExcelAg: **Inveragro, Naturagro y Agripac Perú**.
- Existe una **etiqueta de Nemakill alojada en el servidor de SENASA**.
- Hay **ensayos de campo documentados** en Ica y en Santiago, con uva de mesa y cebolla.
- **AgroPages** —prensa sectorial independiente— cubrió sus acuerdos con Caribbean Chemicals y AMVAC Costa Rica.

### Pero el sitio web no participa de esa venta.

**[VERIFICADO]**
- Es un **catálogo sin precios, sin carrito y sin checkout**. Su única conversión es un formulario genérico.
- Su página de Perú **se limita a listar tres correos y tres celulares**.
- **Posiciona únicamente para sus propias marcas** — consultas navegacionales de quien ya conoce el producto y lo busca por nombre.
- **Desaparece por completo en las consultas de demanda.** «Bioestimulante para arándano Perú», «nematicida orgánico OMRI Perú» o «fosfonato de calcio phytophthora palta» devuelven Koppert, Farmex, Yara, Silvestre, Redagrícola y Portalfrutícola. Nunca excelag.com.

### Y el golpe más duro

**[VERIFICADO]** Cuando un producto de ExcelAg **sí** rankea en el Perú, **rankea desde el dominio del distribuidor.** La ficha «Saeta: Fosfonato de Calcio» que aparece es de **Naturagro**.

**Ninguno de los tres distribuidores acredita a ExcelAg ni enlaza a excelag.com.**

El posicionamiento que generan sus propios productos se está acumulando en dominios ajenos. Si mañana cambian de distribuidor, ese activo se queda del otro lado.

En Chiclayo, Lambayeque y Olmos —donde van a abrir— la huella digital de la marca es **literalmente cero**.

### Cómo decirlo sin que suene a que los estás corrigiendo

> «Su producto vende en el Perú, eso está claro y lo verificamos: hay distribuidores, hay registro en SENASA, hay ensayos. Lo que encontramos es que esa venta ocurre por el canal comercial, no por el sitio. Y hay un detalle que sí nos preocupó: cuando buscamos Saeta en el Perú, el resultado que aparece es de Naturagro, no de ustedes. El posicionamiento que genera su propio producto se lo está quedando el distribuidor.»

**Nunca digas «su web no sirve».** Decí «su web no está peleando en el terreno donde ustedes ya tienen producto ganador». Es lo mismo, y una versión abre la conversación mientras la otra la cierra.

---

## 4. Qué tan bien lo veo funcionando — mi lectura honesta

**A favor, y es bastante:**

- Su arquitectura ya es la correcta. No hay que convencerlos de un modelo nuevo.
- Tienen contenido real: 93 productos y 20 cultivos. No partimos de cero, partimos de reorganizar.
- El nicho de contenido de diagnóstico **está vacío en el Perú**. **[VERIFICADO]** Los términos tipo «clorosis férrica» están ocupados por sitios de jardinería española (COMPO, Ecoagricultor, Plantasmania). Nada peruano, nada de nivel agroexportador.
- Tienen certificaciones reales (OMRI en Nemakill) que hoy no están explotadas donde el comprador de exportación las busca.
- La marca no tiene deuda: no hay nada que limpiar, solo que construir.

**En contra, y hay que tenerlo presente:**

- **[VERIFICADO]** Los términos técnicos (nematodos, Meloidogyne) **sí** están disputados: Redagrícola, Portalfrutícola, Solagro y Novagro-AG ya están ahí. No es tierra libre.
- El mercado es más chico de lo que sugiere el titular. **[VERIFICADO]** La costa norte tiene ~19.800 ha de arándano (74% del país) y ~31.950 ha de palta Hass, pero el universo real de compradores serios es de **~944 empresas agroexportadoras por encima de US$1M** —no las 2.742 del padrón— y **solo ~170 participan en arándano**.
- Con un universo de esa dimensión, **el SEO no es un juego de volumen, es un juego de precisión.** No necesitamos miles de visitas: necesitamos que los 170 jefes de campo del arándano encuentren la ficha correcta.
- Su aprobación de marca probablemente pase por Miami, lo que alarga los ciclos.

**Mi lectura:** es un proyecto con techo alto y arranque lento. El valor no está en tráfico masivo sino en ser el único sitio en español peruano que resuelve el problema técnico que el agrónomo tiene delante. Eso se construye con contenido, y el contenido tarda.

---

## 5. Plazos y qué prometer

**[VERIFICADO]** Base de evidencia, para que sepas de dónde sale cada número:

- **Ahrefs, estudio sobre 1 millón de URLs:** solo el **1,74%** de las páginas nuevas entra al top 10 en un año (6,11% si se filtra basura). El **72,9%** de lo que ocupa el top 10 tiene **más de 3 años**.
- **Guía oficial de Google:** el marco defendible es **«de cuatro meses a un año»** para ver beneficio. Y prohíbe explícitamente garantizar posiciones: *«Nadie puede garantizar el puesto n.º 1 en Google»*.
- **El dato que juega a favor:** el **40,82%** de las páginas que llegaron al top 10 lo hicieron **dentro del primer mes**. Traducción: cuando una página de cola larga va a rankear, lo hace rápido. Si a los 6 meses no se movió, difícilmente se mueva sola.
- **Pew Research:** con AI Overview, el clic a resultados orgánicos cae **del 15% al 8%** de las visitas.

### Lo que sí podés prometer

| Plazo | Prometible | Por qué es defendible |
|---|---|---|
| **Mes 1–2** | Sitio publicado, indexado, midiendo. GBP activo. Primeras consultas por WhatsApp. | Depende de nuestro trabajo, no del algoritmo. |
| **Mes 3–4** | Apariciones e impresiones crecientes en términos específicos. Primeras posiciones en cola larga. | Cae dentro del marco «4 meses a un año» de Google. |
| **Mes 6** | Volumen sostenido de consultas. Posiciones consolidadas en términos técnicos y de cultivo. Datos para decidir dónde invertir. | El 40,82% que rankea lo hace pronto; a 6 meses ya se sabe qué funcionó. |
| **Mes 12** | Biblioteca de contenido generando consultas de forma continua. | Marco superior de la guía de Google. |

### Lo que NO podés prometer nunca

1. **Ninguna posición concreta.** Google lo prohíbe explícitamente y cualquiera puede citarlo. Si ellos lo piden, esa cita es tu mejor respuesta.
2. **«Agroquímicos Perú» y similares.** **[VERIFICADO]** Esa SERP está copada por directorios (Páginas Amarillas, infoisinfo, infocomercial) y fabricantes con décadas (Grupo Silvestre, Rainbow, Agrointesa). No es prometible en el horizonte del contrato.
3. **Tráfico como métrica de éxito.** Con AI Overview, posición ya no equivale a visitas. **Medí impresiones, posiciones y leads.** Poné esto en el contrato: te protege a vos.
4. **Cualquier proyección de leads a partir de tráfico.** **[SIN VERIFICAR]** No existe benchmark publicado de conversión orgánica a lead en B2B agroinsumos. No inventes uno.

### El dato de calendario que puede definir el arranque

**[VERIFICADO]** El pico exportador del arándano es **setiembre-octubre**, pero **la compra de insumos ocurre 4 a 6 meses antes**: la poda es en **febrero-marzo**, precisamente para que la producción salga en setiembre y octubre.

**Implicación directa:** un sitio cronometrado al ciclo noticioso de exportación llega tarde a la decisión de compra. Si arrancamos ahora, en julio, llegamos con el sitio maduro justo a la ventana de decisión de la campaña siguiente. **Ese es un argumento de urgencia real, no inventado.**

---

## 6. La estrategia de dominio — variables del .pe

Esta es la pregunta que te van a hacer y conviene llegar con la respuesta armada.

### Lo que dice la evidencia

**[VERIFICADO]**
- Google dice explícitamente que **ccTLD, subdominio y subcarpeta son las tres válidas**. No hay ganador universal.
- **Gary Illyes (jul-2024)** confirmó que el ccTLD **sigue dando ventaja local en 2026**, pero matizó que *«el idioma del sitio pesa más que el dominio»*.
- **Dato que cambia el cálculo y que casi nadie menciona:** Google **eliminó el country targeting de Search Console en septiembre de 2022**. Ya **no se puede geosegmentar una subcarpeta al Perú de forma explícita.** A una subcarpeta hoy solo le quedan hreflang `es-PE`, contenido local, GBP y enlaces locales.

### Disponibilidad y costo

**[VERIFICADO]** Consulté el WHOIS oficial de punto.pe el 28-jul-2026:

- **`excelag.pe` está LIBRE**
- **`excelag.com.pe` está LIBRE**
- **No exige presencia local** en el Perú para registrarlo
- Costo aproximado: **S/103 a S/180 al año**

> **Acción inmediata, independientemente de lo que decidan:** que registren los dos. Cuestan menos que un almuerzo y protegen la marca. Si alguien más los toma —un distribuidor, por ejemplo— recuperarlos es caro y lento. Este es el consejo que te hace ver que estás cuidando su negocio y no vendiéndoles horas.

### El precedente que más se parece al caso

**[VERIFICADO]** **Corteva** —multinacional estadounidense de agro, el caso más análogo— compró `corteva.pe` y **lo redirige 301 a `corteva.com/pe/`**, que sirve `hreflang="es-pe"`. Es decir: **ccTLD defensivo + SEO en subcarpeta.**

En cambio **Bayer, Syngenta, BASF** y **todos los competidores locales** —Silvestre, Farmex, TQC, Hortus, Farmagro— corren sobre `.pe` o `.com.pe`.

### Mi recomendación

**Registrar `excelag.pe` y `excelag.com.pe` ya, y construir el sitio peruano en `excelag.com.pe`.**

Razones, en orden de peso:

1. **Es lo que hacen todos sus competidores en el Perú.** Silvestre, Farmex, TQC, Hortus y Farmagro están en `.pe`/`.com.pe`. El comprador peruano está acostumbrado a esa señal.
2. **La subcarpeta perdió su mejor herramienta.** Sin country targeting en Search Console, la ventaja de heredar autoridad se paga con la imposibilidad de geosegmentar explícitamente.
3. **El contenido va a ser 100% en español y para un solo país.** No hay conflicto con el sitio en inglés, que es el escenario donde la subcarpeta brilla.
4. **Control operativo.** Un dominio propio lo administramos nosotros sin depender de que Miami autorice tocar el WordPress corporativo — que, viendo el estado del sitio, es un cuello de botella real.

**El costo honesto de esta decisión:** el `.com.pe` **parte de cero en autoridad**. Se compensa enlazándolo desde `excelag.com` con un enlace visible y desde la ficha de Google de Chiclayo. Decilo vos antes de que lo pregunten ellos; genera más confianza que ocultarlo.

**Si Miami se niega a un dominio nuevo**, el plan B es `excelag.com/pe/` con `hreflang="es-PE"` — funciona, es lo que hace Corteva, pero implica pelear cada cambio dentro de su WordPress. Cotizalo más caro, no más barato: el mantenimiento es peor.

**Y en cualquiera de los dos casos, lo primero es arreglar el `?lang=es`.** Es la única estructura que Google desaconseja por escrito, y hoy es la que están usando.

---

## 7. Cómo está nuestra maqueta, en números

Para que sepas exactamente qué estás mostrando:

| | ExcelAg hoy | Nuestra maqueta |
|---|---|---|
| HTML de la portada | **355 KB** | **26 KB** (6 KB comprimido) |
| Hojas de estilo | 37 | 1 |
| Scripts | 38 | 2 |
| Dominios externos | 6+ (Google Fonts, jsDelivr, GTM, Facebook, Pantheon) | **0** |
| Programa por cultivo | Imagen JPEG | Tabla HTML con dosis |
| Páginas de diagnóstico | 0 | 9 |
| Productos con meta description | 1 de 93 | todas |
| Productos con schema Product | 0 de 93 | todas |

**Aclaración para que no te pise una pregunta:** nuestra primera carga completa pesa ~380 KB sin comprimir, que no es dramáticamente menor que sus 355 KB. **Pero esos 355 KB de ellos son solo el documento HTML**, antes de 37 hojas de estilo, 38 scripts y 33 imágenes. La diferencia real está en el **número de peticiones**: unas 6 contra más de 100. Y con la compresión Brotli que ya tenemos activa, nuestro HTML viaja en 6 KB y el CSS en 15.

Si te preguntan por velocidad, hablá de **peticiones y de dependencias externas**, no de kilobytes. Ese es el terreno donde la diferencia es de otro orden.

---

## 8. Qué falta pulir en nuestro proyecto

Ordenado por lo que más impacta en una reunión, no por dificultad.

### Antes de la reunión

| Falta | Por qué importa |
|---|---|
| **Fotografía propia** | Solo 1 de 9 fichas de problema tiene foto de referencia. Las fichas sin imagen se leen más pobres, y es justo la sección que más nos diferencia. |
| **Logo de ExcelAg en vector** | Hoy usamos su PNG de 275 px. Sirve para la reunión; se ve blando en pantalla grande. |
| **Programas de palto, uva y espárrago** | Solo arándano está completo. Si preguntan por palto —y van a preguntar, es la columna de la agroexportación— hoy dice «en preparación». |
| **Probarlo en un celular real** | Lo verifiqué a 375 px simulados, no en un teléfono con datos móviles. Hacelo antes. |

### Mejoras técnicas reales, para después

| Mejora | Estado hoy |
|---|---|
| `datos.js` se envía completo en todas las páginas | 53 KB (17 comprimido) en cada página, incluidas las que no lo usan. El blog solo son 21 KB de eso. |
| Sin `srcset` en imágenes | El móvil descarga la misma imagen que el escritorio. |
| Sin estilos de impresión | El programa por etapa es exactamente lo que un agrónomo imprime para llevar al campo. |
| Sin página 404 | Detalle menor pero se nota. |
| Video en el hero | El diseño ya está preparado para recibirlo; falta el material. **Y ellos ya tienen video en su hero**, así que es terreno conocido para ellos. |

### Piezas que suman argumento comercial

- **Asistente de diagnóstico con derivación por territorio** — que la consulta llegue sola al representante de la zona.
- **Mapa clickeable del norte** para la sección de cobertura.
- **Comparador de compatibilidad de mezclas** — no lo tiene nadie en el rubro y sale directo de una de las notas que ya escribimos.

---

## 9. Objeciones probables y cómo responderlas

**«Ya tenemos web, ¿para qué otra?»**
No es otra web: es la versión peruana de la que ya tienen. Su arquitectura es correcta y no la vamos a cambiar. Lo que cambia es que el programa deje de ser una imagen y que el sitio dé señal de estar en el Perú.

**«Nuestro sitio ya vende.»**
Su producto vende, y lo verificamos. Lo que encontramos es que la venta ocurre por el canal comercial. Y hay algo que sí conviene mirar: cuando se busca Saeta en el Perú, el resultado que aparece es de Naturagro.

**«¿Cuánto tardan los resultados?»**
Google mismo dice de cuatro meses a un año. Nosotros comprometemos el sitio funcionando y midiendo en dos meses, y consultas reales desde el mes tres o cuatro. Lo que no vamos a prometer es una posición: Google prohíbe explícitamente garantizarla, y quien la prometa está vendiendo humo.

**«¿Por qué no lo hacemos en nuestro WordPress?»**
Se puede, y es el plan B. Cuesta más de mantener y les hace depender de Miami para cada cambio. Y hay algo que arreglar primero de cualquier manera: el `?lang=es` es la única estructura que Google desaconseja por escrito.

**«¿Cuánto cuesta?»**
Depende del alcance, que definimos juntos. Lo que sí conviene hacer hoy, cueste lo que cueste el proyecto, es registrar `excelag.pe` y `excelag.com.pe`: están libres, salen unos S/150 al año y protegen su marca.

---

## 10. Los límites de lo que puedo afirmar

**[SIN VERIFICAR]** — no digas nada de esto como si fuera dato:

- **Volúmenes de búsqueda reales en el Perú** para cualquier término. No hay acceso a Keyword Planner. **Cualquier proyección de tráfico sería inventada.** Sacá los datos con la cuenta de Google Ads antes de firmar.
- **Dificultad cuantificada** de los términos comerciales. La SERP de «agroquímicos Perú» la vi cualitativamente, no tengo el número de dominios de referencia necesario.
- **Historial del dominio** que use ExcelAg. Si estuvo registrado antes, si tuvo contenido o penalizaciones. Cambia el punto de partida y hay que auditarlo antes de comprometer plazos.
- **Si un subdominio hereda autoridad del dominio padre.** Es un punto genuinamente disputado entre la postura oficial de Google y la observación del sector. No afirmes en ninguna dirección.
- **Frecuencia de AI Overviews en consultas agro en español peruano.** Los datos de Pew son de EE.UU. y en inglés. En un nicho técnico probablemente sea menor, pero no hay medición para LATAM.
- **Plazos de local pack en Chiclayo.** Los rangos de 2-8 semanas son promedios de agencias en EE.UU. y Europa. La competencia local es presumiblemente mucho menor —jugaría a favor— pero no tengo el dato.
- **Tasa de conversión de tráfico orgánico a lead en B2B agroinsumos.** No hay benchmark publicado. No proyectes leads.
- **Vigencia del estudio de Semrush (2021-2022)** post-AI-Overviews. Su 19% a 6 meses probablemente sea optimista para 2026.
- **Plazos de efecto de backlinks.** Todo lo publicado viene de proveedores de link building con incentivo comercial, sin metodología. Por eso no está en el documento del cliente.

Y una limitación transversal: **las búsquedas se hicieron desde Google de EE.UU.**, así que los resultados observados no son los que ve alguien en Chiclayo. Antes de la reunión, buscá los mismos términos desde tu conexión y contrastá. Si hay diferencias grandes, ajustá.

---

## 11. Lo que hay que conseguir de ellos

Por orden de urgencia:

1. **Lista de productos con registro SENASA vigente en el Perú.** Define qué se puede publicar legalmente. Sin esto, nada de lo demás avanza.
2. **Logo en vector.**
3. **Validación agronómica** de los programas por cultivo, y quién firma.
4. **Fotografía propia** de campo y de la planta de Chiclayo.
5. **Quién aprueba contenido** y si pasa por Miami.
6. **Acceso a su Search Console y Analytics**, si los tienen. Ahí está la respuesta real a «vende mucho».
7. **Territorios exactos** de Cruz, Gavidia y García, para la derivación.

---

*Documento interno de DAK Agency. Datos de excelag.com verificados por rastreo directo el 28-jul-2026.*
