# Catálogo: API implementada y contrato histórico

Referencia de `server/app.cjs` en el commit `fed52b6`. La interfaz y la API se sirven desde el mismo origen, sin CORS.

## Lectura pública

Disponible solamente con acceso público habilitado:

| Método y ruta | Respuesta |
| --- | --- |
| `GET /api/public/programs` | `{ "programs": [...] }`, solo programas activos |
| `GET /api/public/programs/{id}` | Programa activo o 404 |
| `GET /api/public/simulation-settings` | Parámetros públicos de la simulación |

Los IDs con caracteres especiales deben codificarse en la URL. La respuesta pública excluye datos de usuarios y auditoría.

## Operación interna

| Método y ruta | Función |
| --- | --- |
| `GET /api/programs` | Catálogo con `version` y `updated_at`; requiere sesión y `programs.view` |
| `PUT /api/admin/programs/{id}` | Actualización individual; requiere `programs.update` |
| `POST /api/admin/programs` | Lote de actualizaciones de programas existentes; requiere `programs.update` |
| `GET /api/admin/audit` | Auditoría filtrada, según permisos del usuario |

La actualización individual recibe `{ "version": 1, "changes": { "valorMatricula": 1000000 } }`. El lote recibe `{ "updates": [{ "id": "ID_EXISTENTE", "version": 1, "changes": { "valorIdiomas": 100000 } }] }`. Son ejemplos de estructura, no valores oficiales.

Las mutaciones exigen sesión, origen válido y token CSRF; no basta conocer la URL. Los campos editables son `nombre`, `valorMatricula`, `valorIdiomas`, `semestres` y `activo`. Un conflicto de versión devuelve 409. El lote y su auditoría se guardan en una misma transacción, o se revierten completos.

## Distinción con el adaptador histórico

El contrato de v1C y el adaptador genérico conservan métodos previstos para crear programas, cambiar estado mediante PATCH, importar mediante `/import`, leer historial por programa y obtener un programa interno mediante `/api/programs/{id}`. **Esas rutas no están implementadas por este servidor**. El actualizador operativo usa los endpoints de la tabla anterior: edita programas existentes, envía lotes y consulta la auditoría común. Un `POST /api/admin/programs` no crea un programa nuevo.

Los IDs son técnicos y no sustituyen códigos institucionales. No se inventan códigos. El catálogo base contiene 29 pregrados y 144 posgrados. Para los antecedentes de normalización y lectura remota, consultar [v1B](PROGRAM_CATALOG_V1B.md) y [v1C](PROGRAM_CATALOG_V1C.md).
