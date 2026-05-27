/* ═══════════════════════════════════════════════
   CHATBOT COR HOMES — Rule-based Q&A
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── FAQs (preguntas + respuestas) ──────────────────── */
  const FAQ = [
    {
      q: '¿Cómo funciona el proceso de autoconstrucción asistida?',
      a: 'Te acompañamos en todo el proceso: 1️⃣ Analizamos tu parcela y necesidades. 2️⃣ Diseñamos tu casa a medida con presupuesto cerrado. 3️⃣ Coordinamos la obra con supervisión técnica. 4️⃣ Entregamos llaves y legalización. Tú tomas las decisiones importantes, nosotros gestionamos el resto.'
    },
    {
      q: '¿Cuánto cuesta?',
      a: 'Los precios dependen del modelo, tamaño y acabados. Ofrecemos 3 gamas de presupuesto que se ajustan a diferentes necesidades. Lo mejor es que uses nuestro configurador o solicites un estudio personalizado gratuito para recibir una cifra concreta adaptada a tu proyecto.'
    },
    {
      q: '¿Cuánto tiempo se tarda?',
      a: 'Desde que empezamos el diseño hasta la entrega de llaves, el proceso completo suele llevar entre 12 y 18 meses, dependiendo de la complejidad del proyecto, permisos municipales y condiciones climáticas. La primera propuesta la recibes en solo 48h ⚡'
    },
    {
      q: '¿Necesito experiencia en construcción?',
      a: '¡Para nada! Nosotros nos encargamos de toda la parte técnica. Tú solo necesitas tener claro lo que quieres. Te guiamos en cada decisión con información clara y honesta. No necesitas saber de obras, permisos, ni materiales.'
    },
    {
      q: '¿Qué incluye la propuesta de 48 horas?',
      a: 'Recibirás un documento completo con: 📋 Análisis de parcela, 🏠 Diseño inicial personalizado, 💶 Presupuesto desglosado por partidas, 📆 Plan de pagos por fases, 🏦 Simulación de hipoteca autopromotor. Y además, una conversación con un técnico para resolver todas tus dudas.'
    },
    {
      q: '¿Necesito tener terreno?',
      a: 'No es necesario. Puedes estar en cualquier situación: ✅ Ya tienes terreno, ✅ Estás buscando uno, ✅ Necesitas ayuda para encontrarlo. En todos los casos podemos orientarte y ayudarte a encontrar la mejor opción.'
    },
    {
      q: '¿Cómo funciona la hipoteca autopromotor?',
      a: 'La hipoteca autopromotor te permite financiar la construcción por fases: 1️⃣ El banco libera dinero según avanza la obra. 2️⃣ Durante la construcción pagas solo intereses. 3️⃣ La cuota completa empieza cuando la casa está terminada. Te orientamos sin compromiso sobre cómo funciona y qué documentación necesitas.'
    },
    {
      q: '¿En qué zonas trabajáis?',
      a: 'Trabajamos en toda España. Analizamos tu parcela esté donde esté. Si aún no tienes terreno, te ayudamos a entender qué tipo de parcela necesitas y qué buscar en tu zona.'
    },
    {
      q: '¿Qué modelos de casas ofrecéis?',
      a: 'Disponemos de varios modelos: desde 2 habitaciones (72 m²) hasta 5 habitaciones (160 m²), en una o dos plantas. Todos son personalizables. Puedes explorarlos en nuestra sección de Modelos o usar el configurador para diseñar tu casa ideal.'
    },
    {
      q: '¿Puedo personalizar el diseño?',
      a: '¡Sí! Cada casa se diseña a medida. Tú eliges la distribución, los acabados, los materiales y el estilo. No hacemos casas en serie. Creamos hogares coherentes con tu forma de vivir.'
    },
    {
      q: '¿Cómo empiezo?',
      a: 'Es muy fácil. Solo tienes que hacer clic en "Comenzar" y rellenar el formulario con tus datos. En menos de 3 minutos tendrás tu estudio personalizado en marcha. O si lo prefieres, escríbenos directamente por WhatsApp o a hola@corhomes.com'
    },
    {
      q: '¿Qué garantías tengo?',
      a: 'Trabajamos con total transparencia. Cada cifra, plazo y decisión se explica sin letra pequeña. Además, el presupuesto se cierra antes de empezar la obra, sin sorpresas. Coordinamos arquitectos y técnicos profesionales para garantizar la calidad del proyecto.'
    }
  ];

  /* ── Mensaje de bienvenida ──────────────────────────── */
  const WELCOME_MSG = '👋 ¡Hola! Soy el asistente de COR HOMES. Estoy aquí para resolver tus dudas sobre autoconstrucción asistida. ¿En qué puedo ayudarte?';

  /* ── Estado ─────────────────────────────────────────── */
  let isOpen = false;

  /* ── DOM ────────────────────────────────────────────── */
  let trigger, windowEl, messagesEl, quickRepliesEl, typingEl;

  /* ── Inicializar ────────────────────────────────────── */
  function init() {
    crearDOM();
    bindEvents();
  }

  /* ── Crear estructura DOM ──────────────────────────── */
  function crearDOM() {
    // Trigger
    trigger = document.createElement('button');
    trigger.className = 'cor-chat-trigger';
    trigger.setAttribute('aria-label', 'Abrir chat');
    trigger.innerHTML = `
      <svg class="cor-chat-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="cor-chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;

    // Window
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
      <div class="cor-chat-quick-replies"></div>
    `;

    messagesEl = windowEl.querySelector('.cor-chat-messages');
    quickRepliesEl = windowEl.querySelector('.cor-chat-quick-replies');
    typingEl = windowEl.querySelector('.cor-chat-typing');

    document.body.appendChild(trigger);
    document.body.appendChild(windowEl);
  }

  /* ── Eventos ────────────────────────────────────────── */
  function bindEvents() {
    // Abrir/cerrar con trigger
    trigger.addEventListener('click', function () {
      if (isOpen) cerrar();
      else abrir();
    });

    // Cerrar con botón X del header
    windowEl.querySelector('.cor-chat-header-close').addEventListener('click', cerrar);
  }

  /* ── Abrir ──────────────────────────────────────────── */
  function abrir() {
    isOpen = true;
    trigger.classList.add('open');
    windowEl.classList.add('open');
    trigger.setAttribute('aria-label', 'Cerrar chat');

    if (messagesEl.children.length === 0) {
      mostrarMensajeBienvenida();
    }
  }

  /* ── Cerrar ─────────────────────────────────────────── */
  function cerrar() {
    isOpen = false;
    trigger.classList.remove('open');
    windowEl.classList.remove('open');
    trigger.setAttribute('aria-label', 'Abrir chat');
  }

  /* ── Mensaje de bienvenida ──────────────────────────── */
  function mostrarMensajeBienvenida() {
    agregarMensaje(WELCOME_MSG, 'bot');
    mostrarOpcionesRapidas();
  }

  /* ── Agregar mensaje al chat ────────────────────────── */
  function agregarMensaje(texto, tipo) {
    const div = document.createElement('div');
    div.className = 'cor-chat-msg ' + tipo;
    div.textContent = texto;
    messagesEl.appendChild(div);
    scrollAlFinal();
    return div;
  }

  /* ── Scroll al final ─────────────────────────────────── */
  function scrollAlFinal() {
    requestAnimationFrame(function () {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  /* ── Mostrar / ocultar typing ───────────────────────── */
  function mostrarTyping(mostrar) {
    typingEl.classList.toggle('show', mostrar);
    if (mostrar) scrollAlFinal();
  }

  /* ── Mostrar opciones rápidas ───────────────────────── */
  function mostrarOpcionesRapidas() {
    quickRepliesEl.innerHTML = '';
    FAQ.forEach(function (item, index) {
      const btn = document.createElement('button');
      btn.className = 'cor-chat-quick-reply';
      btn.textContent = item.q;
      btn.addEventListener('click', function () {
        responderPregunta(index);
      });
      quickRepliesEl.appendChild(btn);
    });
  }

  /* ── Responder una pregunta ─────────────────────────── */
  function responderPregunta(index) {
    const item = FAQ[index];
    if (!item) return;

    // Mostrar pregunta del usuario
    agregarMensaje(item.q, 'user');

    // Ocultar las opciones rápidas mientras "escribe"
    quickRepliesEl.innerHTML = '';

    // Simular escritura
    mostrarTyping(true);
    setTimeout(function () {
      mostrarTyping(false);
      agregarMensaje(item.a, 'bot');
      // Volver a mostrar opciones
      mostrarOpcionesRapidas();
    }, 600 + Math.random() * 600);
  }

  /* ── Arrancar cuando el DOM esté listo ──────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
