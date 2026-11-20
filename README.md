# COR HOMES · Migración desde ChatGPT Sites

La base de esta rama es la versión 20 de Sites, identificada por el commit de origen
`ac21cb95c371906fc51e742d6ade76f567bceb47`. Incluye una copia del Worker publicado, con la clave de Web3Forms retirada, como
referencia y el servidor Node.js que se usaba para generar el código de ese Worker.
Los datos de producción se entregan por separado. Esta rama se puede alojar en
cualquier servidor con Node.js y disco persistente.

## Ejecutar en local

Se requiere Node.js 22.15 o posterior con `node:sqlite`. No hay dependencias npm que instalar.

```sh
npm start
```

Abre http://127.0.0.1:3000. Para entrar en `/admin`, define `ADMIN_PASSWORD`
en el entorno antes de arrancar y usa esa contraseña en la pantalla de acceso.
El primer arranque crea una base SQLite vacía. `npm test` ejecuta las pruebas del
Worker original con una base SQLite en memoria. Para producción, configura la
URL pública en `BASE_URL`, usa `NODE_ENV` en modo producción, da al servicio un
disco persistente para `DATA_DIR` y termina HTTPS en el proxy de tu alojamiento.
GitHub Pages solo puede servir archivos estáticos.

## Estructura y generación de páginas

| Ruta del código | Función |
| --- | --- |
| `app/server/app.mjs` | Servidor HTTP en JavaScript ESM, sin framework. Enruta solicitudes, genera HTML, expone la API y accede a SQLite. |
| `app/server/content.mjs` | Textos localizados de la portada y las páginas de servicios. |
| `app/server/blog.mjs`, `app/server/blog-ca.mjs` | Artículos y metadatos en español y catalán. |
| `app/server/admin.html` | Panel de inmuebles y consultas. |
| `app/css/`, `app/js/`, `app/assets/`, `app/configurador/` | Estilos, lógica de navegador, imágenes y configurador con sus modelos y recursos. |
| `worker/index.js`, `scripts/`, `drizzle/` | Worker de referencia, generador, comprobaciones y esquema SQL de D1. |

El servidor elige el idioma del primer segmento de la URL. El español usa la raíz,
el inglés usa `/en` y el catalán `/ca`. Los nombres de las rutas de servicios se
conservan bajo esos prefijos. La portada renderiza los textos del idioma y una
selección del catálogo. `/comprar`, `/vender`, `/autopromocion`, `/proyectos` y
`/contacto` comparten plantilla y consumen el contenido de cada servicio.
`/inmuebles` y sus fichas consultan la base de datos. La interfaz se traduce y los
campos de cada inmueble se muestran tal como se introdujeron. El blog sirve un
índice y fichas por slug en español y catalán. La navegación inglesa enlaza con
el blog español y las rutas `/en/blog` redirigen a su equivalente en español.
El configurador es un conjunto de HTML, CSS y JavaScript estático en español.

La plantilla común añade navegación, pie, metadatos y enlaces `hreflang`.
`/llms.txt`, `/robots.txt`, `/sitemap.xml` y las portadas Markdown
(`/index.md`, `/en/index.md`, `/ca/index.md`) se generan a petición.
El sitemap incluye servicios, artículos y fichas públicas.

## Backend

### Formularios de contacto y venta

Ambos formularios envían JSON a `POST /api/contacto`. En consultas generales
`propertyId` y `privateToken` van vacíos. Las fichas incluyen el ID y las fichas
privadas añaden el token. El servicio aporta `service` y la página aporta
`language` por medio de campos ocultos.

- `name`, `email`, `message` y `consent` son obligatorios. Se comprueba la
  estructura básica del email y los límites de 120 caracteres para el nombre,
  200 para el email, 40 para el teléfono opcional y 4.000 para el mensaje.
- Si hay `propertyId`, se comprueba que la ficha exista y sea distinta de
  borrador. Una ficha off market exige que `privateToken` coincida con el
  guardado para ese ID. El límite de frecuencia es de una consulta aceptada
  por identificador cada 30 segundos en memoria del proceso o Worker.
- Se inserta en `leads` la fecha `created` en UTC, el nombre, email, teléfono,
  mensaje y el ID opcional del inmueble. `service` se limita a 100 caracteres
  y se antepone al mensaje junto al idioma normalizado (ES, EN o CA).
  El consentimiento se valida al recibir el formulario. El esquema carece
  de columnas separadas para el consentimiento, el idioma, el servicio y el token.
- Sites almacena el registro en Cloudflare D1 mediante `DB`. El servidor Node
  lo almacena en `cor.sqlite`. La API devuelve `201` y el navegador confirma
  la recepción. El propietario puede leer las consultas en `/admin`.
  El código carece de envío de correo, destinatarios automáticos y servicio
  de notificaciones. `hola@cor.homes` aparece como dirección de contacto
  para escribir manualmente.

### Configurador de viviendas

Este formulario es independiente de `POST /api/contacto`. Guarda el proyecto en
`localStorage` y, con Web3Forms configurado, envía un estudio al buzón asociado
a la cuenta de ese proveedor. Incluye una opción de compartir por WhatsApp.
Los estudios de Web3Forms se recibían por correo y quedan fuera de D1.
Para habilitar Web3Forms en la copia Node, configura `WEB3FORMS_ACCESS_KEY`.
El servicio entrega esa clave de formulario al navegador, como requiere esta
integración cliente. Usa una clave de formulario, nunca una clave privada
de administración del proveedor. Con la variable vacía queda disponible
el flujo por WhatsApp.

### Catálogo e imágenes

El panel administra la tabla `properties`. El listado público excluye
`borrador` y `off_market` y ordena por ID descendente. Aplica los filtros
conjuntamente: `zona` busca una subcadena de `city` sin distinguir mayúsculas,
`operacion` compara exactamente `venta` o `alquiler`, y `precio` es un
máximo inclusivo en euros. Los filtros vacíos se omiten.

`images` contiene un array JSON de URLs. El panel guarda referencias y carece
de carga de archivos. Sites tiene D1 configurado y carece de una vinculación R2.
Los recursos estáticos incluidos se sirven desde el código. Las fotos de ficha
referenciadas por URL externa dependen de su proveedor. Si una ficha carece de
imágenes, se usa la imagen principal incluida.

### Enlaces off market

`privateToken` es la credencial de acceso de una ficha. Se generan 32 bytes
aleatorios criptográficos, codificados en 64 caracteres hexadecimales y
guardados como `private_token` con índice único. El servidor busca el token
en una ficha en estado `off_market` cuando se abre `/off-market/<token>`.
Cualquiera con la URL puede verla. La ficha se excluye del catálogo y del mapa
del sitio y se responde con cabeceras de no indexación y sin caché.
El token se conserva al editar, se regenera al pedir un nuevo enlace y se
borra cuando la ficha deja de estar off market.

### Dependencias de Sites y configuración

- **Persistencia.** El Worker usa la vinculación D1 `DB`. En Node, usa SQLite
  en disco persistente. Para conservar registros existentes, importa los
  filas de Sites D1 en las tablas correspondientes preservando IDs y fechas.
  El CSV de contactos indica el origen. Los estudios de Web3Forms son un
  historial de correo y tienen un esquema diferente.
- **Identidad.** Sites aporta el inicio y cierre de sesión de ChatGPT y la
  cabecera de identidad del usuario. El Worker compara el email autenticado
  con `ADMIN_EMAIL`. En un alojamiento ajeno a Sites, usa el servidor Node y
  su autenticación por contraseña con sesiones en memoria. Arranca una sola
  instancia si deseas mantener la sesión y el límite de frecuencia en el
  mismo proceso.
- **Correo.** Configura tu cuenta de Web3Forms si quieres recibir estudios del
  configurador. Si quieres avisos de contacto o venta, añade un proveedor de
  correo transaccional y un destinatario. Las consultas se guardan en SQLite.
- **Archivos.** Sirve los recursos incluidos con el backend. Conserva o
  migra las URLs externas de fotos si añades inmuebles con esas referencias.

Nombres de variables de entorno de Node:

- `ADMIN_PASSWORD`
- `BASE_URL`
- `DATA_DIR`
- `HOST`
- `PORT`
- `NODE_ENV`
- `WEB3FORMS_ACCESS_KEY`

Configuración del Worker de referencia:

- `ADMIN_EMAIL`
- `DB` (vinculación de base de datos)
- `WEB3FORMS_ACCESS_KEY` (opcional en la copia migrada)

El adaptador de Sites y su manifiesto de proyecto son específicos de la
plataforma. La copia incluye el generador y el esquema para documentar la
implementación, sin reutilizar el identificador del despliegue en producción.
