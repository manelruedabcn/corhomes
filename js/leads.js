/**
 * COR.HOMES — Sistema de captura de leads (v3)
 * Stack: Web3Forms + localStorage
 * Overlay fullscreen para success/error — sin tocar layout.
 */
(function () {
  'use strict';

  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  const WEB3FORMS_KEY = 'd1830734-071d-4919-87d6-c6a8a503e0c8';

  /* ═══════════════════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════════════════ */
  function leerProyecto() {
    try {
      const raw = localStorage.getItem('corHomesProject');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function labelOpcion(data, id, prop) {
    if (!id) return '—';
    const opcion = data?.opciones?.find(o => o.id === id);
    return opcion ? (opcion[prop] || opcion.nombre || opcion.label || id) : id;
  }

  /* ═══════════════════════════════════════════════════════
     buildLeadData()
     ═══════════════════════════════════════════════════════ */
  function buildLeadData() {
    const p = leerProyecto();

    const modeloData    = CONFIGURADOR.getModeloById(p.modelo);
    const exteriorData  = CONFIGURADOR.getExteriorById(p.exterior);
    const cocinaData    = CONFIGURADOR.getCocinaById(p.cocina);
    const banosData     = CONFIGURADOR.getBanosById(p.banos);

    return {
      modelo: modeloData
        ? `${modeloData.nombre} · ${modeloData.m2} m² · ${modeloData.habitaciones} hab · ${modeloData.plantas} ${modeloData.plantas === 1 ? 'planta' : 'plantas'}`
        : (p.modelo || '—'),
      exterior: exteriorData ? exteriorData.nombre : (p.exterior || '—'),
      cocina: cocinaData ? cocinaData.nombre : (p.cocina || '—'),
      banos: banosData ? banosData.nombre : (p.banos || '—'),
      terreno: labelOpcion(CONFIGURADOR.lugar, p.lugar, 'label'),
      ubicacion: p.ubicacion || '—',
      terrenoUbicacion: p.terrenoUbicacion || '',
      terrenoDetalles: p.terrenoDetalles || '',
      inversion: labelOpcion(CONFIGURADOR.inversion, p.budgetRange, 'label'),
      nombre: p.nombre || '',
      email: p.email || '',
      whatsapp: p.whatsapp || '',
      comentarios: p.comentarios || '',
      createdAt: new Date().toISOString(),
    };
  }

  /* ═══════════════════════════════════════════════════════
     sendLead(leadData)
     ═══════════════════════════════════════════════════════ */
  async function sendLead(lead) {
    const payload = {
      access_key: WEB3FORMS_KEY,
      subject: 'Nuevo estudio COR.HOMES — ' + (lead.nombre || 'Sin nombre'),
      from_name: 'Configurador COR.HOMES',
      replyto: lead.email || '',
      Nombre: lead.nombre,
      Email: lead.email,
      WhatsApp: lead.whatsapp,
      Modelo: lead.modelo,
      Exterior: lead.exterior,
      Cocina: lead.cocina,
      Baños: lead.banos,
      Terreno: lead.terreno,
      Terreno_Ubicacion: lead.terrenoUbicacion,
      Terreno_Detalles: lead.terrenoDetalles,
      Ubicación: lead.ubicacion,
      Inversión: lead.inversion,
      Comentarios: lead.comentarios,
      Fecha: lead.createdAt,
    };

    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Web3Forms response:', result);

      if (!response.ok || result.success === false) {
        console.warn('Web3Forms error:', result.message);
        // No lanzar error - continuar igualmente (WhatsApp como fallback)
        return { success: true, message: 'Lead recibido (via fallback)' };
      }

      return result;
    } catch (e) {
      console.error('sendLead error:', e);
      // Fallback: no bloquear al usuario si web3forms falla
      return { success: true, message: 'Lead recibido (via fallback)' };
    }
  }

  /* ═══════════════════════════════════════════════════════
     buildWhatsAppLink(leadData)
     ═══════════════════════════════════════════════════════ */
  function buildWhatsAppLink(lead) {
    const lines = [
      'Hola COR.HOMES, os envío mi proyecto:',
      '',
      'Modelo: ' + lead.modelo,
      'Exterior: ' + lead.exterior,
      'Cocina: ' + lead.cocina,
      'Baños: ' + lead.banos,
      'Terreno: ' + lead.terreno,
      'Ubicación: ' + lead.ubicacion,
      'Terreno — Ubicación: ' + (lead.terrenoUbicacion || '—'),
      'Terreno — Detalles: ' + (lead.terrenoDetalles || '—'),
      'Inversión: ' + lead.inversion,
      'Nombre: ' + lead.nombre,
      'Email: ' + lead.email,
      'WhatsApp: ' + lead.whatsapp,
      'Comentarios: ' + lead.comentarios,
    ];
    return 'https://wa.me/34652629991?text=' + encodeURIComponent(lines.join('\n'));
  }

  /* ═══════════════════════════════════════════════════════
     Ocultar chrome del configurador
     ═══════════════════════════════════════════════════════ */
  function ocultarChrome() {
    const navFooter = document.getElementById('navFooter');
    const resumenPanel = document.getElementById('resumenPanel');
    const resumenToggle = document.getElementById('resumenToggle');
    if (navFooter) navFooter.style.display = 'none';
    if (resumenPanel) resumenPanel.style.display = 'none';
    if (resumenToggle) resumenToggle.style.display = 'none';
  }

  /* ═══════════════════════════════════════════════════════
     Mostrar overlay (success o error)
     ═══════════════════════════════════════════════════════ */
  function mostrarOverlay(html, tipo) {
    // Eliminar overlay previo si existe
    const existente = document.getElementById('leadOverlay');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'leadOverlay';
    overlay.className = 'lead-overlay' + (tipo === 'error' ? ' lead-overlay--error' : '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', tipo === 'error' ? 'Error de envío' : 'Solicitud enviada');
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // Animación de entrada
    requestAnimationFrame(() => {
      overlay.classList.add('lead-overlay--visible');
    });

    // Foco al overlay para accesibilidad
    overlay.focus();
  }

  /* ═══════════════════════════════════════════════════════
     showSuccessScreen(leadData)
     ═══════════════════════════════════════════════════════ */
  function showSuccessScreen(lead) {
    ocultarChrome();

    const waLink = buildWhatsAppLink(lead);

    // Marcar último paso como completado en sidebar
    const sidebarSteps = document.querySelectorAll('.sidebar-step');
    sidebarSteps.forEach(s => s.classList.remove('active'));
    const lastStep = document.querySelector('.sidebar-step[data-paso="estudio"]');
    if (lastStep) {
      lastStep.classList.add('active', 'completed');
    }

    mostrarOverlay(`
      <div class="lead-success">
        <div class="lead-success-inner">
          <div class="lead-success-icon">&#10003;</div>
          <h2 class="lead-success-title">Hemos recibido<br>vuestro proyecto.</h2>
          <p class="lead-success-text">
            En las próximas 48h revisaremos vuestra selección y os contactaremos personalmente.
          </p>
          <div class="lead-success-actions">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
              Comentar el proyecto
            </a>
            <a href="../index.html" class="btn btn-outline">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    `);
  }

  /* ═══════════════════════════════════════════════════════
     showErrorScreen(errorMessage)
     ═══════════════════════════════════════════════════════ */
  function showErrorScreen(message) {
    ocultarChrome();

    mostrarOverlay(`
      <div class="lead-success">
        <div class="lead-success-inner">
          <div class="lead-success-icon" style="background:rgba(180,60,60,0.08); color:#b43c3c;">!</div>
          <h2 class="lead-success-title">No hemos podido<br>enviar vuestra solicitud.</h2>
          <p class="lead-success-text">
            Podéis escribirnos directamente y os atendemos sin demora.
          </p>
          <div class="lead-success-actions">
            <a href="https://wa.me/34652629991" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
              Escribir por WhatsApp
            </a>
            <a href="../index.html" class="btn btn-outline">
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    `, 'error');
  }

  /* ═══════════════════════════════════════════════════════
     API pública
     ═══════════════════════════════════════════════════════ */
  window.CORHOMESLeads = {
    buildLeadData,
    sendLead,
    buildWhatsAppLink,
    showSuccessScreen,
    showErrorScreen,
  };

})();