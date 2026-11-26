# COR STUDIO · studio.cor.homes

Web estática de COR STUDIO, la línea de reformas, cocinas e interiorismo de COR HOMES.
Vive en esta carpeta y no forma parte del servidor de cor.homes: el script de build de la
web principal no la copia, así que no le afecta.

## Archivos

| Archivo | Función |
| --- | --- |
| `index.html` | Landing |
| `presupuesto.html` | Formulario de solicitud de presupuesto |
| `styles.css` | Estilos compartidos |
| `config.js` | Clave de Web3Forms del formulario |
| `vercel.json` | Config del proyecto de Vercel de esta carpeta |

## Publicar en studio.cor.homes (Vercel)

1. En Vercel: **Add New → Project** e importa este mismo repositorio `corhomes`.
2. En **Root Directory** elige `studio`. Framework: *Other*. Sin build.
3. Una vez desplegado: **Settings → Domains → Add** `studio.cor.homes`.
4. En el DNS de cor.homes añade el registro CNAME que indique Vercel (`studio` → `cname.vercel-dns.com`).

## Activar el formulario

1. Crea una clave en https://web3forms.com con el email donde quieres recibir las solicitudes.
2. Pégala en `config.js` (`window.COR_STUDIO_WEB3FORMS_KEY = '...'`).
3. Haz commit; Vercel vuelve a desplegar solo.

## Pendiente de rellenar

Los textos entre `[corchetes]`: fotos, proyectos, teléfono, email y plazo de respuesta.
