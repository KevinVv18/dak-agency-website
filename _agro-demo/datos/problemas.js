/* ─────────────────────────────────────────────────────────────────────────────
   problemas.js — plagas, enfermedades y desórdenes.

   Es la pieza de posicionamiento más valiosa del sitio: el agricultor no busca
   "bioestimulante", busca "hojas amarillas en arándano". Cada entrada genera su
   propia página en /problemas/<slug>/.

   La estructura sigue la lógica que hace fuerte a una página de referencia:
   primero enseñar a identificar, después explicar por qué ocurre, y recién
   entonces ofrecer producto. El que llega buscando ayuda se va habiendo
   aprendido algo — y por eso vuelve.

   `confusion` es el campo que más valor aporta y el que casi nadie escribe:
   con qué se confunde habitualmente y cómo distinguirlo. Es lo que separa una
   ficha útil de una lista de síntomas.

   Todas las descripciones son agronómicamente reales. Lo demostrativo es la
   recomendación de producto.
   ───────────────────────────────────────────────────────────────────────── */

export default [
  {
    id: 'clorosis', slug: 'clorosis-ferrica', tipo: 'carencia',
    n: 'Clorosis férrica', cien: 'Deficiencia inducida de hierro',
    resumen:
      'El amarillamiento más frecuente del norte peruano y el más malinterpretado. ' +
      'Casi nunca falta hierro en el suelo: falta hierro DISPONIBLE, que es otra cosa.',
    senal: [
      'Hojas jóvenes amarillas con las nervaduras todavía verdes, dibujando una retícula.',
      'Aparece primero en el brote nuevo, nunca en la hoja vieja.',
      'En casos severos la hoja pasa de amarilla a blanquecina y se quema por el borde.',
      'Suele darse en manchones, coincidiendo con las zonas de suelo más calcáreo o peor drenadas.'
    ],
    causa:
      'Suelo calcáreo o riego con agua dura. A pH alto el hierro precipita y la raíz no lo puede tomar, ' +
      'aunque el análisis de suelo muestre contenido suficiente. El exceso de humedad y el bicarbonato del ' +
      'agua de riego agravan el bloqueo.',
    confusion:
      'Se confunde con deficiencia de nitrógeno, pero el nitrógeno amarillea la hoja ENTERA y empieza por las ' +
      'hojas viejas, porque la planta lo removiliza hacia el brote. El hierro no se removiliza: por eso el daño ' +
      'se ve arriba y la nervadura sigue verde. Si dudas, mira dónde está el amarillo.',
    cuando: 'Más marcado en brotación y en los primeros flujos vegetativos, cuando la demanda es alta.',
    prods: [
      { p: 'micromix', momento: 'Foliar cada 12 días mientras dure el flujo de brotación.' },
      { p: 'zerosal', momento: 'En fertirriego, con la dosis salida del análisis de agua.' },
      { p: 'suelomejora', momento: 'Mensual, para sostener disponibilidad en la zona de raíz.' }
    ],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    img: 'sintoma-clorosis.webp',
    imgAlt: 'Brote de arándano con hojas amarillas y nervaduras verdes, patrón típico de clorosis férrica',
    imgPie: 'Brote joven de arándano con clorosis intervenal. El amarillo avanza en la lámina mientras la nervadura sigue verde: ese contraste es el que la distingue de una carencia de nitrógeno.',
    relacionados: ['salinidad', 'phytophthora']
  },
  {
    id: 'nematodo', slug: 'nematodo-agallador', tipo: 'plaga',
    n: 'Nematodo agallador', cien: 'Meloidogyne spp.',
    resumen:
      'El daño más caro del suelo arenoso, porque cuando se nota en la parte aérea la raíz ya está comprometida ' +
      'y la recuperación toma una campaña entera.',
    senal: [
      'Agallas o nudos engrosados en la raíz, visibles al desenterrar una planta con cuidado.',
      'Plantas enanas en manchones dentro del lote, no distribuidas al azar.',
      'Decaimiento a media mañana aunque el riego esté bien: la raíz dañada no abastece la demanda.',
      'Respuesta pobre a la fertilización, porque la raíz no absorbe.'
    ],
    causa:
      'Población establecida en el suelo, favorecida por suelo arenoso, monocultivo y temperaturas altas. ' +
      'Se dispersa con maquinaria, agua de riego y plantines infectados.',
    confusion:
      'Se confunde con falta de riego o con deficiencia nutricional, porque los síntomas aéreos son idénticos. ' +
      'La diferencia está bajo tierra: hay que desenterrar. También se confunde con los nódulos fijadores de ' +
      'nitrógeno en leguminosas, pero esos se desprenden con el dedo y la agalla de Meloidogyne es parte de la raíz.',
    cuando: 'La población sube con el calor. La ventana de manejo es poscosecha, cuando se puede tratar sin fruta.',
    prods: [
      { p: 'nematb', momento: 'Drench con suelo húmedo, en poscosecha y al reinicio de campaña.' },
      { p: 'tricho5', momento: 'Al trasplante y cada vez que haya raíz nueva que colonizar.' },
      { p: 'raiz12', momento: 'Fertirriego, para acompañar la emisión de raíz nueva.' }
    ],
    cultivos: ['arandano', 'uva', 'esparrago'],
    relacionados: ['phytophthora', 'salinidad']
  },
  {
    id: 'botrytis', slug: 'moho-gris-botrytis', tipo: 'enfermedad',
    n: 'Moho gris', cien: 'Botrytis cinerea',
    resumen:
      'La enfermedad que decide cuánta fruta llega al packing. Ataca en floración y vuelve a aparecer en ' +
      'poscosecha, cuando la fruta ya está lejos y no se puede hacer nada.',
    senal: [
      'Micelio gris polvoriento sobre flor y fruta, que se levanta como humo al moverlo.',
      'Pudrición blanda que avanza desde el cáliz hacia adentro del fruto.',
      'Flores que se pardean y quedan pegadas al racimo en vez de caer limpias.',
      'Focos que aparecen en las zonas de follaje más cerrado y menos ventilado.'
    ],
    causa:
      'Inóculo presente casi siempre; lo que dispara el brote es la humedad alta con poca ventilación. ' +
      'El exceso de vigor y el follaje cerrado crean el microclima que necesita.',
    confusion:
      'En fruta madura se confunde con pudriciones de poscosecha por otros hongos, pero el gris polvoriento y ' +
      'la entrada por el cáliz son de botrytis. Una diferencia práctica: botrytis avanza también en frío, así ' +
      'que si la pudrición progresa en cámara, sospecha de ella.',
    cuando: 'Floración y las dos semanas posteriores. Segundo pico en poscosecha.',
    prods: [
      { p: 'bacsub', momento: 'Cada 7 días durante toda la floración, sin mezclar con cobre.' },
      { p: 'cobreorg', momento: 'Preventivo fuera de floración abierta.' },
      { p: 'silika', momento: 'Cada 14 días, para endurecer tejido.' }
    ],
    cultivos: ['arandano', 'uva'],
    relacionados: ['oidio', 'trips']
  },
  {
    id: 'oidio', slug: 'oidio', tipo: 'enfermedad',
    n: 'Oídio', cien: 'Podosphaera / Erysiphe spp.',
    resumen:
      'El hongo que no necesita lluvia. Por eso sorprende en costa desértica, donde el productor asume que ' +
      'sin agua libre no hay enfermedad.',
    senal: [
      'Polvo blanco superficial en hoja y brote, que se limpia pasando el dedo.',
      'Deformación y acartuchamiento de la hoja nueva.',
      'Brotes que frenan su crecimiento sin causa aparente.',
      'En ataques avanzados, manchas cloróticas en el envés bajo el micelio.'
    ],
    causa:
      'Días templados con noches frescas y humedad relativa moderada. A diferencia de casi todos los hongos, ' +
      'no necesita agua libre sobre la hoja para infectar: le basta la humedad del ambiente.',
    confusion:
      'Se confunde con residuo de aplicación —restos de azufre o de un caldo mal disuelto— y con daño de ácaro ' +
      'hialino, que también deforma el brote. El polvo de oídio se limpia con el dedo y reaparece; el residuo no reaparece.',
    cuando: 'Transiciones de temporada, cuando la amplitud térmica entre día y noche crece.',
    prods: [
      { p: 'silika', momento: 'Cada 14 días como endurecedor de pared celular.' },
      { p: 'cobreorg', momento: 'Preventivo, fuera de floración abierta.' },
      { p: 'fosfit', momento: 'Cada 21 días, para sostener la respuesta de defensa.' }
    ],
    cultivos: ['arandano', 'uva', 'palto'],
    relacionados: ['botrytis', 'acaro']
  },
  {
    id: 'trips', slug: 'trips', tipo: 'plaga',
    n: 'Trips', cien: 'Frankliniella spp.',
    resumen:
      'Daño de calibre y de categoría: rara vez mata la planta, pero baja la fruta de exportación a mercado ' +
      'nacional, que es donde se pierde el margen.',
    senal: [
      'Plateado o bronceado en la hoja, por las células vaciadas al alimentarse.',
      'Cicatrices y deformación en el fruto, sobre todo alrededor del cáliz.',
      'Puntos negros diminutos —deyecciones— junto a las zonas plateadas.',
      'Al sacudir una flor sobre papel blanco caen insectos muy pequeños y alargados que se mueven rápido.'
    ],
    causa:
      'Migración desde malezas y cultivos vecinos, sobre todo cuando esos se secan o se cosechan y el insecto ' +
      'busca refugio. La floración es el imán: el polen es su alimento preferido.',
    confusion:
      'El plateado se confunde con daño de ácaro, pero el ácaro deja un bronceado más difuso y telilla en el ' +
      'envés; el trips deja plateado con puntos negros. Y la deformación del fruto se confunde con daño de ' +
      'viento o de granizo, que no dejan deyecciones.',
    cuando: 'Floración, y cualquier momento en que se cosechen o sequen los cultivos vecinos.',
    prods: [
      { p: 'silika', momento: 'Cada 14 días, para dificultar la alimentación.' },
      { p: 'adherplus', momento: 'En cada caldo foliar, porque el trips se refugia en pliegues.' },
      { p: 'micromix', momento: 'Para sostener la recuperación del tejido dañado.' }
    ],
    cultivos: ['arandano', 'uva', 'palto', 'esparrago'],
    relacionados: ['acaro', 'oidio']
  },
  {
    id: 'calcio', slug: 'deficiencia-de-calcio', tipo: 'carencia',
    n: 'Deficiencia de calcio', cien: 'Ca no disponible o mal translocado',
    resumen:
      'No se ve en la hoja: se ve en el reclamo del cliente. Es la carencia que aparece cuando la fruta ya ' +
      'está en destino y llega blanda.',
    senal: [
      'Fruta blanda, con vida de poscosecha corta pese a una cadena de frío correcta.',
      'Necrosis en el ápice del brote y en los bordes de la hoja más joven.',
      'La hoja vieja se ve perfectamente sana, lo que despista.',
      'Mayor incidencia de pudriciones secundarias en fruta, porque la pared celular es débil.'
    ],
    causa:
      'Calcio insuficiente durante la ventana de división celular, o boro ausente, que es el que permite que el ' +
      'calcio se mueva. También lo induce el exceso de riego o de potasio, que compiten por la absorción.',
    confusion:
      'Se confunde con problema de cadena de frío o de manipulación en packing, porque el síntoma aparece lejos ' +
      'del campo. La pista: si la fruta salió blanda desde el inicio y no hay daño mecánico, el problema fue ' +
      'nutricional y ocurrió meses antes.',
    cuando: 'La ventana crítica es cuajado y las primeras semanas de crecimiento del fruto. Después ya no se corrige.',
    prods: [
      { p: 'calfort', momento: 'Foliar cada 10 días desde cuajado hasta llenado.' },
      { p: 'adherplus', momento: 'En cada caldo, para mojar bien la hoja cerosa.' },
      { p: 'zerosal', momento: 'Si el agua es dura y compite por la absorción.' }
    ],
    cultivos: ['arandano', 'palto', 'uva'],
    relacionados: ['salinidad', 'clorosis']
  },
  {
    id: 'salinidad', slug: 'estres-por-sales', tipo: 'abiotico',
    n: 'Estrés por sales', cien: 'CE elevada en suelo o agua de riego',
    resumen:
      'El problema estructural de la costa norte. Suelo arenoso, agua dura y lámina de riego corta: las sales ' +
      'se acumulan en la zona de raíz y la planta deja de responder a todo lo demás.',
    senal: [
      'Bordes de hoja quemados, avanzando de afuera hacia adentro.',
      'Crecimiento detenido pese a fertilización correcta.',
      'Planta que no responde a más fertilizante — y que empeora si se insiste.',
      'Costra blanquecina en la superficie del suelo alrededor del gotero.'
    ],
    causa:
      'Agua de riego con alta conductividad, drenaje insuficiente o lámina de riego demasiado corta para lavar ' +
      'el perfil. En suelo arenoso el margen de error es mínimo.',
    confusion:
      'Se confunde con déficit hídrico, y el reflejo de aplicar más riego corto empeora el cuadro: sin lámina ' +
      'de lavado se aporta más sal. También se confunde con fitotoxicidad por sobredosis de fertilizante, que ' +
      'en la práctica es el mismo mecanismo.',
    cuando: 'Se acumula a lo largo de la campaña. Se agrava en los meses de mayor demanda evaporativa.',
    prods: [
      { p: 'zerosal', momento: 'En fertirriego, con dosis salida del análisis de agua.' },
      { p: 'suelomejora', momento: 'Mensual, para mejorar estructura y capacidad de intercambio.' },
      { p: 'raiz12', momento: 'Para recuperar raíz funcional después de corregir el agua.' }
    ],
    cultivos: ['arandano', 'palto', 'uva', 'esparrago'],
    relacionados: ['clorosis', 'calcio']
  },
  {
    id: 'phytophthora', slug: 'pudricion-de-raiz', tipo: 'enfermedad',
    n: 'Pudrición de raíz', cien: 'Phytophthora spp.',
    resumen:
      'Mata plantas, no solo baja rendimiento. Y avanza por las partes bajas del lote, donde el agua se queda ' +
      'y nadie mira hasta que hay plantas secas.',
    senal: [
      'Decaimiento general con hoja pequeña y clorótica.',
      'Raíz oscura, quebradiza, sin raicillas blancas activas.',
      'Peor en las partes bajas del lote o donde el riego encharca.',
      'Plantas que colapsan de golpe en el primer día de calor fuerte.'
    ],
    causa:
      'Exceso de humedad y drenaje pobre. El patógeno produce zoosporas que nadan: necesita agua libre para ' +
      'moverse, así que el problema es de riego y de suelo antes que de fungicida.',
    confusion:
      'Se confunde con nematodo, porque ambos dan decaimiento y raíz dañada. La diferencia: el nematodo deja ' +
      'agallas y la raíz conserva color; Phytophthora deja raíz oscura y podrida, sin nudos. También se confunde ' +
      'con exceso de sales, pero ahí la raíz se ve sana aunque corta.',
    cuando: 'Después de eventos de riego excesivo o lluvia, con temperatura en ascenso.',
    prods: [
      { p: 'fosfit', momento: 'Preventivo, cada 21 días en las zonas de riesgo del lote.' },
      { p: 'tricho5', momento: 'Drench temprano, cuando hay raíz nueva que colonizar.' },
      { p: 'suelomejora', momento: 'Para mejorar estructura y drenaje del perfil.' }
    ],
    cultivos: ['arandano', 'palto', 'esparrago'],
    relacionados: ['nematodo', 'salinidad']
  },
  {
    id: 'acaro', slug: 'acaro-hialino', tipo: 'plaga',
    n: 'Ácaro hialino', cien: 'Polyphagotarsonemus latus',
    resumen:
      'Invisible a simple vista y por eso se diagnostica tarde: cuando el daño se nota, el ácaro que lo causó ' +
      'ya se movió a otro brote.',
    senal: [
      'Bronceado y endurecimiento del brote apical.',
      'Hojas nuevas deformadas, acucharadas hacia abajo y con aspecto acharolado.',
      'Entrenudos acortados: el brote se ve compacto y detenido.',
      'El daño se concentra en el ápice; las hojas ya expandidas quedan sanas.'
    ],
    causa:
      'Poblaciones que explotan con calor y humedad relativa alta. Se dispersa por viento, por herramientas y ' +
      'sobre otros insectos.',
    confusion:
      'Se confunde con fitotoxicidad por herbicida hormonal, que también deforma el brote, y con daño de trips. ' +
      'La pista: la fitotoxicidad afecta parejo a todo el lote y el ácaro va en focos. Y a diferencia del trips, ' +
      'no deja puntos negros de deyección.',
    cuando: 'Épocas cálidas con humedad, especialmente sobre brotación tierna.',
    prods: [
      { p: 'silika', momento: 'Cada 14 días para endurecer el tejido del brote.' },
      { p: 'nematb', momento: 'Como botánico de apoyo en el programa foliar.' },
      { p: 'amino80', momento: 'Para recuperar el brote una vez controlado el foco.' }
    ],
    cultivos: ['arandano', 'palto', 'uva'],
    relacionados: ['trips', 'oidio']
  }
];
