/* ═══════════════════════════════════════════════
   CHATBOT COR HOMES — Rule-based Q&A v3
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  const FAQ = [
    {
      q: '¿Cómo funciona el proceso?',
      a: 'Te acompañamos en todo el proceso:<br><br>1️⃣ Analizamos tu parcela y necesidades.<br>2️⃣ Diseñamos tu casa a medida con presupuesto cerrado.<br>3️⃣ Coordinamos la obra con supervisión técnica.<br>4️⃣ Entregamos llaves y legalización.<br><br>Tú tomas las decisiones importantes, nosotros gestionamos el resto.'
    },
    {
      q: '¿Cuánto cuesta?',
      a: 'Los precios dependen del modelo, tamaño y acabados. Ofrecemos 3 gamas de presupuesto. Lo mejor es que uses nuestro configurador o solicites un estudio personalizado para recibir una cifra concreta adaptada a tu proyecto. ¡La primera propuesta es gratuita!'
    },
    {
      q: '¿Cuánto tiempo se tarda?',
      a: 'Desde el diseño hasta la entrega de llaves, el proceso completo suele llevar entre 12 y 18 meses.<br><br>⏱ La primera propuesta la recibes en solo <b>48h</b>.'
    },
    {
      q: '¿Necesito experiencia en obras?',
      a: '¡Para nada! Nosotros nos encargamos de toda la parte técnica. Tú solo necesitas tener claro lo que quieres. Te guiamos en cada decisión.'
    },
    {
      q: '¿Qué incluye la propuesta?',
      a: 'En 48h recibirás:<br><br>📋 Análisis de parcela<br>🏠 Diseño inicial personalizado<br>💰 Presupuesto desglosado<br>📆 Plan de pagos por fases<br>🏦 Simulación de hipoteca<br>👤 Conversación con un técnico'
    },
    {
      q: '¿Necesito tener terreno?',
      a: 'No es necesario. Puedes estar en cualquier situación:<br><br>✅ Ya tienes terreno<br>✅ Estás buscando uno<br>✅ Necesitas ayuda para encontrarlo<br><br>En todos los casos podemos orientarte.'
    },
    {
      q: '¿Hipoteca autopromotor?',
      a: 'La hipoteca autopromotor financia por fases:<br><br>1️⃣ El banco libera dinero según avanza la obra<br>2️⃣ Durante la obra pagas solo intereses<br>3️⃣ La cuota completa empieza al terminar<br><br>Te orientamos sin compromiso.'
    },
    {
      q: '¿En qué zonas trabajáis?',
      a: 'Trabajamos en toda España. Analizamos tu parcela esté donde esté. Si aún no tienes terreno, te ayudamos a buscar la mejor opción.'
    },
    {
      q: '¿Qué modelos ofrecéis?',
      a: 'Desde 2 habitaciones (72 m²) hasta 5 habitaciones (160 m²), en una o dos plantas. Todos personalizables. Explora nuestros modelos en cor.homes.'
    },
    {
      q: '¿Puedo personalizar?',
      a: '¡Sí! Cada casa se diseña a medida. Tú eliges distribución, acabados, materiales y estilo. No hacemos casas en serie.'
    },
    {
      q: '¿Cómo empiezo?',
      a: 'Haz clic en "Comenzar" y rellena el formulario. En 3 minutos tu estudio está en marcha. También por WhatsApp o hola@corhomes.com'
    },
    {
      q: '¿Qué garantías tengo?',
      a: '🔒 Presupuesto cerrado antes de empezar<br>📄 Sin letra pequeña<br>👷 Arquitectos profesionales<br>🤝 Acompañamiento humano real'
    }
  ];

  const WELCOME_MSG = '👋 ¡Hola! Soy <b>Corito</b>, el asistente de COR HOMES. Selecciona una pregunta:';

  let isOpen = false;
  let trigger, win, msgs, qWrap, qToggle, qReplies, typing;

  function init() {
    crearDOM();
    bindEvents();
  }

  function crearDOM() {
    // ── Trigger ──
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

    // ── Window ──
    win = document.createElement('div');
    win.className = 'cor-chat-window';
    win.innerHTML = `
      <div class="cor-chat-header">
        <img class="cor-chat-header-avatar" src="assets/images/isotipo-cor-homes-sin-fondo.png" alt="COR HOMES">
        <div class="cor-chat-header-info">
          <div class="cor-chat-header-name">Corito 💬</div>
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

    msgs    = win.querySelector('.cor-chat-messages');
    qWrap   = win.querySelector('.cor-chat-quick-wrap');
    qToggle = win.querySelector('.cor-chat-quick-toggle');
    qReplies = win.querySelector('.cor-chat-quick-replies');
    typing  = win.querySelector('.cor-chat-typing');

    document.body.appendChild(trigger);
    document.body.appendChild(win);
  }

  function bindEvents() {
    trigger.addEventListener('click', function () {
      isOpen ? cerrar() : abrir();
    });
    win.querySelector('.cor-chat-header-close').addEventListener('click', cerrar);
    qToggle.addEventListener('click', toggleQuick);
  }

  function abrir() {
    isOpen = true;
    trigger.classList.add('open');
    win.classList.add('open');
    trigger.setAttribute('aria-label', 'Cerrar chat');
    if (msgs.children.length === 0) {
      agregar(WELCOME_MSG, 'bot');
      renderQuick();
      expandirQuick();
    }
  }

  function cerrar() {
    isOpen = false;
    trigger.classList.remove('open');
    win.classList.remove('open');
    trigger.setAttribute('aria-label', 'Abrir chat');
  }

  function agregar(html, tipo) {
    const div = document.createElement('div');
    div.className = 'cor-chat-msg ' + tipo;
    div.innerHTML = html;
    msgs.appendChild(div);
    scrollFin();
  }

  function scrollFin() {
    requestAnimationFrame(function () { msgs.scrollTop = msgs.scrollHeight; });
  }

  function mostrarTyping(si) {
    typing.classList.toggle('show', si);
    if (si) scrollFin();
  }

  // ── Quick replies toggle ──
  function toggleQuick() {
    qWrap.classList.toggle('collapsed');
    actualizarToggle();
  }

  function expandirQuick() {
    qWrap.classList.remove('collapsed');
    actualizarToggle();
  }

  function colapsarQuick() {
    qWrap.classList.add('collapsed');
    actualizarToggle();
  }

  function actualizarToggle() {
    const colapsado = qWrap.classList.contains('collapsed');
    qToggle.innerHTML = colapsado
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Mostrar preguntas'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Preguntas frecuentes';
  }

  // ── Render botones ──
  function renderQuick() {
    qReplies.innerHTML = '';
    FAQ.forEach(function (item, i) {
      const btn = document.createElement('button');
      btn.className = 'cor-chat-quick-reply';
      btn.textContent = item.q;
      btn.addEventListener('click', function () { responder(i); });
      qReplies.appendChild(btn);
    });
  }

  // ── Botón volver ──
  function botonVolver() {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'align-self:flex-start;margin-top:4px;animation:corMsgIn 0.35s ease';
    const btn = document.createElement('button');
    btn.textContent = '← Más preguntas';
    btn.style.cssText = 'background:none;border:none;color:#3F5F4A;font-size:12px;cursor:pointer;font-family:inherit;padding:6px 12px;border-radius:8px;transition:all 0.2s;font-weight:500;';
    btn.onmouseenter = function () { btn.style.background = 'rgba(63,95,74,0.08)'; };
    btn.onmouseleave = function () { btn.style.background = 'none'; };
    btn.onclick = function () {
      expandirQuick();
      qWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    wrap.appendChild(btn);
    msgs.appendChild(wrap);
  }

  // ── Responder ──
  function responder(i) {
    const item = FAQ[i];
    if (!item) return;

    agregar(item.q, 'user');
    colapsarQuick();
    mostrarTyping(true);

    const delay = 400 + Math.min(item.a.length * 6, 1000);

    setTimeout(function () {
      mostrarTyping(false);
      agregar(item.a, 'bot');
      botonVolver();
      scrollFin();
      expandirQuick();
    }, delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
