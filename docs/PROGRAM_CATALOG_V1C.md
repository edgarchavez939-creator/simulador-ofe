# Program Catalog v1C: lectura remota y arranque asíncrono

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

Público y OFE mantienen `embedded` como proveedor activo. El arranque espera la lectura y validación completas del catálogo antes de inicializar cualquier módulo. Los selectores y motores financieros siguen usando el puente temporal `PROGRAMAS` / `POSGRADOS`.

## Contrato común de lectura

Los adaptadores `embedded`, `mock` y `api` declaran `source`, `capabilities`, `list(params)` y `get(id)`.

- `source`: `embedded`, `mock` o `api`. La URL se mantiene separada (`url` para mock, `baseUrl` para API).
- `list(params)`: promesa de un array inmutable de programas validados; filtros `nivel`, `subnivel`, `activo` (booleano) y `q`.
- `get(id)`: promesa de un programa validado o `null` si no existe; el ID recibido debe corresponder al solicitado.
- `capabilities`: `read`, `write`, `import`, `history`. Embedded y mock son de solo lectura. API conserva los métodos administrativos del scaffold; sus capacidades describen operaciones disponibles, no permisos del usuario. La autorización sigue siendo responsabilidad del servidor institucional.

La fachada vuelve a validar las lecturas, incluso para proveedores personalizados. No se generan IDs ni códigos para respuestas remotas: deben venir de la fuente. `codigo` puede estar ausente o ser `null`; solo se conserva un código cuando la fuente lo suministra.

`snapshot()` sigue siendo una extensión síncrona del proveedor embedded, no un requisito para proveedores remotos.

## Validación y transporte

El adaptador remoto admite un array JSON o `{ "programs": [...] }`. Requiere IDs únicos, nombres no vacíos, nivel conocido, matrícula numérica finita no negativa y `activo` booleano. Posgrado requiere `subnivel`. Valida también idiomas, semestres e índice de origen cuando se suministran. No convierte matrículas inválidas a cero ni strings a números.

En v1C, `list()` obtiene el catálogo completo y aplica filtros localmente para conservar la misma semántica que embedded. No hay paginación ni caché remota implementadas. `get()` usa `/programs/{id}` y codifica el ID en la URL; una respuesta 404, 204 o JSON `null` devuelve `null`. Un 204 en `list()` es inválido.

El transporte usa credenciales del mismo origen, un tiempo de espera configurable y errores separados para HTTP, conexión y JSON inválido. No sustituye el proveedor por embedded ante fallos.

## Arranque y compatibilidad

`SimuladorOFE.init()` comparte una única inicialización entre llamadas concurrentes y espera `SimuladorOFE.catalog.ready()`. Se puede consultar `SimuladorOFE.state.catalog.status` (`idle`, `loading`, `ready`, `error`) y `error`. Tras cargar, `SimuladorOFE.catalog.programs` contiene el catálogo validado del arranque. La carga se conserva durante esa sesión; no es una actualización en vivo del catálogo.

Los arrays legacy se publican después de validar y antes de iniciar módulos:

- Embedded conserva su snapshot original, con los 29 pregrados y 144 posgrados y sus valores intactos.
- Mock/API convierten los registros activos en filas legacy, preservando nombres y valores y congelando los arrays. Los inactivos siguen disponibles en la fachada, pero no aparecen en los selectores legacy.
- Un catálogo vacío, inválido o sin registros activos bloquea el arranque.

Durante la carga, el formulario permanece sin interacción y muestra “Cargando programas…”. Si falla el arranque, mantiene el formulario bloqueado y muestra una indicación para recargar. Los detalles técnicos permanecen en la consola. Una carga fallida libera la inicialización para permitir un nuevo intento; los módulos ya inicializados no se repiten.

## Configuración

Las dos aplicaciones conservan:

```js
catalog: {
  provider: 'embedded',
  apiBaseUrl: '/api',
  mockUrl: '../../data/mock-program-catalog.json',
  requestTimeoutMs: 15000,
  cache: true
}
```

`cache` es la opción heredada del scaffold; v1C no activa `catalog-cache.js`. Cambiar a `api` o `mock` es una configuración de arranque y requiere recargar la aplicación. Los adaptadores también permiten crear una instancia configurada con `withConfig(...)`, sin modificar su instancia predeterminada.

El archivo mock existente contiene **un programa de ejemplo** y permanece intacto. No representa el catálogo institucional ni es la fuente activa. Las pruebas generan sus respuestas de 173 registros desde el catálogo embebido en memoria, sin crear archivos de datos institucionales adicionales.

## Verificación

```bash
node --test scripts/verify-program-catalog.cjs scripts/verify-program-catalog-v1c.cjs
```

Las pruebas ejecutan el orden real de scripts hasta el runtime con un DOM mínimo y transporte simulado. Cubren ambos simuladores, tres proveedores, carga pendiente, arranque concurrente, filtros, lectura de IDs, programas inactivos, respuestas inválidas, errores HTTP/conexión/JSON, timeout, recuperación y estados visibles del bootstrap. La regresión v1B verifica los tres catálogos y las seis copias financieras por SHA-256.

La conexión con una API real y la autenticación institucional dependen de DTIC. La migración de los selectores a objetos/IDs de `ProgramCatalog` continúa como un siguiente hito; v1C conserva la compatibilidad legacy.
