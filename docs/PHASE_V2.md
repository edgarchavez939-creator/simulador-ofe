# Informe de implementación — fase v2

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

Fecha de validación: 15 de octubre de 2026. Base: `479852f`, rama `feat/dtic-readiness`.

## Auditoría previa y límites preservados

La versión existente era HTML/CSS/JavaScript modular, con estado en `SimuladorOFE.state`, catálogo embedded detrás de `ProgramCatalog`, historial en localStorage, exportadores y permisos visuales. No había backend, base ni autenticación real. Se reutilizan runtime, fachada de catálogo, validación, componentes DS, navegación, amortización, comparación y exportadores.

Los tres snapshots embedded conservan exactamente 29 pregrados y 144 posgrados, sus valores y 173 IDs únicos. No se inventan códigos institucionales. Los archivos `03-finance-core.js` y `07-financing-engine.js` de raíz, público y OFE no se modifican. El servidor importa ese catálogo una sola vez para iniciar su base; reiniciar no sobrescribe cambios administrativos.

## A. Reinicio por programa

`shared/simulation/lifecycle.js` centraliza el cambio real de identidad y la limpieza. Se aplica a CP, mixto, banco y cuota inicial, incluyendo idiomas cuando pertenece al mismo contexto. Un resultado previo invalida cálculos, proyecciones, amortizaciones, gráficas, descuentos, valores derivados, escenarios temporales y avisos. Las acciones de PDF leen el resultado actual: sin resultado ya no exportan datos anteriores. La época del cálculo evita que un trabajo ya encolado publique el resultado del programa anterior.

El nuevo programa queda seleccionado, con su matrícula readonly. A → B → A exige recalcular. Antes de simular solo se actualiza la selección. Tema, sesión, configuración y registros del historial no se borran. No hay recarga completa por cambio de programa. Reestructuración no tiene programa en el modelo real y conserva su contexto independiente.

## B. Dark Mode

Se recalibran los tokens existentes de superficie de página/panel/elevada/resultado, texto de título/cuerpo/etiqueta/métrica/atenuado, acción principal/secundaria, acento rojo/dorado, éxito/advertencia/error/información, borde normal/fuerte/sutil, foco, overlay, sombras, hover, seleccionado, grilla y colores de gráficos. Fondos azul gris, textos suaves y dorado moderado mantienen la identidad.

Se aplican a cards, resultados, navegación, cabecera, tablas alternadas, formularios, readonly, placeholder, deshabilitado, foco, modales, selectores, idiomas, login y administración. Las nuevas reglas de componentes consumen tokens; los nuevos valores de color se definen en el tema. `shared/theme.js` restaura la preferencia antes de pintar y actualiza Chart.js al cambiar el tema, sin alterar cálculos. Se corrigió una incompatibilidad de Chart.js al enumerar sus opciones resueltas: el complemento modifica opciones de configuración originales.

Contraste calculado de las nuevas parejas oscuras: cuerpo/panel 10,60:1; atenuado/elevada 6,36:1; texto/botón principal 6,46:1; dorado/panel 6,85:1; acento/selección 5,17:1. Es una medición de tokens representativos, no una certificación completa de accesibilidad.

## C. Reestructuración v2

Situación actual → propuesta → capacidad opcional → resultado, con saldo y propuesta comparables. Se conserva la fórmula: saldo = capital + intereses corrientes causados + mora; principal = saldo + costos financiados; amortización común con la tasa y el plazo nuevos. Capacidad e ingresos son informativos y no alteran principal, tasa ni cuota. No se inventan cuota vigente, plazo restante ni ahorro frente al crédito actual.

Se encontraron funciones de escenarios referenciadas pero ausentes: se restauraron guardar, comparar y eliminar con instantáneas independientes. Ahora hay validación junto al campo, formatos COP estrictos con decimales, rechazo de negativos/vacíos/ambiguos, tasa cero válida, plazo entero 1–600 y montos hasta 10^12. Modificar una entrada invalida el resultado hasta recalcular. Reiniciar limpia formulario y resultado; navegar y cambiar tema no destruye el escenario. PDF individual y comparativa usan el exportador vigente y documentan costos financiados y límites de la comparación.

## D. Autenticación

Servicio Node >=24, SQLite persistente y migración al arrancar. El proveedor local autentica; el usuario interno con UUID conserva rol y permisos. El adaptador `OFEAuth` consume sesiones reales. La futura integración de identidad institucional tiene un punto de sustitución en login y vinculación de usuario, sin trasladar permisos a la identidad externa.

Contraseñas con scrypt y sal; sesiones opacas en cookie protegida; CSRF, origen exacto, caducidad absoluta e inactividad, límites de login y revocación. Ningún secreto en frontend o localStorage. Primer administrador por terminal interactiva, sin credenciales permanentes. Desde Usuarios se crean/editan/activan/desactivan cuentas, cambian roles y restablecen contraseñas; cada cuenta puede cambiar la propia. No se elimina físicamente un usuario. Los controles de seguridad y sus límites están en [SECURITY](SECURITY.md).

## E. Roles y permisos

| Acción | simulator_user | program_admin | system_admin |
|---|---:|---:|---:|
| Simular, consultar programas, generar documentos | Sí | Sí | Sí |
| Actualizar programas / matrículas | No | Sí | Sí |
| Consultar auditoría de programas | No | Sí | Sí |
| Crear y editar usuarios | No | No | Sí |
| Cambiar roles / estado / restablecer contraseña | No | No | Sí |
| Consultar auditoría completa | No | No | Sí |
| Cambiar contraseña propia / cerrar sesión | Sí | Sí | Sí |

Permisos: `simulator.use`, `programs.view`, `programs.update`, `users.read`, `users.create`, `users.update`, `users.disable`, `audit.read`. El backend valida en cada operación; program_admin está limitado a auditoría del módulo programs incluso si altera el filtro manualmente. La interfaz no sustituye esta validación. No se expone edición de tasas institucionales o permisos arbitrarios que no existía en el alcance aprobado.

## F. Programas y auditoría

La administración escribe la base propia por ID estable; no modifica HTML ni arrays embedded. Puede editar nombre, matrícula, idiomas, semestres y estado dentro del modelo autorizado. No cambia nivel, subnivel, ID ni código institucional. Debe quedar un programa activo para arrancar el catálogo. La plantilla Excel incluye ID y versión, carga valores actuales, distingue homónimos, muestra propuesta y bloquea filas inválidas o versiones antiguas. El lote se guarda en una transacción.

Eventos iniciales: `ADMIN_BOOTSTRAP`, `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `USER_CREATE`, `USER_UPDATE`, `USER_ROLE_CHANGE`, `USER_ACTIVATE`, `USER_DEACTIVATE`, `PASSWORD_CHANGE`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_COMPLETED`, `PROGRAM_UPDATE`, `ADMIN_REQUEST_FAILURE`.

Campos de audit_log: UUID, timestamp UTC, actor_user_id/name/email como instantánea, action, module, entity_type/id/name, field_name, old_value, new_value, result, request_id y metadata. Una edición genera una fila por campo y comparte request_id. Restablecimientos no registran contraseñas ni hashes. Los cambios y su auditoría se confirman juntos; un fallo revierte ambos. Las consultas aceptan desde/hasta UTC, actor ID/correo, acción, módulo y paginación de 100 filas. La interfaz presenta fecha local y advierte que el filtro de días es UTC.

## G. Migración

Nueva: `server/migrations/001-autonomous.sql`. Crea roles, permissions, role_permissions, users, sessions, programs, audit_log, login_attempts e índices. El migrador registra la versión en schema_migrations y ejecuta esquema y semillas en transacción. Semillas: tres roles, permisos y los 173 programas originales. No hay seed de usuarios. Los cambios posteriores persisten entre arranques. El respaldo consistente y su restauración se documentan en [operación](AUTONOMOUS_DEPLOYMENT.md).

## H. Verificación

Suite completa: **79 pruebas aprobadas, 0 fallidas**, ejecutadas con Node 24.22.0. Incluye catálogo/contratos/IDs, selectores, capacidad, totales/aportes, idiomas, validación de importación, regresión financiera, reinicio de ocho combinaciones público/OFE, A → B → A, cancelación de cálculo pendiente y escenarios de reestructuración.

Backend: bootstrap único, hashes, payloads sin secretos, login/logout, 401/403, rutas directas protegidas, CSRF/origen, expiración absoluta/inactividad, desactivación y revocación, usuario duplicado, cambio/reset obligatorio, versión antigua, último administrador, auditoría por campo, homónimos por ID, rollback ante fallo de auditoría o lote inválido, ámbito del auditor de programas, throttling, cookie Secure, migración, reinicio y respaldo íntegro.

Prueba de navegador en un servicio local real y base descartable: login, catálogo API, cálculo y cambio Arquitectura → Medicina con resultado limpio, formulario de usuarios, edición de programa, carga Excel → revisión → guardado → consulta de auditoría, reestructuración con separadores y decimales, recalcular, escenarios y comparación, Light ↔ Dark conservando resultados y gráficos. QA responsive a 390 y 768 píxeles sin desbordamiento de página; tablas con desplazamiento interno. Se corrigió el estado hidden de botones que la regla display del DS volvía visibles.

PDF: exportador real con jsPDF y canvas, informe de 24 cuotas de tres páginas y comparativa de una página. Se renderizaron e inspeccionaron todas las páginas: alineación, encabezados, totales, amortización, notas y cierre en saldo cero. Las pruebas y datos de QA no crean cuentas ni cambian matrículas en la base de producción.

Se probaron además el bootstrap interactivo con entrada oculta y la copia consistente de una base persistente. Docker no está instalado en el equipo: construcción de imagen, publicación Render y restauración en infraestructura remota quedan pendientes. La versión pública en línea no incorpora automáticamente este servicio.

## I. Archivos

Los siguientes nombres son relativos a la raíz del repositorio.

### Modificados

| Archivo | Cambio |
|---|---|
| `.gitignore` | Excluir base, WAL/SHM, secretos y dependencias locales. |
| `README.md` | Inicio autónomo y estado actual. |
| `docs/SECURITY.md` | Controles reales, alcance y límites. |
| `docs/DEPLOYMENT.md` | Distinguir Pages y servidor autónomo. |
| `docs/DTIC_INTEGRATION.md` | Nueva decisión y futura vinculación institucional. |
| `apps/ofe/config.js` | Activar API solo con configuración emitida por servidor. |
| `apps/ofe/index.html` | Flujo Reestructuración v2 y carga de módulos compartidos. |
| `apps/public/index.html` | Tema temprano y ciclo de reinicio compartido. |
| `apps/ofe/simulador-assets/js/00-runtime.js` | Refrescar fachada y separar historial por usuario interno. |
| `apps/ofe/simulador-assets/js/01-core-ui.js` | Reinicio, cancelación, tema, navegación y permisos. |
| `apps/public/simulador-assets/js/01-core-ui.js` | Reinicio, cancelación y actualización de gráficos del tema. |
| `apps/ofe/simulador-assets/js/02-reestructuracion.js` | Validación, entradas, resultados y escenarios v2. |
| `apps/ofe/simulador-assets/js/06-actions-history.js` | Restaurar capacidad de reestructuración y tasa cero. |
| `apps/ofe/simulador-assets/js/08-updater.js` | Plantilla actual identificada, preservar validador anterior. |
| `apps/ofe/simulador-assets/js/10-pdf-aptos.js` | Capacidad, costos y notas del informe de reestructuración. |
| `apps/ofe/simulador-assets/styles.css` | Tokens, estados, administración, login y reestructuración. |
| `apps/public/simulador-assets/styles.css` | Misma calibración DS y hidden consistente. |
| `shared/auth/auth-adapter.js` | Sesión/API reales sin secretos persistidos en cliente. |
| `shared/auth/permissions.js` | Catálogo central de permisos y cierre ante fallo. |
| `shared/program-catalog/catalog-import.js` | Propuesta Excel por ID/versión y campos autorizados. |
| `scripts/test-support/selector-context.cjs` | Contexto de pruebas de importer y reestructuración. |
| `scripts/verify-functional-v1e.cjs` | Mensaje de publicación ahora exige API autenticada. |

### Nuevos

| Archivo | Función |
|---|---|
| `package.json` | Arranque, bootstrap y suite sin dependencias de servidor. |
| `Dockerfile` | Imagen portátil Node 24. |
| `.dockerignore` | Evitar copiar secretos y datos en la imagen. |
| `render.yaml` | Despliegue manual con volumen persistente. |
| `server/app.cjs` | HTTP, login, sesiones, API, permisos y recursos protegidos. |
| `server/security.cjs` | Scrypt, tokens y huellas. |
| `server/store.cjs` | Migraciones, semillas, transacciones, permisos y auditoría. |
| `server/start.cjs` | Configuración y ciclo de vida del proceso. |
| `server/bootstrap.cjs` | Primer administrador por terminal interactiva. |
| `server/backup.cjs` | Copia consistente SQLite. |
| `server/container.cjs` | Permisos del volumen y descarte de privilegios. |
| `server/migrations/001-autonomous.sql` | Esquema inicial versionado. |
| `shared/auth/login.html` | Formulario accesible de acceso/cambio de contraseña. |
| `shared/auth/login.js` | Login real, tema y cambio obligatorio/personal. |
| `shared/admin/admin-ui.js` | Usuarios, programas/Excel, auditoría y cuenta. |
| `shared/simulation/lifecycle.js` | Invalidez y reinicio central por programa. |
| `shared/theme.js` | Preferencia temprana y tema de gráficos. |
| `scripts/verify-phase-v2.cjs` | Reinicio, reestructuración e importación identificada. |
| `scripts/verify-server.cjs` | Autenticación, autorización, auditoría y persistencia. |
| `docs/AUTONOMOUS_DEPLOYMENT.md` | Operación local, Render, respaldos y traslado a DTIC. |
| `docs/PHASE_V2.md` | Este informe y trazabilidad de la entrega. |

**Archivos eliminados: ninguno.**
