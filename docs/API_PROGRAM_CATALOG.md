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
`id`, `codigo`, `nombre`, `nivel`, `valorMatricula`, `valorIdiomas`, `activo`, `vigenciaDesde`, `vigenciaHasta`, `version`, `updatedAt`.
