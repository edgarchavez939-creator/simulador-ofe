# Simulador de Crédito — Oficina de Financiamiento Estudiantil

Aplicación de apoyo a la simulación de crédito educativo de la Universidad del Norte, con una pantalla pública y un área interna para usuarios autorizados.

## Entrega institucional

Revisión del **20 de octubre de 2026**. El responsable informa que el proyecto fue cargado en GitHub institucional. Esta entrega actualiza instrucciones y plantillas para alojarlo en el servidor de DTIC; no realiza un despliegue remoto.

En GitHub institucional debe versionarse el **contenido descomprimido**, con `package.json`, `server/`, `apps/` y `shared/` en la raíz del proyecto desplegable. Un ZIP almacenado como archivo adjunto no ejecuta la aplicación. Al sustituir una entrega anterior, aplicar también las exclusiones registradas en el manifiesto.

**Comenzar por [Despliegue institucional](docs/DESPLIEGUE_INSTITUCIONAL.md)**. Incluye todas las variables, rutas, primer administrador, servicio permanente, HTTPS, iframe, respaldos, restauración, actualización y pruebas de aceptación. Las [plantillas](deploy/README.md) requieren completar dominio, certificados y rutas reales. El aplicativo no carga archivos `.env` automáticamente.

**Se mantiene un único proyecto y servicio**, con pantalla pública y área interna protegida bajo el mismo origen HTTPS, API y base de datos compartidas. Esta arquitectura fue confirmada por el responsable el 20 de octubre de 2026. Microsoft Entra ID continúa pendiente de integración y validación con DTIC. Los textos de exportación ya fueron enviados a Jurídica y continúa pendiente su concepto.

La validación completa de esta entrega terminó con **157 pruebas aprobadas, 0 fallidas**, incluido el arranque normal con entorno externo, reinicio y respaldo consistente. Los motores y valores financieros permanecen preservados. Ver [dependencias locales](docs/DEPENDENCIES.md), [revisión del paquete](docs/DEPURACION_ENTREGA.md) e [información para DTIC](docs/DTIC_INTEGRATION.md).

## Funcionalidades disponibles

- Simulación de corto plazo, corto y largo plazo, banco aliado, cuota inicial, idiomas y reestructuración de crédito.
- Reestructuración con pagos iniciales y condonaciones simuladas por concepto, comparación con el plan vigente y plazo mínimo según capacidad. Importes con separadores mientras se escribe. Ver [uso y límites v21](docs/REESTRUCTURACION_V21.md).
- Beneficios y descuentos, comparación de escenarios, historial de simulaciones y conversor de tasas.
- Exportación a PDF y Excel. Los documentos de Banco Aliado tienen presentación neutra, sin marca institucional. Excel utiliza Aptos Narrow; la aplicación y el PDF utilizan Public Sans.
- Administración de programas, matrículas e idiomas, con edición individual e importación desde Excel. Catálogo base: **29 pregrados y 144 posgrados**, con identificadores únicos.
- Usuarios, permisos por rol y registro de los cambios administrativos en el servidor.
- Configuración de parámetros, colores de marca y acceso público, con enlace, código de iframe, vista previa e interruptores para mostrar u ocultar módulos del menú público.
- Mantenimiento público administrable con aviso institucional, persistencia y bloqueo desde el servidor; la operación interna autorizada se conserva.
- Tres recursos HTTPS de radicación por módulo: Cuota Inicial, Crédito a Corto Plazo y Crédito Corto y Largo Plazo; cada uno compartido por pregrado y posgrado, sin modificar la distribución del documento. Ver [recursos por módulo v20](docs/RECURSOS_POR_MODULO_V20.md) y [mejoras institucionales](docs/MEJORAS_INSTITUCIONALES_V19.md).

El inicio de sesión actual utiliza cuentas locales del aplicativo. La conexión con las cuentas institucionales mediante Microsoft Entra ID está pendiente de coordinación e implementación con DTIC.

## Ambientes de referencia

| Ambiente | Acceso | Alcance |
| --- | --- | --- |
| Render | [Simulador público](https://simulador-ofe-pruebas.onrender.com/apps/public/) · [Acceso interno](https://simulador-ofe-pruebas.onrender.com/login) | Aplicación con servicio de datos, autenticación, administración y auditoría. |
| GitHub Pages | [Simulador público estático](https://edgarchavez939-creator.github.io/simulador-ofe/) | Versión pública con catálogo embebido; no ejecuta el servicio de usuarios ni la administración. |

Estos enlaces corresponden a los ambientes anteriores de referencia; no son la dirección institucional ni se certifica aquí su despliegue actual. En el repositorio anterior, GitHub Pages se publica desde `main` y Render utiliza `feat/dtic-readiness`. Las actualizaciones guardadas en la administración de Render se consultan mediante su servicio de datos y no se sincronizan automáticamente con el catálogo estático de GitHub Pages.

En el servidor institucional, Configuración genera el enlace y el iframe desde `APP_ORIGIN`. La plantilla HTML requiere reemplazar el dominio de ejemplo. Su incorporación se coordina para la página de [Crédito Uninorte](https://www.uninorte.edu.co/web/apoyo-financiero/credito-uninorte). La publicación dentro del portal y las autorizaciones correspondientes se coordinan con DTIC y el responsable de la web.

## Ejecución local de desarrollo

Requisito: **Node.js 24 o posterior**. La aplicación utiliza SQLite para guardar usuarios, catálogo, configuración y auditoría.

```bash
npm run bootstrap-admin
npm start
```

El primer comando crea el administrador inicial si la base está vacía. No existen cuentas predeterminadas. Abrir `http://127.0.0.1:8787`; el administrador gestiona las demás cuentas desde el aplicativo.

Para producción, seguir la guía institucional: `NODE_ENV=production`, origen HTTPS y base persistente fuera del código. Cargar el entorno con `node --env-file=...` o desde el gestor del servicio.

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

- [Módulos públicos, planes de pago y barra de composición](docs/MODULOS_PUBLICOS_Y_PLANES_V18.md).

- [Guía completa de despliegue institucional](docs/DESPLIEGUE_INSTITUCIONAL.md).
- [Plantillas de entorno, systemd, Docker y proxy](deploy/README.md).

- [Resumen para DTIC: lo entregado y lo pendiente](docs/DTIC_INTEGRATION.md).
- [Instalación, respaldo, restauración y traslado](docs/AUTONOMOUS_DEPLOYMENT.md).
- [Acceso público e integración en la web institucional](docs/PUBLIC_INTEGRATION_PLAN.md).
- [Versiones, procedencia y validación de dependencias](docs/DEPENDENCIES.md).
- [Seguridad, sesiones y permisos](docs/SECURITY.md).
- [Configuración de parámetros, colores y vista previa](docs/CONFIGURACION_PUBLICA_COLORES_V11.md).
- [Estado de la revisión de textos por Jurídica](docs/PDF_TEXTS_FOR_LEGAL_REVIEW.md).

Los informes por fase conservan sus resultados y verificaciones de entonces. El [historial P3.1–P3.10](docs/HISTORIAL_P3.md) se mantiene como antecedente; el estado vigente es el descrito en este README y en la entrega a DTIC. Los controles automatizados se ejecutan con `npm test`.
