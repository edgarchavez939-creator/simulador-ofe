# Program Catalog v1B: identidad técnica del catálogo embebido

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

`ProgramCatalog` ofrece lectura normalizada mediante el adapter `embedded` en Público y OFE. Los simuladores conservan los arrays legacy `PROGRAMAS` y `POSGRADOS`.

## Diagnóstico completo

Las tres copias (`index.html`, `apps/public/index.html` y `apps/ofe/index.html`) contienen los mismos 29 pregrados y 144 posgrados. Al agrupar por el ID original (nivel, subnivel y nombre normalizados), existe un único grupo duplicado; no hay duplicados en pregrado ni filas completamente idénticas.

| Nombre | Subnivel | sourceIndex (desde 0) | Fila (desde 1) | Matrícula COP |
| --- | --- | ---: | ---: | ---: |
| Especialización En Seguridad De La Información | Especialización | 71 | 72 | 20.495.600 |
| Especialización En Seguridad De La Información | Especialización | 72 | 73 | 14.346.600 |

No hay información en el origen que permita atribuir estas filas a una sede, modalidad o código institucional. Se conservan ambas sin inferir esos datos.

## Regla de IDs

- Pregrado: `pregrado:<nombre-slug>`.
- Posgrado: `posgrado:<subnivel-slug>:<nombre-slug>`.
- Si el ID base aparece varias veces en el snapshot completo, **todos** los integrantes reciben `:source-<sourceIndex>`.
- Se mantiene la comprobación final de unicidad. `codigo` permanece en `null`.

El grupo real queda con estos IDs:

```text
posgrado:especializacion:especializacion-en-seguridad-de-la-informacion:source-71
posgrado:especializacion:especializacion-en-seguridad-de-la-informacion:source-72
```

El índice corresponde al array de origen de cada nivel. La normalización ocurre antes de filtrar, por lo que `list()`, las listas filtradas y `get(id)` emplean los mismos IDs. El resultado es determinístico para el mismo snapshot ordenado y no depende de matrícula, idiomas ni semestres. También distingue filas idénticas y colisiones debidas a acentos, mayúsculas o puntuación.

Estos IDs son técnicos y locales al origen embebido: reordenar o insertar filas puede cambiar los sufijos de los grupos duplicados; cambiar la composición de un grupo puede añadir o retirar sufijos. La identidad persistente entre versiones de un futuro catálogo institucional requiere un identificador suministrado por esa fuente.

## Verificación antes del commit

Desde la raíz del repositorio:

```bash
node --test scripts/verify-program-catalog.cjs
```

La prueba ejecuta los scripts reales en el orden del HTML hasta el runtime, con un DOM mínimo para los bloques embebidos. Comprueba la fachada en Público y OFE: 173 registros, 173 IDs únicos, 29 pregrados, 144 posgrados, lectura individual de cada ID, filtros, repetibilidad, códigos nulos y conservación de los arrays legacy. Añade casos de filas idénticas y colisiones de slug, y verifica que cambiar valores económicos no cambie los IDs.

La verificación compara los tres catálogos y las seis copias de `03-finance-core.js` y `07-financing-engine.js` con sus SHA-256 de referencia. No modifica el origen ni ejecuta módulos de UI o cálculos financieros; es una prueba de integración del catálogo con DOM simulado.
