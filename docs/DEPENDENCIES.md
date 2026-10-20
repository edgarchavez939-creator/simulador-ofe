# Dependencias del navegador

Actualizado el 16 de octubre de 2026. Las tres entradas (`index.html`, `apps/public/` y `apps/ofe/`) cargan las bibliotecas desde `shared/vendor/`, con integridad SRI SHA-384. No solicitan scripts, estilos ni fuentes a CDN. Public Sans y los recursos de marca también se sirven desde el proyecto.

| Biblioteca | Versión incluida | Uso | Distribución oficial y licencia |
| --- | --- | --- | --- |
| jsPDF | 4.2.1 | Exportación PDF | [Release oficial](https://github.com/parallax/jsPDF/releases/tag/v4.2.1), paquete npm verificado; MIT |
| SheetJS CE | 0.20.3 | Lectura de las plantillas Excel de programas | [Standalone oficial](https://docs.sheetjs.com/docs/getting-started/installation/standalone/); Apache-2.0 |
| Chart.js | 4.5.1 | Gráficos de simulación | [Release oficial](https://github.com/chartjs/Chart.js/releases/tag/v4.5.1), paquete npm verificado; MIT |
| ExcelJS | 4.4.0 | Generación de Excel y plantillas | [Release oficial](https://github.com/exceljs/exceljs/releases/tag/v4.4.0); MIT. El archivo existente coincide con el paquete oficial. |

Las licencias acompañan a los archivos. El [manifiesto](../shared/vendor/dependencies.json) registra origen, tamaño, SHA-256 e integridad SRI. En los paquetes npm se verificó además el SHA-512 del archivo de distribución antes de extraer la biblioteca. SheetJS se obtuvo de su distribuidor oficial: `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`; no del paquete npm antiguo.

## Alertas de SheetJS

La versión pública de `xlsx` en npm sigue desactualizada. La consulta de OSV para `xlsx` 0.20.3 devuelve las dos alertas del ecosistema npm con intervalos abiertos, por lo que no se presenta ese resultado como un análisis sin alertas.

Para la distribución oficial que se incluye aquí, los avisos del fabricante indican:

- [CVE-2023-30533](https://cdn.sheetjs.com/advisories/CVE-2023-30533): afecta versiones hasta 0.19.2; corregida desde 0.19.3.
- [CVE-2024-22363](https://cdn.sheetjs.com/advisories/CVE-2024-22363): afecta versiones hasta 0.20.1; corregida desde 0.20.2.

El archivo incluido declara `XLSX.version = 0.20.3`, posterior a ambas correcciones. Es necesario conservar la procedencia del manifiesto cuando DTIC evalúe las alertas de un escáner basado exclusivamente en npm. Esto no constituye una garantía de ausencia de otras vulnerabilidades; las versiones requieren seguimiento.

## Cabeceras y alcance

El servidor entrega CSP con `script-src 'self'` y `font-src 'self' data:`, sin los antiguos permisos para cdnjs ni Google Fonts. Mantiene `style-src 'self' 'unsafe-inline'` porque la interfaz actual genera estilos en línea. La política de `frame-ancestors`, HSTS en HTTPS y `nosniff` se mantiene en el servidor.

Las páginas conservan una CSP meta de respaldo para el alojamiento estático. GitHub Pages no permite configurar todas las cabeceras de respuesta necesarias: la instalación institucional debe usar el servidor o un proxy configurado por DTIC. La administración requiere el servicio propio de datos; alojar recursos localmente no convierte esa parte en una aplicación sin conexión.

La entrega institucional posterior incorpora una prueba de arranque, persistencia y respaldo y suma **132 pruebas aprobadas**; véase [guía institucional](DESPLIEGUE_INSTITUCIONAL.md). Las verificaciones siguientes registran la actualización original de dependencias del 16 de octubre.

## Validación de esta actualización

- Batería completa: **131 pruebas aprobadas**, ninguna fallida.
- Los seis escenarios de exportación conservan exactamente el modelo de datos de referencia. Las diez páginas PDF conservan su texto normalizado y dimensiones; se revisó su presentación.
- PDF y Excel de Banco Aliado conservan la presentación neutra. El Excel mantiene sus dos hojas legibles y los importes de referencia.
- La plantilla operativa se genera con ExcelJS y se lee con SheetJS 0.20.3: **173 programas**, identificadores y valores preservados; se comprueban cambios de matrícula e idiomas y el rechazo de valores negativos.
- En un servidor local con base de datos en memoria se probó inicio de sesión, importación, confirmación y consulta pública de los cambios. Los datos sintéticos no se aplicaron al catálogo de producción.
- En el navegador se verificó el gráfico con Chart.js local y la ausencia de errores de consola durante los flujos comprobados.
- Los archivos de los motores financieros y el catálogo base permanecen intactos. Esta actualización no cambia condiciones, fórmulas ni valores oficiales.

Para futuras actualizaciones: verificar la procedencia oficial, renovar manifiesto y SRI, retirar el archivo sustituido y ejecutar `npm test` más una revisión de importación, gráficos y exportables. Las pruebas de integridad incluidas detectan cambios en los archivos distribuidos.
