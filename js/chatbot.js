/* ═══════════════════════════════════════════════
   CHATBOT COR HOMES — Rule-based Q&A v2
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── FAQs ──────────────────────────────────────── */
  const FAQ = [
    {
      q: '¿Cómo funciona el proceso?',
      a: 'Te acompañamos en todo el proceso:\n\n1️⃣ Analizamos tu parcela y necesidades.\n2️⃣ Diseñamos tu casa a medida con presupuesto cerrado.\n3️⃣ Coordinamos la obra con supervisión técnica.\n4️⃣ Entregamos llaves y legalización.\n\nTú tomas las decisiones importantes, nosotros gestionamos el resto.'
    },
    {
      q: '¿Cuánto cuesta?',
      a: 'Los precios dependen del modelo, tamaño y acabados. Ofrecemos 3 gamas de presupuesto. Lo mejor es que uses nuestro configurador o solicites un estudio personalizado para recibir una cifra concreta adaptada a tu proyecto. ¡La primera propuesta es gratuita!'
    },
    {
      q: '¿Cuánto tiempo se tarda?',
      a: 'Desde el diseño hasta la entrega de llaves, el proceso completo suele llevar entre 12 y 18 meses, dependiendo de la complejidad del proyecto y permisos municipales.\n\n⏱ La primera propuesta la recibes en solo 48h.'
    },
    {
      q: '¿Necesito experiencia en obras?',
      a: '¡Para nada! Nosotros nos encargamos de toda la parte técnica. Tú solo necesitas tener claro lo que quieres. Te guiamos en cada decisión con información clara y honesta. No necesitas saber de obras, permisos ni materiales.'
    },
    {
      q: '¿Qué incluye la propuesta?',
      a: 'En 48h recibirás:\n\n📋 Análisis de parcela\n🏠 Diseño inicial personalizado\n💰 Presupuesto desglosado\n📆 Plan de pagos por fases\n🏦 Simulación de hipoteca\n👤 Conversación con un técnico'
    },
    {
      q: '¿Necesito tener terreno?',
      a: 'No es necesario. Puedes estar en cualquier situación:\n\n✅ Ya tienes terreno\n✅ Estás buscando uno\n✅ Necesitas ayuda para encontrarlo\n\nEn todos los casos podemos orientarte.'
    },
    {
      q: '¿Hipoteca autopromotor?',
      a: 'La hipoteca autopromotor financia la construcción por fases:\n\n1️⃣ El banco libera dinero según avanza la obra\n2️⃣ Durante la obra pagas solo intereses\n3️⃣ La cuota completa empieza al terminar\n\nTe orientamos sin compromiso.'
    },
    {
      q: '¿En qué zonas trabajáis?',
      a: 'Trabajamos en toda España. Analizamos tu parcela esté donde esté. Si aún no tienes terreno, te ayudamos a buscar y elegir la mejor opción para tu proyecto.'
    },
    {
      q: '¿Qué modelos ofrecéis?',
      a: 'Disponemos de varios modelos: desde 2 habitaciones (72 m²) hasta 5 habitaciones (160 m²), en una o dos plantas. Todos son personalizables. Puedes explorarlos en nuestra sección de Modelos.'
    },
    {
      q: '¿Puedo personalizar?',
      a: '¡Sí! Cada casa se diseña a medida. Tú eliges distribución, acabados, materiales y estilo. No hacemos casas en serie. Creamos hogares coherentes con tu forma de vivir.'
    },
    {
      q: '¿Cómo empiezo?',
      a: 'Muy fácil. Haz clic en "Comenzar" y rellena el formulario. En menos de 3 minutos tendrás tu estudio personalizado en marcha. O escríbenos a hola@corhomes.com o por WhatsApp.'
    },
    {
      q: '¿Qué garantías tengo?',
      a: 'Trabajamos con total transparencia:\n\n🔒 Presupuesto cerrado antes de empezar\n📄 Sin letra pequeña\n👷 Arquitectos y técnicos profesionales\n🤝 Acompañamiento humano real'
    }
  ];

  const WELCOME_MSG = '👋 ¡Hola! Soy el asistente de COR HOMES. Selecciona una pregunta para resolver tus dudas sobre autoconstrucción asistida:';

  /* ── State ──────────────────────────────────────── */
  let isOpen = false;
  let quickCollapsed = false;
  let trigger, windowEl, messagesEl, quickWrapEl, quickToggleEl, quickRepliesEl, typingEl;

  /* ── Init ────────────────────────────────────────── */
  function init() {
    crearDOM();
    bindEvents();
  }

  /* ── Crear DOM ───────────────────────────────────── */
  function crearDOM() {
    trigger = document.createElement('button');
    trigger.className = 'cor-chat-trigger';
    trigger.setAttribute('aria-label', 'Abrir chat');
    trigger.innerHTML = `
      <svg class="cor-chat-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="9" y1="11" x2="15" y2="11"/>
      </svg>
      <svg class="cor-chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;

    windowEl = document.createElement('div');
    windowEl.className = 'cor-chat-window';
    windowEl.innerHTML = `
      <div class="cor-chat-header">
        <div class="cor-chat-header-avatar">🏡</div>
        <div class="cor-chat-header-info">
          <div class="cor-chat-header-name">COR HOMES</div>
          <div class="cor-chat-header-status">
            <span class="cor-chat-header-status-dot"></span>
            En línea
          </div>
        </div>
        <button class="cor-chat-header-close" aria-label="Cerrar chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="cor-chat-messages"></div>
      <div class="cor-chat-typing"><span></span><span></span><span></span></div>
      <div class="cor-chat-quick-wrap">
        <button class="cor-chat-quick-toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          Preguntas frecuentes
        </button>
        <div class="cor-chat-quick-replies"></div>
      </div>
    `;

    messagesEl    = windowEl.querySelector('.cor-chat-messages');
    quickWrapEl   = windowEl.querySelector('.cor-chat-quick-wrap');
    quickToggleEl = windowEl.querySelector('.cor-chat-quick-toggle');
    quickRepliesEl = windowEl.querySelector('.cor-chat-quick-replies');
    typingEl      = windowEl.querySelector('.cor-chat-typing');

    document.body.appendChild(trigger);
    document.body.appendChild(windowEl);
  }

  /* ── Events ──────────────────────────────────────── */
  function bindEvents() {
    trigger.addEventListener('click', function () {
      isOpen ? cerrar() : abrir();
    });

    windowEl.querySelector('.cor-chat-header-close').addEventListener('click', cerrar);

    quickToggleEl.addEventListener('click', function () {
      toggleQuickReplies();
    });
  }

  /* ── Abrir ────────────────────────────────────────── */
  function abrir() {
    isOpen = true;
    trigger.classList.add('open');
    windowEl.classList.add('open');
    trigger.setAttribute('aria-label', 'Cerrar chat');

    if (messagesEl.children.length === 0) {
      mostrarBienvenida();
    }
  }

  /* ── Cerrar ──────────────────────────────────────── */
  function cerrar() {
    isOpen = false;
    trigger.classList.remove('open');
    windowEl.classList.remove('open');
    trigger.setAttribute('aria-label', 'Abrir chat');
  }

  /* ── Mensaje de bienvenida ────────────────────────── */
  function mostrarBienvenida() {
    agregarMensaje(WELCOME_MSG, 'bot');
    renderQuickReplies();
    // Asegurar que al abrir, las opciones estén expandidas
    if (quickCollapsed) toggleQuickReplies();
  }

  /* ── Agregar mensaje ──────────────────────────────── */
  function agregarMensaje(texto, tipo) {
    const div = document.createElement('div');
    div.className = 'cor-chat-msg ' + tipo;
    // Convert saltos de línea a <br>
    div.innerHTML = texto.replace(/\n/g, '<br>');
    messagesEl.appendChild(div);
    scrollAlFinal();
  }

  /* ── Scroll ───────────────────────────────────────── */
  function scrollAlFinal() {
    requestAnimationFrame(function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  /* ── Typing ───────────────────────────────────────── */
  function mostrarTyping(mostrar) {
    typingEl.classList.toggle('show', mostrar);
    if (mostrar) scrollAlFinal();
  }

  /* ── Toggle quick replies ─────────────────────────── */
  function toggleQuickReplies(colapsar) {
    quickCollapsed = colapsar !== undefined ? colapsar : !quickCollapsed;
    quickWrapEl.classList.toggle('collapsed', quickCollapsed);
    quickToggleEl.classList.toggle('collapsed', quickCollapsed);
    quickToggleEl.innerHTML = quickCollapsed
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Mostrar preguntas'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Preguntas frecuentes';
  }

  /* ── Render quick replies ─────────────────────────── */
  function renderQuickReplies() {
    quickRepliesEl.innerHTML = '';
    FAQ.forEach(function (item, index) {
      const btn = document.createElement('button');
      btn.className = 'cor-chat-quick-reply';
      btn.textContent = item.q;
      btn.addEventListener('click', function () {
        responder(index);
      });
      quickRepliesEl.appendChild(btn);
    });
    // Calcular altura y aplicar
    requestAnimationFrame(function () {
      quickWrapEl.style.maxHeight = quickWrapEl.scrollHeight + 'px';
    });
  }

  /* ── Responder ─────────────────────────────────────── */
  function responder(index) {
    const item = FAQ[index];
    if (!item) return;

    // Mostrar pregunta del usuario
    agregarMensaje(item.q, 'user');

    // Colapsar opciones automáticamente para que se vea la respuesta
    toggleQuickReplies(true);

    // Mostrar typing
    mostrarTyping(true);

    // Tiempo de "escritura" variable según longitud
    const delay = 400 + Math.min(item.a.length * 8, 1200);

    setTimeout(function () {
      mostrarTyping(false);
      agregarMensaje(item.a, 'bot');
      scrollAlFinal();
      // Las opciones se quedan colapsadas para que se vea bien la respuesta
      // El usuario puede expandirlas con el botón "Mostrar preguntas"
    }, delay);
  }

  /* ── Arranque ──────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
