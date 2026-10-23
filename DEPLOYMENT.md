# Revisión online de COR HOMES

La versión alojada en Sites se prepara en `sites/cor-homes`, con repositorio independiente y manifiesto `.openai/hosting.json`. No se debe crear otro Site para actualizarla: reutilizar el `project_id` del manifiesto.

URL prevista: https://cor-homes-real-estate.deepbasil20.chatgpt.site

Para esta revisión se conserva acceso privado del propietario. El panel usa la identidad proporcionada por Sites, y la base de datos D1 mantiene inmuebles y consultas. El dominio cor.homes conserva su alojamiento actual.

La copia alojada incluye `app/server`, `app/css` y los recursos necesarios. Después de cambios en el proyecto original, sincronizar esos archivos, ejecutar `scripts/generate-worker.py` y `scripts/test-worker.mjs`, y publicar mediante el flujo de Sites. El generador adapta el renderizado del servidor local a Workers y sustituye SQLite por D1. Las migraciones alojadas son independientes de la base local; no se ha importado inventario ni contactos.

La autenticación automática del panel solo está prevista para esta revisión owner-private. Antes de hacer el sitio público, implementar y comprobar una autorización explícita del propietario para cada ruta administrativa: estar autenticado por sí solo no equivale a ser administrador. No cambiar el acceso a público con esta versión del panel.
