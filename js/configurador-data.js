/**
 * COR.HOMES Configurador — Capa de datos
 * Refactor UX/UI premium · Mobile-first
 */
const CONFIGURADOR = {

  pasos: [
    { id: 'modelo',    label: 'Modelo',              icon: '01' },
    { id: 'exterior',  label: 'Exterior',            icon: '02' },
    { id: 'cocina',    label: 'Cocina',              icon: '03' },
    { id: 'banos',     label: 'Baños',               icon: '04' },
    { id: 'lugar',     label: 'El lugar',            icon: '05' },
    { id: 'inversion', label: 'Inversión',           icon: '06' },
    { id: 'estudio',   label: 'Recibir estudio',     icon: '07' },
  ],

  /* ── Modelos ─────────────────────────────────────────── */
  modelo: {
    titulo: 'Elige el modelo que mejor encaja con tu forma de vivir.',
    editorial: 'La base de vuestro hogar.',
    opciones: [
      { id: '2H1P', nombre: 'Esencial 2H',  m2: 85,  habitaciones: 2, plantas: 1, render: '2H1P_files/24012_2_2_1_PAN.png',  miniatura: '2H1P_files/MIN_24012_2_2_1_PAN.png',  descripcion: 'Dos habitaciones, una planta. La esencia de lo esencial.' },
      { id: '3H1P', nombre: 'Armonía 3H',   m2: 102, habitaciones: 3, plantas: 1, render: '3H1P_files/24023_3_2_1_PAN.png',  miniatura: '3H1P_files/MIN_24023_3_2_1_PAN.png',  descripcion: 'Tres habitaciones en una sola planta. Fluidez y amplitud.' },
      { id: '3H2P', nombre: 'Vertical 3H',   m2: 115, habitaciones: 3, plantas: 2, render: '3H2P_files/25007_3_2_2_LIN.png',  miniatura: '3H2P_files/MIN_25007_3_2_2_LIN.png',  descripcion: 'Tres habitaciones en dos plantas. Verticalidad con sentido.' },
      { id: '4H2P', nombre: 'Familia 4H',    m2: 132, habitaciones: 4, plantas: 2, render: '4H2P_files/250032_4_3_2_LIN.png', miniatura: '4H2P_files/MIN_250032_4_3_2_LIN.png', descripcion: 'Cuatro habitaciones. Espacio para crecer.' },
      { id: '5H2P', nombre: 'Horizonte 5H',  m2: 155, habitaciones: 5, plantas: 2, render: '5H2P_files/24014_5_2_2_PAN.png',  miniatura: '5H2P_files/MIN_24014_5_2_2_PAN.png',  descripcion: 'Cinco habitaciones. El máximo espacio con corazón.' },
    ],
  },

  /* ── Exterior ────────────────────────────────────────── */
  exterior: {
    titulo: 'Elige el carácter exterior de tu casa.',
    editorial: 'El carácter exterior de vuestro hogar.',
    opciones: [
      { id: 'brisa-natural', nombre: 'Brisa Natural',  imagen: 'EXTERIOR_files/cor-brisa-natural.png',        descripcion: 'Mediterráneo cálido y luminoso.' },
      { id: 'botanica',      nombre: 'Botánica',        imagen: 'EXTERIOR_files/cor-green-biofilico.png',      descripcion: 'Naturaleza, textura y conexión.' },
      { id: 'minimal',       nombre: 'Minimal',         imagen: 'EXTERIOR_files/cor-minimalismo-racional.png', descripcion: 'Líneas limpias y calma contemporánea.' },
    ],
  },

  /* ── Cocina ──────────────────────────────────────────── */
  cocina: {
    titulo: 'Elige el alma de tu cocina.',
    editorial: 'El corazón donde sucede la vida.',
    opciones: [
      { id: 'serena',        nombre: 'Serena',         imagen: 'COCINA_files/cor-cocina-serena.png',         descripcion: 'Calma mediterránea y elegancia atemporal.' },
      { id: 'botanica',      nombre: 'Botánica',       imagen: 'COCINA_files/cor-cocina-natural.png',        descripcion: 'Inspirada en la naturaleza y el bienestar cotidiano.' },
      { id: 'contemporanea', nombre: 'Contemporánea',  imagen: 'COCINA_files/cor-cocina-contemporanea.png',  descripcion: 'Diseño limpio y sofisticación contemporánea.' },
    ],
  },

  /* ── Baños ───────────────────────────────────────────── */
  banos: {
    titulo: 'Elige el ambiente de tu baño.',
    editorial: 'Espacios diseñados para el bienestar.',
    opciones: [
      { id: 'serena',   nombre: 'Serena',   imagen: 'BAÑOS_files/cor-bano-serena.png',   descripcion: 'Un baño pensado para bajar el ritmo.' },
      { id: 'botanica', nombre: 'Botánica', imagen: 'BAÑOS_files/cor-bano-botanica.png', descripcion: 'Inspirado en la calma imperfecta de la naturaleza.' },
      { id: 'calido',   nombre: 'Cálido',   imagen: 'BAÑOS_files/cor-bano-calido.png',   descripcion: 'La sensación de hotel boutique llevada a casa.' },
    ],
  },

  /* ── El lugar ────────────────────────────────────────── */
  lugar: {
    titulo: '¿Dónde imagináis vuestro hogar?',
    editorial: 'Cada hogar comienza encontrando su lugar.',
    opciones: [
      { id: 'tengo-terreno',    label: 'Ya tenemos terreno' },
      { id: 'buscando',         label: 'Estamos buscando' },
      { id: 'necesito-ayuda',   label: 'Queremos ayuda para encontrarlo' },
      { id: 'ver-disponibles',  label: 'Queremos ver terrenos disponibles' },
    ],
  },

  /* ── Inversión ───────────────────────────────────────── */
  inversion: {
    titulo: '¿En qué rango os gustaría mover el proyecto?',
    subtitulo: 'Incluyendo vivienda, terreno y exterior de forma orientativa.',
    editorial: 'Cada proyecto tiene su dimensión.',
    opciones: [
      { id: '250-400',          label: '250k – 400k',         texto: 'Una forma inteligente de empezar.' },
      { id: '400-550',          label: '400k – 550k',         texto: 'Equilibrio entre diseño, confort y amplitud.' },
      { id: '550-750',          label: '550k – 750k',         texto: 'Mayor personalización y presencia arquitectónica.' },
      { id: '750-plus',         label: '+750k',               texto: 'Un proyecto altamente personalizado.' },
      { id: 'comentar-despues', label: 'Prefiero comentarlo más adelante', texto: 'Podremos orientaros personalmente.' },
    ],
  },

  /* ── Estudio personalizado ───────────────────────────── */
  estudio: {
    titulo: 'Recibe un estudio personalizado de tu proyecto',
    subtitulo: 'Revisaremos vuestra selección y prepararemos una propuesta orientativa adaptada a vuestra forma de vivir, parcela e inversión prevista.',
    campos: [
      { id: 'nombre',      label: 'Nombre',     type: 'text' },
      { id: 'email',       label: 'Email',      type: 'email' },
      { id: 'whatsapp',    label: 'WhatsApp',   type: 'tel' },
      { id: 'comentarios', label: 'Comentarios', type: 'textarea' },
    ],
  },

  /* ── Labels ──────────────────────────────────────────── */
  labels: {
    modelo:    'Modelo',
    exterior:  'Exterior',
    cocina:    'Cocina',
    banos:     'Baños',
    lugar:     'Terreno',
    inversion: 'Inversión',
    ubicacion: 'Ubicación deseada',
    nombre:    'Nombre',
    email:     'Email',
    whatsapp:  'WhatsApp',
    comentarios:'Comentarios',
  },

  storageKey: 'corHomesProject',

  /* ── WhatsApp message builder ────────────────────────── */
  buildWhatsAppMessage(proyecto) {
    const nom = proyecto.nombre
      ? proyecto.nombre
      : (proyecto.nombre || '');
    const saludo = nom ? `Hola, soy ${nom}.` : 'Hola,';

    const lineas = [];

    lineas.push(saludo);
    lineas.push('');
    lineas.push('Me gustaría recibir mi estudio personalizado COR HOMES.');
    lineas.push('');
    lineas.push('*Resumen de mi proyecto:*');

    /* ── Solo campos reales del configurador ── */
    if (proyecto.modelo) {
      const m = CONFIGURADOR.getModeloById(proyecto.modelo);
      lineas.push(`· Modelo: ${m ? m.nombre : proyecto.modelo}${m ? ` (${m.m2} m², ${m.habitaciones} hab, ${m.plantas} planta${m.plantas > 1 ? 's' : ''})` : ''}`);
    }
    if (proyecto.exterior) {
      const e = CONFIGURADOR.getExteriorById(proyecto.exterior);
      lineas.push(`· Exterior: ${e ? e.nombre : proyecto.exterior}`);
    }
    if (proyecto.cocina) {
      const c = CONFIGURADOR.getCocinaById(proyecto.cocina);
      lineas.push(`· Cocina: ${c ? c.nombre : proyecto.cocina}`);
    }
    if (proyecto.banos) {
      const b = CONFIGURADOR.getBanosById(proyecto.banos);
      lineas.push(`· Baños: ${b ? b.nombre : proyecto.banos}`);
    }
    if (proyecto.budgetRange) {
      const inv = CONFIGURADOR.inversion.opciones.find(o => o.id === proyecto.budgetRange);
      lineas.push(`· Inversión: ${inv ? inv.label : proyecto.budgetRange}`);
    }

    /* ── Terreno (lógica especial) ── */
    lineas.push('');
    lineas.push('*Terreno:*');
    const tieneTerreno = proyecto.lugar === 'tengo-terreno';
    if (tieneTerreno) {
      const detalles = [];
      if (proyecto.terrenoUbicacion && proyecto.terrenoUbicacion.trim()) {
        detalles.push(`Ubicación: ${proyecto.terrenoUbicacion.trim()}`);
      }
      if (proyecto.terrenoDetalles && proyecto.terrenoDetalles.trim()) {
        detalles.push(`Detalles: ${proyecto.terrenoDetalles.trim()}`);
      }
      if (detalles.length > 0) {
        lineas.push(`Sí, tengo terreno.`);
        detalles.forEach(d => lineas.push(d));
      } else {
        lineas.push('Sí, pero no ha compartido detalles.');
      }
    } else {
      const l = CONFIGURADOR.getLugarById(proyecto.lugar);
      lineas.push(l ? l.label : (proyecto.lugar || 'No especificado'));
    }

    /* ── Ubicación deseada ── */
    if (proyecto.ubicacion && proyecto.ubicacion.trim()) {
      lineas.push(`· Ubicación deseada: ${proyecto.ubicacion.trim()}`);
    }

    /* ── Datos de contacto ── */
    lineas.push('');
    lineas.push('*Datos de contacto:*');
    if (proyecto.email)    lineas.push(`· Email: ${proyecto.email}`);
    if (proyecto.whatsapp) lineas.push(`· WhatsApp: ${proyecto.whatsapp}`);
    if (proyecto.comentarios && proyecto.comentarios.trim()) {
      lineas.push('');
      lineas.push(`*Comentarios:* ${proyecto.comentarios.trim()}`);
    }

    return encodeURIComponent(lineas.join('\n'));
  },

  /* ── Getters ─────────────────────────────────────────── */
  getModeloById(id)   { return CONFIGURADOR.modelo.opciones.find(o => o.id === id) || null; },
  getExteriorById(id) { return CONFIGURADOR.exterior.opciones.find(o => o.id === id) || null; },
  getCocinaById(id)   { return CONFIGURADOR.cocina.opciones.find(o => o.id === id) || null; },
  getBanosById(id)    { return CONFIGURADOR.banos.opciones.find(o => o.id === id) || null; },
  getLugarById(id)    { return CONFIGURADOR.lugar.opciones.find(o => o.id === id) || null; },
};