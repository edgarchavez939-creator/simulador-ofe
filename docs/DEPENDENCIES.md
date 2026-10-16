# Dependencias

Objetivo: eliminar CDNs en producción y servir librerías desde `shared/vendor/` o desde el bundle generado.

Antes de fijar versiones, verificar compatibilidad funcional y repetir QA financiero/PDF/Excel.

## PDF B + C

jsPDF 2.5.1 se sirve desde `shared/vendor/jspdf-2.5.1.umd.min.js`. Es la misma
versión y el mismo contenido previamente cargado desde cdnjs; se verificó el SRI
SHA-512 del recurso original. La licencia MIT está incluida en su encabezado.
Public Sans Regular y Bold se cargan desde `shared/fonts/` y se incrustan en el PDF.
El logo de OFE se sirve desde `shared/branding/ofe-color.png`; no requiere servicios
externos ni una nueva biblioteca gráfica.
