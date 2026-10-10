# Contrato propuesto: Program Catalog API

## Público
- `GET /api/programs`
- `GET /api/programs/{id}`

## Administrativo
- `POST /api/admin/programs`
- `PUT /api/admin/programs/{id}`
- `PATCH /api/admin/programs/{id}/status`
- `POST /api/admin/programs/import`
- `GET /api/admin/programs/{id}/history`

## Modelo mínimo
Campos obligatorios de lectura: `id`, `nombre`, `nivel`, `valorMatricula`, `activo`. `subnivel` es obligatorio para posgrados.

Campos opcionales: `codigo`, `subnivel` (pregrado), `valorIdiomas`, `semestres`, `sourceIndex`, `vigenciaDesde`, `vigenciaHasta`, `version`, `updatedAt`. `codigo` puede ser `null`; un ID técnico no representa un código institucional.

`GET /api/programs` devuelve el catálogo completo como un array o `{ "programs": [...] }`, con IDs únicos. V1C aplica los filtros de lectura en el cliente. `GET /api/programs/{id}` devuelve el programa o 404 cuando no existe. Matrículas e idiomas deben ser números finitos no negativos y `activo` debe ser booleano.

El contrato sigue siendo una propuesta para acordar con DTIC. Ver [Program Catalog v1C](PROGRAM_CATALOG_V1C.md) para validación, configuración y límites del arranque.
