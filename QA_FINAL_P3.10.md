# QA final — P3.10

## Estado

**Release Candidate (RC)**

## Validaciones completadas

- 10/10 pruebas internas del motor financiero.
- 15/15 rutas funcionales automatizadas con DOM simulado.
- 0 eventos inline.
- 0 IDs duplicados detectados en la auditoría previa.
- 0 variables globales mutables `let`/`var` como fuente de verdad.
- 0 propiedades privadas `window._*`.
- 0 funciones duplicadas entre módulos.
- Datos `PROGRAMAS` / `POSGRADOS` embebidos como JSON no ejecutable.
- CSP sin `unsafe-inline` en `script-src`.
- Sin token GitHub ni cabeceras `Authorization`.
- Dependencias externas fijadas por versión y SRI.
- Marcadores del Actualizador preservados.

## Dependencias externas

- Chart.js 4.4.1
- jsPDF 2.5.1
- SheetJS 0.18.5
- Google Fonts / Inter

Las tres librerías JavaScript se cargan desde cdnjs con versiones exactas y atributos SRI. El paquete no incluye copias locales de esas librerías.

## Validación operativa recomendada antes de producción

Ejecutar una pasada manual en los navegadores institucionales objetivo (Chrome, Edge y Firefox), comprobando navegación, responsive, generación PDF/Excel, importación Excel y actualización de programas.
