// Envía al cliente, por email, el cálculo de la calculadora de COR STUDIO.
// Usa Resend (https://resend.com). Sin RESEND_API_KEY no envía nada y responde {sent:false};
// la calculadora avisa entonces de que el cálculo se enviará a mano en 48 h.
// Variables en Vercel (proyecto cor-studio):
//   RESEND_API_KEY   clave de Resend (dominio cor.homes verificado en Resend)
//   STUDIO_FROM      opcional, por defecto "COR STUDIO <studio@cor.homes>"
//   STUDIO_BCC       opcional, copia oculta de cada envío (por defecto studio@cor.homes)

const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// El resumen lo genera la calculadora: solo texto, sin enlaces, para que nadie use esto para mandar spam.
const limpio = t => String(t || '').replace(/https?:\/\/\S+|www\.\S+/gi, '').slice(0, 4000);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ sent: false });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(200).json({ sent: false, reason: 'not_configured' });

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  const nombre = limpio(b?.nombre).slice(0, 80).trim();
  const email = String(b?.email || '').trim().slice(0, 200);
  const resumen = limpio(b?.resumen);
  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !resumen.includes('Total aproximado'))
    return res.status(400).json({ sent: false });

  const pie = 'Son precios aproximados, no un presupuesto. Para darte un presupuesto válido tenemos que visitar la obra.\n' +
    'Como project manager trabajamos para ti: negociamos los productos y los gremios para que la reforma te salga más económica.\n\n' +
    'COR STUDIO · WhatsApp 671 410 508 · studio@cor.homes · studio.cor.homes';
  const text = `Hola ${nombre},\n\nEste es el cálculo de tu reforma:\n\n${resumen}\n\n${pie}`;
  const html = `<div style="font-family:Inter,Arial,sans-serif;color:#2B2A26;max-width:560px">
<div style="background:#4F5E4C;color:#F5F0E6;padding:18px 22px;font-family:Georgia,serif;letter-spacing:.14em">COR STUDIO</div>
<div style="padding:20px 22px;background:#F5F0E6">
<p>Hola ${esc(nombre)},</p><p>Este es el cálculo de tu reforma:</p>
<pre style="white-space:pre-wrap;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.55;background:#fffdf8;border:1px solid #d9d0bb;border-radius:8px;padding:14px">${esc(resumen)}</pre>
<p style="background:#DDD5BD;padding:10px 12px;border-radius:6px;font-size:14px"><strong>Son precios aproximados, no un presupuesto.</strong> Para darte un presupuesto válido tenemos que visitar la obra.</p>
<p style="font-size:14px">Como project manager trabajamos para ti: negociamos los productos y los gremios para que la reforma te salga más económica.</p>
<p style="font-size:14px">¿Quieres que visitemos la obra? Responde a este email o escríbenos por WhatsApp al <a href="https://wa.me/34671410508">671 410 508</a>.</p>
</div></div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.STUDIO_FROM || 'COR STUDIO <studio@cor.homes>',
        to: [email],
        bcc: [process.env.STUDIO_BCC || 'studio@cor.homes'],
        reply_to: 'studio@cor.homes',
        subject: 'Tu cálculo de reforma · COR STUDIO',
        text, html
      })
    });
    return res.status(200).json({ sent: r.ok });
  } catch {
    return res.status(200).json({ sent: false });
  }
}
