# Revisión online de COR HOMES

La versión alojada en Sites se prepara en `sites/cor-homes`, con repositorio independiente y manifiesto `.openai/hosting.json`. No se debe crear otro Site para actualizarla: reutilizar el `project_id` del manifiesto.

URL prevista: https://cor-homes-real-estate.deepbasil20.chatgpt.site

La web es pública y está conectada a https://cor.homes y https://www.cor.homes. El panel exige la identidad del propietario mediante ADMIN_EMAIL. La base de datos D1 mantiene inmuebles y consultas. La autopromoción es una sección interna y conserva el configurador original.

La copia alojada incluye `app/server`, `app/css` y los recursos necesarios. Después de cambios en el proyecto original, sincronizar esos archivos, ejecutar `scripts/generate-worker.py` y `scripts/test-worker.mjs`, y publicar mediante el flujo de Sites. El generador adapta el renderizado del servidor local a Workers y sustituye SQLite por D1. Las migraciones alojadas son independientes de la base local; no se ha importado inventario ni contactos.

El panel alojado exige que la identidad autenticada de Sites coincida con ADMIN_EMAIL, configurado como secreto del servidor. Un visitante autenticado con otra cuenta no puede leer ni escribir propiedades privadas ni consultas. /admin redirige a inicio de sesión o devuelve 403 para otras cuentas. Las pruebas cubren accesos anónimos, ajenos y configuración ausente. El cambio de DNS para cor.homes está documentado en DNS-COR-HOMES.md y requiere verificación final.

La revisión incorpora portada y servicios ES/EN, recursos del configurador y `server/content.mjs`. El generador incluye HTML, JS, CSS e imágenes de `app/configurador` y sus dependencias, conservando las rutas originales. Las imágenes de la copia alojada se comprimen; los originales del proyecto no se modifican.
