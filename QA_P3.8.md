# QA funcional P3.8

## Resultado

**15/15 rutas funcionales superadas** en el harness de DOM simulado.

| Ruta | Estado |
|---|---|
| Pruebas internas del motor financiero (10/10) | OK |
| Crédito a Corto Plazo | OK |
| Corto y Largo Plazo | OK |
| Crédito Banco Aliado | OK |
| Cálculo de Cuota Inicial | OK |
| Financiación de Idiomas | OK |
| PDF/Excel de Idiomas + PDF combinado | OK |
| Conversor de Tasas | OK |
| Reestructuración de Crédito | OK |
| Escenarios + historial | OK |
| PDF/Excel Corto Plazo | OK |
| PDF/Excel Mixto | OK |
| PDF/Excel Banco Aliado | OK |
| PDF/Excel Cálculo de Cuota Inicial | OK |
| Reemplazo PROGRAMAS/POSGRADOS del Actualizador | OK |

## Hallazgos corregidos durante el QA

1. Existían funciones duplicadas de actualización de aportes que dependían del orden de carga.
2. Una implementación antigua de `actualizarAportes()` referenciaba IDs eliminados (`pct1`, `cont1`).
3. Existían funciones y shims sin referencias después de la migración a eventos delegados.
4. Al agregar un beneficio, el foco buscaba una clase antigua inexistente. Se corrigió en simulaciones generales e Idiomas.
5. Persistían textos visibles con la terminología anterior “refinanciación”. Se normalizaron a “reestructuración”.
6. Se retiraron reglas CSS específicas de componentes ya eliminados o reemplazados.

## Alcance y limitación

El QA se ejecutó con un DOM simulado en Node y mocks de Chart.js, jsPDF y SheetJS para recorrer las rutas de lógica y exportación sin navegador real. Las 10 pruebas matemáticas del motor se ejecutaron con las funciones reales del proyecto.

Chromium headless disponible en el entorno no produjo salida utilizable, por lo que **P3.8 no se presenta como prueba visual real de navegador**. Ese alcance corresponde al Bloque C / P3.9.
