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
