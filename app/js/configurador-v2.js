/**
 * COR.HOMES Configurador v2 — Motor de interacción
 * Mobile-first · Editorial premium · 7 pasos
 */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════
     DOM References
     ════════════════════════════════════════════════════════ */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    app:             $('#app'),
    sidebar:         $('#sidebar'),
    sidebarSteps:    $('#sidebarSteps'),
    headerMobile:    $('#headerMobile'),
    progressFill:    $('#progressFill'),
    stepIndicator:   $('#stepIndicator'),
    visualZone:      $('#visualZone'),
    editorialEl:     $('#editorialEl'),
    infoBar:         $('#infoBar'),
    infoName:        $('#infoName'),
    infoStats:       $('#infoStats'),
    selectorSection: $('#selectorSection'),
    selectorZone:    $('#selectorZone'),
    navFooter:       $('#navFooter'),
    btnPrev:         $('#btnPrev'),
    btnNext:         $('#btnNext'),
    btnWhatsapp:     $('#btnWhatsapp'),
    resumenToggle:   $('#resumenToggle'),
    resumenCount:    $('#resumenCount'),
    resumenDrawer:   $('#resumenDrawer'),
    resumenBackdrop: $('#resumenBackdrop'),
    resumenLista:    $('#resumenLista'),
    resumenPanel:    $('#resumenPanel'),
    resumenPanelLista:$('#resumenPanelLista'),
    btnWhatsappDrawer:$('#btnWhatsappDrawer'),
    toast:           $('#toast'),
  };

  /* ════════════════════════════════════════════════════════
     State
     ════════════════════════════════════════════════════════ */
  let pasoActual = 'modelo';
  let proyecto = {};
  let filtroModelo = { plantas: null, habitaciones: null };

  /* ════════════════════════════════════════════════════════
     Init
     ════════════════════════════════════════════════════════ */
  function init() {
    cargarProyecto();
    construirSidebar();
    bindEvents();
    navegarA('modelo', false);
    actualizarResumen();
    actualizarProgress();
  }

  /* ════════════════════════════════════════════════════════
     LocalStorage
     ════════════════════════════════════════════════════════ */
  function cargarProyecto() {
    try {
      const raw = localStorage.getItem(CONFIGURADOR.storageKey);
      proyecto = raw ? JSON.parse(raw) : {};
    } catch (e) { proyecto = {}; }
  }

  function guardarProyecto() {
    localStorage.setItem(CONFIGURADOR.storageKey, JSON.stringify(proyecto));
  }

  /* ════════════════════════════════════════════════════════
     Sidebar (desktop)
     ════════════════════════════════════════════════════════ */
  function construirSidebar() {
    dom.sidebarSteps.innerHTML = CONFIGURADOR.pasos.map((paso, i) => `
      <button class="sidebar-step" data-paso="${paso.id}">
        <span class="sidebar-step-icon">${paso.icon}</span>
        <span>${paso.label}</span>
        <span class="sidebar-step-check">&#10003;</span>
      </button>
    `).join('');

    dom.sidebarSteps.querySelectorAll('.sidebar-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.dataset.paso;
        if (puedeNavegarA(pid)) navegarA(pid);
      });
    });
  }

  function puedeNavegarA(pasoId) {
    if (pasoId === pasoActual) return true;
    const idx = CONFIGURADOR.pasos.findIndex(p => p.id === pasoId);
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!pasoCompletado(CONFIGURADOR.pasos[i].id)) return false;
    }
    return true;
  }

  function pasoCompletado(pid) {
    if (pid === 'modelo')    return !!proyecto.modelo;
    if (pid === 'exterior')  return !!proyecto.exterior;
    if (pid === 'cocina')    return !!proyecto.cocina;
    if (pid === 'banos')     return !!proyecto.banos;
    if (pid === 'lugar')     return !!proyecto.lugar;
    if (pid === 'inversion') return !!proyecto.budgetRange;
    if (pid === 'estudio')   return false; // siempre disponible
    return false;
  }

  function actualizarSidebar() {
    dom.sidebarSteps.querySelectorAll('.sidebar-step').forEach(btn => {
      const pid = btn.dataset.paso;
      btn.classList.remove('active', 'completed');
      if (pid === pasoActual) btn.classList.add('active');
      if (pasoCompletado(pid)) btn.classList.add('completed');
    });
  }

  /* ════════════════════════════════════════════════════════
     Progress (mobile header)
     ════════════════════════════════════════════════════════ */
  function actualizarProgress() {
    const idx = CONFIGURADOR.pasos.findIndex(p => p.id === pasoActual);
    const total = CONFIGURADOR.pasos.length;
    const pct = Math.round(((idx + 1) / total) * 100);
    dom.progressFill.style.width = `${pct}%`;
    dom.stepIndicator.textContent = `${idx + 1}/${total}`;
  }

  /* ════════════════════════════════════════════════════════
     Navegación
     ════════════════════════════════════════════════════════ */
  function navegarA(pasoId, animate = true) {
    pasoActual = pasoId;
    actualizarSidebar();
    actualizarProgress();
    renderizarPaso();
    actualizarResumen();
    actualizarNavFooter();

    if (animate) {
      dom.selectorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function pasoAnterior() {
    const idx = CONFIGURADOR.pasos.findIndex(p => p.id === pasoActual);
    if (idx > 0) navegarA(CONFIGURADOR.pasos[idx - 1].id);
  }

  function pasoSiguiente() {
    const idx = CONFIGURADOR.pasos.findIndex(p => p.id === pasoActual);
    if (idx < CONFIGURADOR.pasos.length - 1) {
      navegarA(CONFIGURADOR.pasos[idx + 1].id);
    }
  }

  /* ════════════════════════════════════════════════════════
     Renderizar paso actual
     ════════════════════════════════════════════════════════ */
  function renderizarPaso() {
    const paso = CONFIGURADOR.pasos.find(p => p.id === pasoActual);
    if (!paso) return;

    switch (pasoActual) {
      case 'modelo':    renderizarModelo(); break;
      case 'exterior':  renderizarVisualStep('exterior'); break;
      case 'cocina':    renderizarVisualStep('cocina'); break;
      case 'banos':     renderizarVisualStep('banos'); break;
      case 'lugar':     renderizarLugar(); break;
      case 'inversion': renderizarInversion(); break;
      case 'estudio':   renderizarEstudio(); break;
    }
  }

  /* ════════════════════════════════════════════════════════
     Step 1: Modelo (chips + cards)
     ════════════════════════════════════════════════════════ */
  function renderizarModelo() {
    const data = CONFIGURADOR.modelo;
    const seleccionado = proyecto.modelo ? CONFIGURADOR.getModeloById(proyecto.modelo) : null;

    // Visual
    renderVisual(seleccionado ? seleccionado.render : null, data.editorial);

    // Info bar
    if (seleccionado) {
      dom.infoBar.style.display = 'flex';
      dom.infoName.textContent = seleccionado.nombre;
      dom.infoStats.innerHTML = `
        <span class="info-stat"><span class="info-stat-dot"></span>${seleccionado.m2} m²</span>
        <span class="info-stat"><span class="info-stat-dot"></span>${seleccionado.habitaciones} hab</span>
        <span class="info-stat"><span class="info-stat-dot"></span>${seleccionado.plantas} planta${seleccionado.plantas > 1 ? 's' : ''}</span>
      `;
    } else {
      dom.infoBar.style.display = 'none';
    }

    // Selector
    dom.selectorZone.innerHTML = `
      <div class="section-header">
        <div class="section-title">${data.titulo}</div>
      </div>
      <div class="chip-group">
        <button class="chip ${filtroModelo.plantas === 1 ? 'selected' : ''}" data-filter="plantas" data-val="1">1 planta</button>
        <button class="chip ${filtroModelo.plantas === 2 ? 'selected' : ''}" data-filter="plantas" data-val="2">2 plantas</button>
      </div>
      <div class="chip-group">
        <button class="chip ${filtroModelo.habitaciones === 2 ? 'selected' : ''}" data-filter="habitaciones" data-val="2">2 hab</button>
        <button class="chip ${filtroModelo.habitaciones === 3 ? 'selected' : ''}" data-filter="habitaciones" data-val="3">3 hab</button>
        <button class="chip ${filtroModelo.habitaciones === 4 ? 'selected' : ''}" data-filter="habitaciones" data-val="4">4 hab</button>
        <button class="chip ${filtroModelo.habitaciones === 5 ? 'selected' : ''}" data-filter="habitaciones" data-val="5">5 hab</button>
      </div>
      <div class="option-grid" id="optionGrid"></div>
    `;

    // Bind chip events
    dom.selectorZone.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;
        const val = parseInt(chip.dataset.val);
        if (filtroModelo[filter] === val) {
          filtroModelo[filter] = null;
        } else {
          filtroModelo[filter] = val;
        }
        renderizarModeloCards();
      });
    });

    renderizarModeloCards();
    setupChipScroll();
    autoSeleccionarModeloUnico();
  }

  /* ── Auto-selecciona el modelo cuando los filtros dan 1 solo resultado ── */
  function autoSeleccionarModeloUnico() {
    let opciones = CONFIGURADOR.modelo.opciones;
    if (filtroModelo.plantas) opciones = opciones.filter(o => o.plantas === filtroModelo.plantas);
    if (filtroModelo.habitaciones) opciones = opciones.filter(o => o.habitaciones === filtroModelo.habitaciones);
    if (opciones.length === 1 && proyecto.modelo !== opciones[0].id) {
      proyecto.modelo = opciones[0].id;
      guardarProyecto();
      renderizarModelo(); // actualiza visual + info bar
      actualizarResumen();
      actualizarSidebar();
    }
  }

  /* ── Scroll táctil horizontal para chip-group (móvil) ── */
  function setupChipScroll() {
    dom.selectorZone.querySelectorAll('.chip-group').forEach(group => {
      // Solo si el contenido desborda
      if (group.scrollWidth <= group.clientWidth + 1) return;

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      const onDown = (e) => {
        isDown = true;
        group.classList.add('is-dragging');
        startX = e.pageX - group.offsetLeft;
        scrollLeft = group.scrollLeft;
      };

      const onMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - group.offsetLeft;
        const walk = (x - startX) * 1.2;
        group.scrollLeft = scrollLeft - walk;
      };

      const onUp = () => {
        isDown = false;
        group.classList.remove('is-dragging');
      };

      group.addEventListener('pointerdown', onDown);
      group.addEventListener('pointermove', onMove);
      group.addEventListener('pointerup', onUp);
      group.addEventListener('pointerleave', onUp);
      group.addEventListener('pointercancel', onUp);

      // Guardar referencias para limpieza
      group._chipCleanup = () => {
        group.removeEventListener('pointerdown', onDown);
        group.removeEventListener('pointermove', onMove);
        group.removeEventListener('pointerup', onUp);
        group.removeEventListener('pointerleave', onUp);
        group.removeEventListener('pointercancel', onUp);
      };
    });
  }

  function renderizarModeloCards() {
    const grid = $('#optionGrid');
    if (!grid) return;

    let opciones = CONFIGURADOR.modelo.opciones;
    if (filtroModelo.plantas) opciones = opciones.filter(o => o.plantas === filtroModelo.plantas);
    if (filtroModelo.habitaciones) opciones = opciones.filter(o => o.habitaciones === filtroModelo.habitaciones);

    grid.innerHTML = opciones.map(o => `
      <div class="option-card ${proyecto.modelo === o.id ? 'selected' : ''}" data-id="${o.id}">
        <img class="option-card-thumb" src="${o.miniatura}" alt="${o.nombre}" loading="lazy">
        <div class="option-card-name">${o.nombre}</div>
        <div class="option-card-meta">
          <span>${o.m2} m²</span>
          <span>${o.habitaciones} hab</span>
          <span>${o.plantas} planta${o.plantas > 1 ? 's' : ''}</span>
        </div>
        <div class="option-card-desc">${o.descripcion}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        seleccionarModelo(card.dataset.id);
      });
    });

    // Auto-seleccionar si solo queda 1 modelo (importante en móvil sin cards visibles)
    autoSeleccionarModeloUnico();
  }

  function seleccionarModelo(id) {
    proyecto.modelo = id;
    guardarProyecto();
    renderizarModelo();
    actualizarResumen();
    actualizarSidebar();
    actualizarNavFooter();
    
    // NO auto-avanzar: el usuario pulsa "Siguiente"
  }

  /* ════════════════════════════════════════════════════════
     Steps 2-4: Exterior / Cocina / Baños (tall cards)
     ════════════════════════════════════════════════════════ */
  function renderizarVisualStep(tipo) {
    const data = CONFIGURADOR[tipo];
    const key = tipo; // 'exterior', 'cocina', 'banos'
    const seleccionado = proyecto[key]
      ? data.opciones.find(o => o.id === proyecto[key])
      : null;

    // Visual
    renderVisual(seleccionado ? seleccionado.imagen : null, data.editorial);

    dom.infoBar.style.display = 'none';

    // Selector
    dom.selectorZone.innerHTML = `
      <div class="section-header">
        <div class="section-title">${data.titulo}</div>
      </div>
      <div class="option-grid-tall" id="optionGridTall"></div>
    `;

    const grid = $('#optionGridTall');
    grid.innerHTML = data.opciones.map(o => `
      <div class="option-card-tall ${proyecto[key] === o.id ? 'selected' : ''}" data-id="${o.id}">
        <img class="option-card-tall-img" src="${o.imagen}" alt="${o.nombre}" loading="lazy">
        <div class="option-card-tall-info">
          <div class="option-card-tall-name">${o.nombre}</div>
          <div class="option-card-tall-desc">${o.descripcion}</div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.option-card-tall').forEach(card => {
      card.addEventListener('click', () => {
        proyecto[key] = card.dataset.id;
        guardarProyecto();
        renderizarVisualStep(tipo);
        actualizarResumen();
        actualizarSidebar();
        actualizarNavFooter();
      });
    });
  }

  /* ════════════════════════════════════════════════════════
     Step 5: El lugar (radio + ubicación)
     ════════════════════════════════════════════════════════ */
  function renderizarLugar() {
    const data = CONFIGURADOR.lugar;
    const tieneTerreno = proyecto.lugar === 'tengo-terreno';

    renderVisual(null, data.editorial);
    dom.infoBar.style.display = 'none';

    dom.selectorZone.innerHTML = `
      <div class="section-header">
        <div class="section-title">${data.titulo}</div>
      </div>
      <div class="radio-group" id="radioGroup"></div>
      
      <!-- Ubicación deseada (visible solo si NO tiene terreno) -->
      <div class="ubicacion-wrap ${tieneTerreno ? 'is-hidden' : ''}">
        <div class="ubicacion-label">${CONFIGURADOR.labels.ubicacion}</div>
        <input type="text" class="ubicacion-input" id="ubicacionInput" placeholder="Ej: Girona, Costa Brava, interior de Barcelona…" value="${proyecto.ubicacion || ''}">
      </div>

      <!-- Detalles del terreno (solo si tiene terreno) -->
      <div class="terreno-details-wrap ${tieneTerreno ? '' : 'is-hidden'}">
        <div class="terreno-details-header">
          <div class="terreno-details-label">Detalles del terreno</div>
          <div class="terreno-details-hint">Si lo compartes, lo estudiamos dentro del proyecto</div>
        </div>
        <input type="text" class="terreno-details-input" id="terrenoUbicacionInput" placeholder="Ubicación del terreno (provincia, municipio, zona…)" value="${proyecto.terrenoUbicacion || ''}">
        <textarea class="terreno-details-textarea" id="terrenoDetallesInput" placeholder="Describe tu terreno: metros, acceso, servicios, orientación… (Opcional)">
${proyecto.terrenoDetalles || ''}
        </textarea>
      </div>
    `;

    const radioGroup = $('#radioGroup');
    radioGroup.innerHTML = data.opciones.map(o => `
      <div class="radio-option ${proyecto.lugar === o.id ? 'selected' : ''}" data-id="${o.id}">
        <div class="radio-dot"></div>
        <div class="radio-label">${o.label}</div>
      </div>
    `).join('');

    radioGroup.querySelectorAll('.radio-option').forEach(opt => {
      opt.addEventListener('click', () => {
        proyecto.lugar = opt.dataset.id;
        guardarProyecto();
        renderizarLugar();
        actualizarResumen();
        actualizarSidebar();
        actualizarNavFooter();
      });
    });

    // Input para ubicación deseada (cuando está buscando)
    const ubicacionInput = $('#ubicacionInput');
    if (ubicacionInput) {
      ubicacionInput.addEventListener('input', (e) => {
        proyecto.ubicacion = e.target.value;
        guardarProyecto();
        actualizarResumen();
      });
    }

    // Inputs para detalles del terreno (cuando tiene terreno)
    const terrenoUbicacionInput = $('#terrenoUbicacionInput');
    const terrenoDetallesInput = $('#terrenoDetallesInput');
    
    if (terrenoUbicacionInput) {
      terrenoUbicacionInput.addEventListener('input', (e) => {
        proyecto.terrenoUbicacion = e.target.value;
        guardarProyecto();
        actualizarResumen();
      });
    }
    
    if (terrenoDetallesInput) {
      terrenoDetallesInput.addEventListener('input', (e) => {
        proyecto.terrenoDetalles = e.target.value;
        guardarProyecto();
        actualizarResumen();
      });
    }
  }

  /* ════════════════════════════════════════════════════════
     Step 6: Inversión (radio)
     ════════════════════════════════════════════════════════ */
  function renderizarInversion() {
    const data = CONFIGURADOR.inversion;

    renderVisual(null, data.editorial);
    dom.infoBar.style.display = 'none';

    dom.selectorZone.innerHTML = `
      <div class="section-header">
        <div class="section-title">${data.titulo}</div>
        <div class="section-subtitle">${data.subtitulo}</div>
      </div>
      <div class="radio-group" id="radioGroup"></div>
    `;

    const radioGroup = $('#radioGroup');
    radioGroup.innerHTML = data.opciones.map(o => `
      <div class="radio-option ${proyecto.budgetRange === o.id ? 'selected' : ''}" data-id="${o.id}">
        <div class="radio-dot"></div>
        <div>
          <div class="radio-label">${o.label}</div>
          <div class="radio-sublabel">${o.texto}</div>
        </div>
      </div>
    `).join('');

    radioGroup.querySelectorAll('.radio-option').forEach(opt => {
      opt.addEventListener('click', () => {
        proyecto.budgetRange = opt.dataset.id;
        guardarProyecto();
        renderizarInversion();
        actualizarResumen();
        actualizarSidebar();
        actualizarNavFooter();
      });
    });
  }

  /* ════════════════════════════════════════════════════════
     Step 7: Recibir estudio (formulario)
      ════════════════════════════════════════════════════════ */
  function renderizarEstudio() {
    const data = CONFIGURADOR.estudio;

    renderVisual(null, null);
    dom.infoBar.style.display = 'none';

    dom.selectorZone.innerHTML = `
      <div class="section-header">
        <div class="section-title">${data.titulo}</div>
        <div class="section-subtitle">${data.subtitulo}</div>
      </div>
      <div class="form-wrap" id="formWrap">
        ${data.campos.map(c => {
          if (c.type === 'textarea') {
            return `
              <div class="form-group">
                <label class="form-label" for="form_${c.id}">${c.label}</label>
                <textarea class="form-textarea" id="form_${c.id}" placeholder="${c.label}">${proyecto[c.id] || ''}</textarea>
              </div>`;
          }
          return `
            <div class="form-group">
              <label class="form-label" for="form_${c.id}">${c.label}</label>
              <input class="form-input" type="${c.type}" id="form_${c.id}" placeholder="${c.label}" value="${proyecto[c.id] || ''}" autocomplete="${c.type === 'email' ? 'email' : c.type === 'tel' ? 'tel' : 'name'}">
            </div>`;
        }).join('')}
      </div>
    `;

    // Bind input events
    data.campos.forEach(c => {
      const input = document.getElementById(`form_${c.id}`);
      if (!input) return;
      input.addEventListener('input', () => {
        proyecto[c.id] = input.value;
        guardarProyecto();
        actualizarResumen();
      });
    });
  }

  /* ════════════════════════════════════════════════════════
     Visual zone (render + editorial)
     ════════════════════════════════════════════════════════ */
  function renderVisual(imgSrc, editorialText) {
    if (imgSrc) {
      dom.visualZone.innerHTML = `
        <div class="visual-img-wrap">
          <img class="visual-img" src="${imgSrc}" alt="Render">
        </div>
        ${editorialText ? `<div class="editorial-text">${editorialText}</div>` : ''}
      `;
    } else if (editorialText) {
      dom.visualZone.innerHTML = `
        <div class="visual-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <div class="editorial-text">${editorialText}</div>
      `;
    } else {
      dom.visualZone.innerHTML = '';
    }
  }

  /* ════════════════════════════════════════════════════════
     Resumen (sidebar desktop + drawer mobile)
     ════════════════════════════════════════════════════════ */
  function actualizarResumen() {
    const items = [];
    if (proyecto.modelo)    items.push({ label: 'Modelo',    value: CONFIGURADOR.getModeloById(proyecto.modelo)?.nombre || proyecto.modelo });
    if (proyecto.exterior)  items.push({ label: 'Exterior',  value: CONFIGURADOR.getExteriorById(proyecto.exterior)?.nombre || proyecto.exterior });
    if (proyecto.cocina)    items.push({ label: 'Cocina',    value: CONFIGURADOR.getCocinaById(proyecto.cocina)?.nombre || proyecto.cocina });
    if (proyecto.banos)     items.push({ label: 'Baños',     value: CONFIGURADOR.getBanosById(proyecto.banos)?.nombre || proyecto.banos });
    if (proyecto.lugar)     items.push({ label: 'Terreno',   value: CONFIGURADOR.getLugarById(proyecto.lugar)?.label || proyecto.lugar });
    if (proyecto.ubicacion) items.push({ label: 'Ubicación', value: proyecto.ubicacion });
    // Mostrar detalles de terreno si existen
    if (proyecto.terrenoUbicacion) items.push({ label: 'Terreno — Ubicación', value: proyecto.terrenoUbicacion });
    if (proyecto.terrenoDetalles)  items.push({ label: 'Terreno — Detalles',  value: proyecto.terrenoDetalles });
    if (proyecto.budgetRange) items.push({ label: 'Inversión', value: CONFIGURADOR.inversion.opciones.find(o => o.id === proyecto.budgetRange)?.label || proyecto.budgetRange });
    if (proyecto.nombre)    items.push({ label: 'Nombre',    value: proyecto.nombre });
    if (proyecto.email)     items.push({ label: 'Email',     value: proyecto.email });
    if (proyecto.whatsapp)  items.push({ label: 'WhatsApp',  value: proyecto.whatsapp });

    const completados = items.length;
    if (dom.resumenCount) dom.resumenCount.textContent = completados;

    const html = items.length
      ? items.map(i => `
        <div class="resumen-item">
          <span class="resumen-item-label">${i.label}</span>
          <span class="resumen-item-value">${i.value}</span>
        </div>
      `).join('')
      : `<div style="color: var(--texto-muted); font-size: 0.85rem; padding: 16px 0; text-align: center;">Selecciona opciones para ver tu proyecto</div>`;

    if (dom.resumenLista) dom.resumenLista.innerHTML = html;
    if (dom.resumenPanelLista) dom.resumenPanelLista.innerHTML = html;

    // WhatsApp link (sidebar desktop)
    const msj = CONFIGURADOR.buildWhatsAppMessage(proyecto);
    const waHref = `https://wa.me/34652629991?text=${msj}`;
    dom.btnWhatsapp.href = waHref;
    dom.btnWhatsapp.style.display = completados > 0 ? 'inline-flex' : 'none';

    // WhatsApp link (drawer mobile)
    if (dom.btnWhatsappDrawer) {
      dom.btnWhatsappDrawer.href = waHref;
      dom.btnWhatsappDrawer.style.display = completados > 0 ? 'inline-flex' : 'none';
    }
  }

  /* ════════════════════════════════════════════════════════
     Nav footer
     ════════════════════════════════════════════════════════ */
  function actualizarNavFooter() {
    const idx = CONFIGURADOR.pasos.findIndex(p => p.id === pasoActual);
    const esPrimero = idx === 0;
    const esUltimo = idx === CONFIGURADOR.pasos.length - 1;

    dom.btnPrev.style.visibility = esPrimero ? 'hidden' : 'visible';

    if (esUltimo) {
      dom.btnNext.textContent = 'Recibir estudio personalizado';
      dom.btnNext.className = 'btn btn-primary';
    } else {
      dom.btnNext.textContent = 'Siguiente';
      dom.btnNext.className = 'btn btn-primary';
    }
  }

  /* ════════════════════════════════════════════════════════
     Envío del formulario
     ════════════════════════════════════════════════════════ */
  async function enviarLead() {
    /* ── Validación ── */
    if (!proyecto.nombre || !proyecto.nombre.trim()) {
      mostrarToast('Escribe tu nombre');
      return;
    }
    if (!proyecto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proyecto.email)) {
      mostrarToast('Escribe un email válido');
      return;
    }
    if (!proyecto.whatsapp || !/^\+?\d{6,15}$/.test(proyecto.whatsapp.replace(/[\s\-()]/g, ''))) {
      mostrarToast('Escribe un teléfono válido');
      return;
    }

    /* ── Bloquear botón mientras envía ── */
    const btnOriginalText = dom.btnNext.textContent;
    dom.btnNext.textContent = 'Enviando solicitud…';
    dom.btnNext.disabled = true;
    dom.btnNext.style.opacity = '0.7';
    dom.btnNext.style.pointerEvents = 'none';

    try {
      const lead = CORHOMESLeads.buildLeadData();
      await CORHOMESLeads.sendLead(lead);
      CORHOMESLeads.showSuccessScreen(lead);
    } catch (err) {
      console.error('Error enviando lead:', err);
      /* Restaurar botón si falla (showErrorScreen oculta nav, pero por si acaso) */
      dom.btnNext.textContent = btnOriginalText;
      dom.btnNext.disabled = false;
      dom.btnNext.style.opacity = '1';
      dom.btnNext.style.pointerEvents = 'auto';
      CORHOMESLeads.showErrorScreen(err.message);
    }
  }

  /* ════════════════════════════════════════════════════════
     Toast
     ════════════════════════════════════════════════════════ */
  function mostrarToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.add('visible');
    clearTimeout(dom.toast._timeout);
    dom.toast._timeout = setTimeout(() => {
      dom.toast.classList.remove('visible');
    }, 3000);
  }

  /* ════════════════════════════════════════════════════════
     Events
     ════════════════════════════════════════════════════════ */
  function bindEvents() {
    dom.btnPrev.addEventListener('click', pasoAnterior);
    dom.btnNext.addEventListener('click', () => {
      const idx = CONFIGURADOR.pasos.findIndex(p => p.id === pasoActual);
      if (idx === CONFIGURADOR.pasos.length - 1) {
        enviarLead();
      } else {
        pasoSiguiente();
      }
    });

    // Resumen drawer (mobile)
    dom.resumenToggle.addEventListener('click', toggleResumen);
    dom.resumenBackdrop.addEventListener('click', closeResumen);

    // Swipe down to close drawer
    let touchStartY = 0;
    dom.resumenDrawer.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    dom.resumenDrawer.addEventListener('touchmove', (e) => {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy > 60) closeResumen();
    });
  }

  function toggleResumen() {
    dom.resumenDrawer.classList.toggle('open');
    dom.resumenBackdrop.classList.toggle('open');
  }

  function closeResumen() {
    dom.resumenDrawer.classList.remove('open');
    dom.resumenBackdrop.classList.remove('open');
  }

  /* ════════════════════════════════════════════════════════
     Logo / Brand navigation — save project before leaving
     ════════════════════════════════════════════════════════ */
  const brandLink = document.getElementById('brandLink');
  const headerBrandLink = document.getElementById('headerBrandLink');
  function onBrandClick() {
    guardarProyecto();
    // Navigation proceeds normally via <a href>
  }
  if (brandLink) brandLink.addEventListener('click', onBrandClick);
  if (headerBrandLink) headerBrandLink.addEventListener('click', onBrandClick);

  /* ════════════════════════════════════════════════════════
     Boot
     ════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', init);

})();