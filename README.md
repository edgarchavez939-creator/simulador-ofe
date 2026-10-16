# Simulador de Crédito — Oficina de Financiamiento Estudiantil

Aplicación de apoyo a la simulación de crédito educativo de la Universidad del Norte, con una pantalla pública y un área interna para usuarios autorizados.

## Estado actual

Actualizado al **16 de octubre de 2026**, conforme a la confirmación del responsable del proyecto:

- La versión en línea de Render está actualizada con los últimos cambios.
- La revisión funcional de la versión actual fue realizada y su funcionamiento fue confirmado por el responsable.
- Los textos de los exportables ya fueron enviados a Jurídica. Está pendiente su concepto y, si corresponde, aplicar sus observaciones.
- La información para el traslado e integración institucional está resumida en [Entrega a DTIC](docs/DTIC_INTEGRATION.md).

## Funcionalidades disponibles

- Simulación de corto plazo, corto y largo plazo, banco aliado, cuota inicial, idiomas y reestructuración de crédito.
- Beneficios y descuentos, comparación de escenarios, historial de simulaciones y conversor de tasas.
- Exportación a PDF y Excel. Los documentos de Banco Aliado tienen presentación neutra, sin marca institucional. Excel utiliza Aptos Narrow; la aplicación y el PDF utilizan Public Sans.
- Administración de programas, matrículas e idiomas, con edición individual e importación desde Excel. Catálogo base: **29 pregrados y 144 posgrados**, con identificadores únicos.
- Usuarios, permisos por rol y registro de los cambios administrativos en el servidor.
- Configuración de parámetros, colores de marca y acceso público, con enlace, código de iframe y vista previa.

El inicio de sesión actual utiliza cuentas locales del aplicativo. La conexión con las cuentas institucionales mediante Microsoft Entra ID está pendiente de coordinación e implementación con DTIC.

## Ambientes y publicación

| Ambiente | Acceso | Alcance |
| --- | --- | --- |
| Render | [Simulador público](https://simulador-ofe-pruebas.onrender.com/apps/public/) · [Acceso interno](https://simulador-ofe-pruebas.onrender.com/login) | Aplicación con servicio de datos, autenticación, administración y auditoría. |
| GitHub Pages | [Simulador público estático](https://edgarchavez939-creator.github.io/simulador-ofe/) | Versión pública con catálogo embebido; no ejecuta el servicio de usuarios ni la administración. |

GitHub Pages se publica desde `main`; Render utiliza `feat/dtic-readiness`. Las actualizaciones guardadas en la administración de Render se consultan mediante su servicio de datos y no se sincronizan automáticamente con el catálogo estático de GitHub Pages.

El enlace y el iframe del servicio público están preparados para incorporarse a la página de [Crédito Uninorte](https://www.uninorte.edu.co/web/apoyo-financiero/credito-uninorte). La publicación dentro del portal y las autorizaciones correspondientes se coordinan con DTIC y el responsable de la web.

## Ejecución local

Requisito: **Node.js 24 o posterior**. La aplicación utiliza SQLite para guardar usuarios, catálogo, configuración y auditoría.

```bash
npm run bootstrap-admin
npm start
```

El primer comando crea el administrador inicial si la base está vacía. No existen cuentas predeterminadas. Abrir `http://127.0.0.1:8787`; el administrador gestiona las demás cuentas desde el aplicativo.

La base local se guarda por defecto en `var/ofe.sqlite`, fuera del repositorio. El historial de simulaciones se conserva en el navegador; no es un archivo central de expedientes.

## Estructura principal

- `apps/public/`: pantalla pública de simulación.
- `apps/ofe/`: aplicación interna y administración.
- `server/`: autenticación, permisos, servicio de datos, migraciones y auditoría.
- `shared/`: catálogo, configuración, componentes visuales y exportables compartidos.
- `scripts/`: controles automatizados y utilidades de verificación.
- `docs/`: documentación de uso, operación e integración.

La entrada raíz de GitHub Pages conduce a `apps/public/`. La publicación debe conservar los recursos y las rutas del proyecto; un archivo HTML aislado no contiene toda la aplicación.

Los programas se actualizan en el área administrativa del servicio, con validación, control de permisos y registro de cambios. Los antiguos flujos de PIN y reemplazo manual del HTML se conservan únicamente como antecedentes.

## Documentación de entrega

- [Resumen para DTIC: lo entregado y lo pendiente](docs/DTIC_INTEGRATION.md).
- [Instalación, respaldo, restauración y traslado](docs/AUTONOMOUS_DEPLOYMENT.md).
- [Acceso público e integración en la web institucional](docs/PUBLIC_INTEGRATION_PLAN.md).
- [Seguridad, sesiones y permisos](docs/SECURITY.md).
- [Configuración de parámetros, colores y vista previa](docs/CONFIGURACION_PUBLICA_COLORES_V11.md).
- [Estado de la revisión de textos por Jurídica](docs/PDF_TEXTS_FOR_LEGAL_REVIEW.md).

Los informes por fase conservan sus resultados y verificaciones de entonces. El [historial P3.1–P3.10](docs/HISTORIAL_P3.md) se mantiene como antecedente; el estado vigente es el descrito en este README y en la entrega a DTIC. Los controles automatizados se ejecutan con `npm test`.
