# Simulador de Crédito — Información para DTIC

**Estado al 16 de octubre de 2026**, confirmado por el responsable del proyecto.

## Lo que quedó listo

El aplicativo está desarrollado y su versión anterior fue revisada en Render por el responsable. Esta revisión incorpora la actualización de dependencias; debe desplegarse el nuevo commit para probarla en línea. Cuenta con:

- Simulaciones de crédito, comparación de escenarios, conversor de tasas y exportación a PDF y Excel.
- Pantalla pública sin inicio de sesión y área interna con usuarios, permisos y registro de cambios administrativos.
- Actualización de programas, matrículas e idiomas, además de configuración de parámetros y colores.
- Servicio de consulta y almacenamiento de datos, código fuente y documentación de instalación y operación.
- Bibliotecas y fuentes alojadas en el proyecto, sin cargas de CDN en el navegador; versiones actualizadas y 131 pruebas aprobadas. [Detalle de dependencias](DEPENDENCIES.md).
- Enlace público, código de iframe y vista previa preparados para su incorporación a la web de Uninorte.

## Pendiente por parte de DTIC

1. **Alojamiento institucional:** definir dónde operará el aplicativo, su dirección web y la conservación de los datos y respaldos.
2. **Acceso institucional:** coordinar e implementar la conexión con Microsoft Entra ID y confirmar los usuarios y roles autorizados. Actualmente funciona con cuentas locales del aplicativo.
3. **Portal de Uninorte:** coordinar con el responsable de la web la incorporación del enlace o iframe y las autorizaciones para mostrarlo.
4. **Operación y mantenimiento:** acordar el repositorio institucional, la publicación de futuras versiones y los responsables de soporte.

La solución ya incluye el servicio de datos y la administración. DTIC debe evaluar su adopción o indicar los ajustes necesarios para integrarlos a su infraestructura.

## Pendiente de Jurídica

Los textos de los documentos ya fueron enviados. Está pendiente recibir el concepto y aplicar las observaciones que correspondan. Este pendiente es independiente de la coordinación técnica con DTIC.

**Para consultar:** [simulador público](https://simulador-ofe-pruebas.onrender.com/apps/public/) · [documentación de operación y traslado](AUTONOMOUS_DEPLOYMENT.md) · [integración del enlace o iframe](PUBLIC_INTEGRATION_PLAN.md).
