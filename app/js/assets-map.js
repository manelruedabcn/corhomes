/**
 * COR.HOMES — Assets Map
 * Single source of truth for every image used across the configurator.
 *
 * RULES:
 * - Pantalla MODELO     → solo ASSETS.modelos
 * - Pantalla EXTERIOR   → solo ASSETS.exterior
 * - Pantalla COCINA     → solo ASSETS.cocina
 * - Pantalla BAÑOS      → solo ASSETS.banos
 * - Pantalla CALIDADES  → solo ASSETS.calidades
 *
 * Never mix directories. Never hardcode paths.
 * Always reference ASSETS.<section>.<key>.
 */
const ASSETS = {

  /* ──────────────────────────────────────────────────────────
     MODELOS
     Renders arquitectónicos + miniaturas para cada tipología
     ────────────────────────────────────────────────────────── */
  modelos: {
    '2H1P': {
      name: 'Modelo 2H1P',
      m2: 85,
      habitaciones: 2,
      plantas: 1,
      dir: 'configurador/2H1P_files/',
      render: '24012_2_2_1_PAN.png',
      thumbs: [
        'MIN_24012_2_2_1_PAN.png',
        'MIN_25002_2_2_1_ELE.png',
      ],
    },
    '3H1P': {
      name: 'Modelo 3H1P',
      m2: 102,
      habitaciones: 3,
      plantas: 1,
      dir: 'configurador/3H1P_files/',
      render: '24023_3_2_1_PAN.png',
      thumbs: [
        'MIN_24023_3_2_1_PAN.png',
        'MIN_25018_3_2_1_LIN.png',
      ],
    },
    '3H2P': {
      name: 'Modelo 3H2P',
      m2: 115,
      habitaciones: 3,
      plantas: 2,
      dir: 'configurador/3H2P_files/',
      render: '25007_3_2_2_LIN.png',
      thumbs: [
        'MIN_25007_3_2_2_LIN.png',
        'MIN_25008_3_2_2_LIN.png',
        'MIN_25010_3_2_2_LIN.png',
      ],
    },
    '4H2P': {
      name: 'Modelo 4H2P',
      m2: 132,
      habitaciones: 4,
      plantas: 2,
      dir: 'configurador/4H2P_files/',
      render: '250032_4_3_2_LIN.png',
      thumbs: [
        'MIN_250032_4_3_2_LIN.png',
        'MIN_250033_4_3_2_LIN.png',
        'MIN_250061_4_2_2_PAN.png',
        'MIN_250062_4_2_2_PAN.png',
      ],
    },
    '5H2P': {
      name: 'Modelo 5H2P',
      m2: 155,
      habitaciones: 5,
      plantas: 2,
      dir: 'configurador/5H2P_files/',
      render: '24014_5_2_2_PAN.png',
      thumbs: [
        'MIN_24014_5_2_2_PAN.png',
      ],
    },
  },

  /* ──────────────────────────────────────────────────────────
     EXTERIOR
     Render principal + texturas de materiales para fachada
     ────────────────────────────────────────────────────────── */
  exterior: {
    dir: 'configurador/EXTERIOR_files/',
    render: 'template.png',
    estilos: {
      'brisa-natural': {
        name: 'Brisa Natural',
        meta: 'Cálido',
        stats: 'Cálido · Mediterráneo · Piedra clara',
        thumb: 'granito BEIGE.jpg',
      },
      'green-biofilico': {
        name: 'Green Biofílico',
        meta: 'Sostenible',
        stats: 'Vegetación · Madera · Conexión viva',
        thumb: '4f54f60a00866ec1fd86abb1e54b9cb9.jpg',
      },
      'moderno-industrial': {
        name: 'Moderno Industrial',
        meta: 'Contemporáneo',
        stats: 'Líneas oscuras · Hormigón suave · Contemporáneo',
        thumb: 'a7f37a624c2b1d6dcb99434c1ad0a2a1.jpg',
      },
      'minimalismo-racional': {
        name: 'Minimalismo Racional',
        meta: 'Esencial',
        stats: 'Blanco limpio · Esencial · Silencioso',
        thumb: '5412db4ad141a3748ce01835b7a46d91.jpg',
      },
    },
    materiales: {
      'granito-beige': 'granito BEIGE.jpg',
      'granito-gris': 'granito GRIS.jpg',
      botega: 'botega.png',
      'bottega-gris': 'bottega-gris.png',
      butan: 'BUTAN.png',
      '5221b7c49': '5221b7c49f40e28ae91b1d79f1d81675.jpg',
      '652fe73db6': '652fe73db65a319e715c3dac9d406762.jpg',
      d400414db7: 'd400414db74fe84e3e4f0a2ca4ce491c.jpg',
      df514c52cb: 'df514c52cb2de4ac7c288d1f09de5522.jpg',
    },
  },

  /* ──────────────────────────────────────────────────────────
     COCINA
     Imágenes de cocinas y acabados
     ────────────────────────────────────────────────────────── */
  cocina: {
    dir: 'configurador/COCINA_files/',
    /* Pendiente: añadir imágenes cuando estén disponibles */
    opciones: {},
  },

  /* ──────────────────────────────────────────────────────────
     BAÑOS
     Imágenes de baños y acabados
     ────────────────────────────────────────────────────────── */
  banos: {
    dir: 'configurador/BAÑOS_files/',
    /* Pendiente: añadir imágenes cuando estén disponibles */
    opciones: {},
  },

  /* ──────────────────────────────────────────────────────────
     CALIDADES
     Imágenes de acabados generales
     ────────────────────────────────────────────────────────── */
  calidades: {
    dir: 'configurador/CALIDADES_files/',
    /* Pendiente: añadir imágenes cuando estén disponibles */
    opciones: {},
  },

};

/**
 * Helper: build full path to an asset.
 * @param {Object} section - One of ASSETS.modelos, ASSETS.exterior, etc.
 * @param {string} filename - File name without directory prefix
 * @returns {string} Full relative path from project root (COR HOMES/)
 */
function assetPath(section, filename) {
  return (section.dir || '') + filename;
}