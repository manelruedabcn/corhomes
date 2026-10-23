# COR HOMES — Inmobiliaria

Web con catálogo, filtros, fichas renderizadas en servidor, metadatos para compartir, sitemap dinámico y panel privado en `/admin`. Mantiene los recursos originales y el configurador en el repositorio.

## Arranque

Node 22.15 o superior. No requiere instalar dependencias.

1. Copia `.env.example` a `.env` y establece una contraseña larga y única.
2. Ejecuta `node --env-file=.env --experimental-sqlite server/app.mjs`.
3. Abre http://localhost:3000 y entra en `/admin` para añadir propiedades reales.

La contraseña nunca se envía al cliente. Sesiones de 8 horas con cookie HttpOnly, limitación de intentos y comprobación de origen para cambios administrativos. Las consultas y propiedades se guardan en SQLite en `DATA_DIR`. Las sesiones se cierran al reiniciar el servidor. Las fotos se introducen mediante URL HTTPS: no hay subida de archivos incorporada.

## Producción

GitHub Pages solo aloja archivos estáticos y no ejecuta este backend. Desplegar el servidor Node en un servicio con disco persistente, detrás de HTTPS. Establecer `BASE_URL=https://cor.homes`, `NODE_ENV=production`, `ADMIN_PASSWORD` y `DATA_DIR` en el alojamiento. Configurar el proxy para el puerto `PORT` (3000 por defecto); `HOST=0.0.0.0` si la plataforma lo necesita. Copias de seguridad del directorio de datos mediante herramientas compatibles con SQLite. No subir `.env` ni la base de datos al repositorio.

La portada `index.html` sirve como presentación estática; el catálogo, contacto y panel completos requieren el servidor. `server/portada-anterior.html` conserva el diseño anterior. Las consultas llegan al panel: no se envían por email automáticamente. El catálogo comienza vacío deliberadamente. Revisar los textos de privacidad y datos empresariales reales antes de abrir la captación al público. Las páginas de zonas deben añadirse cuando exista inventario y contenido útil; no se generan páginas vacías para posicionamiento.

## Verificación

`npm test` comprueba el circuito de autenticación, publicación, edición, protección de borradores, SEO y guardado de consultas usando una base temporal.

## Fichas off market

Selecciona **Off market · enlace privado** en el estado del inmueble. Se genera un enlace aleatorio de 256 bits en `/off-market/<token>` que puedes abrir o copiar desde el panel. Estas fichas no aparecen en portada, búsquedas, catálogo, sitemap ni en su antigua dirección pública. Se envían con `noindex`, `noarchive`, `nosnippet`, caché desactivada y política de referencia que evita transmitir el enlace a sitios externos. No incluyen metadatos sociales con datos de la propiedad ni datos estructurados.

El enlace permite acceder a cualquiera que lo tenga: no es una invitación ligada a una identidad. **Renovar enlace** invalida el anterior; guardar en **Borrador** retira el acceso. Volver a activar off market genera un enlace distinto. Las consultas de una ficha privada requieren el token válido y aparecen en el panel con el identificador del inmueble. Las fotos en servicios externos conservan la política de acceso del proveedor; usa imágenes autorizadas y evita incluir direcciones exactas o datos confidenciales. Un inmueble que antes fue público puede conservar copias previas en buscadores o redes; cambiarlo a off market no elimina esas copias.

## Propuesta de valor y servicios

La portada y las páginas de servicio se redactan desde `server/content.mjs` en español e inglés: comprar / Personal Shopper, vender / captación, autopromoción asistida y suelo / proyectos / permutas. Las rutas inglesas llevan `/en` y comparten los enlaces al catálogo. Los textos de cada inmueble se muestran tal como se introducen en el panel; no se traducen automáticamente.

El configurador original vuelve a estar enlazado en autopromoción y se sirve con sus scripts, pasos y modelos. Su interfaz continúa en español y conserva su sistema original de envío de estudios. La copia alojada optimiza las imágenes sin modificar los recursos originales del repositorio. Los formularios de servicio registran en el panel el servicio de origen y el idioma de la consulta.
