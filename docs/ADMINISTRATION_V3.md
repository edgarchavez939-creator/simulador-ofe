# Administración y configuración global — v3

Implementación para `feat/dtic-readiness`. Validación con Node 24.22.0. No requiere nuevos servicios, paquetes ni suscripciones.

## Resultado

- **Usuarios:** búsqueda combinada de nombre/correo, rol y estado; limpiar filtros; conteo; páginas de 20 registros; fechas de creación/actualización; estados con texto; acciones contextuales para editar/rol, restablecer contraseña y activar/desactivar. Se conservan las protecciones del último administrador y el cierre de sesiones al cambiar acceso.
- **Auditoría:** fechas UTC, usuario por nombre/correo/ID, módulo, acción, entidad por nombre/ID y resultado. Las fechas de los registros se presentan en la zona horaria del navegador. Detalle expandible con actor, fecha, acción, módulo, entidad, identificador, campo, anterior/nuevo, resultado y referencia de soporte. El administrador de programas sigue limitado a eventos de programas en el servidor.
- **Programas:** multiselección de nivel, búsqueda combinable, estado, conteo y páginas de 20; nombres completos con espacio; matrícula y fecha de actualización. Sin códigos institucionales, facultades ni vigencias inventados. Edición con valor actual/nuevo y confirmación; Excel conserva previsualización, confirmación y transacción completa. Los registros antiguos muestran «Sin cambios» hasta su primera actualización registrada.
- **Configuración:** resumen compacto, grupos Simulación/Garantisa, ayudas, validaciones, revisión y confirmación. El administrador del sistema tiene `settings.read` y `settings.update`. Los otros dos roles no tienen esos permisos.
- **Reestructuración:** icono de saldo integrado en una fila flexible con alineación central; mismo patrón para etiquetas, iconos y encabezados del módulo, sin desplazamientos específicos.

Se usan los componentes y tokens existentes. En móvil, los filtros se apilan y las tablas conservan desplazamiento horizontal propio, accesible con teclado. No hay desbordamiento horizontal de la página.

## Parámetros administrables: lista completa

Los porcentajes se almacenan en unidades porcentuales: `4.17` significa `4,17 %`, no `417 %`. La migración comienza con los valores originales; los valores usados en pruebas no reemplazan los datos del proyecto.

| Nombre | Clave interna | Valor anterior | Valor inicial por defecto | Validación del servidor | Modalidades afectadas |
|---|---|---:|---:|---|---|
| Tasa inicial (% M.V.) | `default_interest_rate` | 1,53 % | 1,53 % | Número finito, 0–10, hasta 2 decimales | Corto plazo, mixto, banco aliado, cuota inicial y nueva propuesta de reestructuración; idiomas hereda la tasa elegida en su simulación de origen |
| Cuotas iniciales | `default_installments` | 6 meses | 6 meses | Entero, 1–60 | Corto plazo, porción CP del mixto y cuota inicial; idiomas hereda el plazo de origen |
| Aporte total Garantisa CP | `garantisa_cp_percent` | 4,17 % | 4,17 % | Número finito, 0–100, hasta 2 decimales | Corto plazo, capital CP del mixto, idiomas CP y cuota inicial |
| Aporte total Garantisa LP | `garantisa_lp_percent` | 2,86 % | 2,86 % | Número finito, 0–100, hasta 2 decimales | Capital LP del mixto, idiomas mixtos y capital de cada período de sus proyecciones |

Los límites de 10 % y 60 cuotas son límites de compatibilidad **del valor inicial común**, tomados de los controles existentes. No introducen límites generales nuevos para los cálculos de cada modalidad. Una tasa cero y un aporte cero son válidos. No se aceptan cadenas, claves desconocidas, cuotas fraccionarias ni valores fuera del rango.

**Garantisa:** el cálculo existente aplica el aporte al monto financiado de la porción correspondiente, después de los beneficios y el pago de contado. Se paga inicialmente y no se capitaliza en la amortización. Se administra el porcentaje total existente, sin agregar un segundo IVA. No se encontraron escalas por monto/plazo, mínimos monetarios ni máximos monetarios adicionales. Banco Aliado y Reestructuración no reciben un aporte Garantisa nuevo.

## Vigencia y conservación de resultados

La tabla `global_settings` guarda valores, versión, `updated_at` y `updated_by`. Cada cambio genera un evento por parámetro en la misma transacción. Los valores anteriores y nuevos, sus fechas y el identificador común de solicitud permiten reconstruir la sucesión de cambios; el estado inicial queda definido por la migración. No se incorporan vigencias futuras que el negocio actual no utiliza.

La configuración vigente se consulta al abrir la aplicación, al iniciar otra simulación y al preparar un cálculo sin resultado previo. Los campos modificados expresamente por el operador se conservan al preparar el cálculo. «Nueva simulación» carga los nuevos valores iniciales. Banco Aliado conserva sus 12 meses y Reestructuración sus 24 meses.

Cada resultado nuevo, incluidos idiomas y proyecciones, conserva `settingsSnapshot` con sus valores y versión. Editar la configuración no recalcula ni modifica resultados mostrados, escenarios guardados o documentos. Recalcular un escenario existente conserva su configuración capturada; iniciar otro permite adoptar la vigente. PDF y Excel muestran los porcentajes del propio resultado. Para registros antiguos sin snapshot, el porcentaje se recupera de sus propios importes cuando están disponibles.

La adaptación ocurre fuera de `03-finance-core.js` y `07-financing-engine.js`: conserva los parámetros durante cada llamada síncrona al motor y adapta únicamente las etiquetas Garantisa de la presentación. No cambia fórmulas ni reescribe esos archivos. Las comprobaciones internas de regresión se ejecutan en un contexto aislado con los porcentajes originales de referencia, para evitar falsas alarmas después de un cambio administrativo.

## Valores evaluados y descartados de configuración

| Valor o familia | Clasificación | Decisión y motivo |
|---|---|---|
| Tasa inicial, cuotas comunes y aportes CP/LP | Configuración administrativa | Los cuatro campos anteriores son editables con autorización y auditoría. |
| 12 meses de Banco Aliado y 24 de Reestructuración | Regla/predeterminado específico de modalidad | Se mantienen; el plazo común de CP no los sobrescribe. El operador conserva el plazo por escenario. |
| Plazo LP al graduarse y equivalencias semestre/mes, 1,5 veces período de estudio | Regla de negocio | Se conserva la regla actual; no se convierte en una preferencia administrativa. |
| Distribución CP/LP 40/60, semestres e IPC inicial de proyección | Condiciones del escenario / regla de negocio | Se mantienen sus controles actuales. No se impone una distribución o un IPC global nuevo. |
| Plazos mínimos/máximos por modalidad; 600 cuotas y monto hasta 10^12 en Reestructuración | Validación y límite operativo existente | No se habilita su modificación administrativa sin definición de negocio adicional. Se conservan las validaciones por escenario. |
| Mínimo/máximo de financiación y cuota inicial mínima | Regla de negocio no universal | No existe una política global única en el código que pueda trasladarse con fidelidad. No se inventan límites ni porcentajes mínimos. |
| Mínimo/máximo monetario y escalas Garantisa | Regla no existente | No se crean escalas o importes sin fuente. Se conserva la base real CP/LP. |
| Amortización, interés, precisión interna y tolerancias | Constante técnica / algoritmo financiero | Protegidos. No administrables. |
| Redondeo COP a pesos, formato es-CO y decimales de presentación | Constante técnica de presentación | Se mantiene separado de la precisión del cálculo; no se crea un redondeo de negocio editable. |
| Modalidad inicial y rutas | Constante técnica de navegación | Sin preferencia global de negocio existente; se conserva la navegación actual. |
| `effective_from` / `effective_to` | Regla de vigencia no requerida | Fecha de actualización, versión y auditoría cubren el cambio inmediato actual. |
| Roles/permisos, sesión, CSRF, contraseñas y límites de seguridad | Constante técnica de seguridad | No editables en Configuración. |
| Colores, espaciado, tipografía y temas | Token visual | Se usan los tokens actuales Uninorte, sin nuevos colores en componentes. |

## API y eventos

- `GET /api/admin/settings`: exige `settings.read`; valores, versión, metadatos y definiciones.
- `PUT /api/admin/settings`: exige `settings.update`, origen válido y CSRF; `{version, changes}`. Conflicto de versión: 409; validación: 422; acceso no autorizado: 401/403. Cambio y auditoría son indivisibles.
- `GET /api/simulation-settings`: solo usuarios autenticados con `simulator.use`; entrega los parámetros necesarios para operar, sin otorgar lectura o escritura del área administrativa.
- `GET /api/admin/audit`: conserva el alcance por rol; agrega entidad y resultado, búsqueda de actor y validación de fechas/rangos.
- Evento nuevo **`CONFIG_UPDATE`**, módulo **`settings`**, entidad/parámetro y campo identificados; un registro por cambio, anterior/nuevo, actor, fecha y solicitud. Si no hay cambios, no se incrementa versión ni se inventa un evento.
- `ADMIN_REQUEST_FAILURE` incorpora el módulo `settings` con resultado `DENIED` o `ERROR`. Se conservan los eventos existentes de usuarios, programas y autenticación.

## Verificación

La suite completa pasa **87 pruebas** con Node 24.22.0. Incluye regresión del catálogo y los seis archivos financieros protegidos; API de autenticación, permisos, auditoría y demo; nuevas pruebas de:

- Niveles ninguno/pregrado/posgrado/ambos, búsqueda sin tildes y estado; filtros de usuarios.
- Denegación de lectura/escritura de configuración y ruta administrativa a `simulator_user` y `program_admin`, manteniendo acceso al simulador.
- Tasa 1,25 → 1,30; cuotas 6 → 8; Garantisa CP 5 % y LP 3 %; tasa/aporte cero.
- Validación, versiones en conflicto y rollback completo cuando falla la auditoría.
- Filtros de módulo, acción, entidad y resultado; valores anteriores/nuevos correctos.
- Persistencia al reiniciar y migración real de una base v1 con usuario y 173 registros, conservando ambos.
- Resultado anterior inalterado, nuevo cálculo con nuevos parámetros y Excel con porcentajes capturados.

Revisión real en navegador local con datos ficticios: filtros, conteos 173/29/144/173, búsqueda de ingeniería, edición y confirmación de matrícula, fecha de actualización, configuración, confirmación, resultado anterior idéntico y nuevo cálculo. Un capital de $10.000.000 con 8 cuotas y 1,30 % M.V. produce cuota aproximada de $1.324.227 y aporte inicial de $500.000 al 5 %.

Revisión en claro/oscuro, escritorio, móvil de 390 px y tableta de 768 px. Tablas con desplazamiento propio; filtros y grupos adaptables; iconos de Reestructuración alineados. PDF real generado con el exportador existente, renderizado y revisado: conserva 5 % y $500.000 aun después de cambiar la configuración activa a 10 %. Sin errores del exportador.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `apps/ofe/index.html` | Carga de nuevos módulos y estructura del icono de saldo. |
| `apps/ofe/simulador-assets/js/00-runtime.js` | Acceso contextual a los aportes configurados. |
| `apps/ofe/simulador-assets/js/01-core-ui.js` | Parámetros Garantisa contextuales, preparación de cálculo, ruta visual Configuración y etiqueta de porcentaje capturado. |
| `apps/ofe/simulador-assets/js/02-reestructuracion.js` | Reinicio con tasa vigente y plazo propio conservado. |
| `apps/ofe/simulador-assets/js/04-exports-pdf-excel.js` | Porcentajes capturados en exportaciones. |
| `apps/ofe/simulador-assets/js/05-idiomas-herramientas.js` | Exportaciones y herencia correcta de tasa cero. |
| `apps/ofe/simulador-assets/js/06-actions-history.js` | Nuevos valores iniciales al reiniciar cada modalidad. |
| `apps/ofe/simulador-assets/js/10-pdf-aptos.js` | Garantisa del resultado en PDF. |
| `apps/ofe/simulador-assets/styles.css` | Componentes administrativos, responsive, temas e iconos con tokens existentes. |
| `shared/admin/admin-ui.js` | Usuarios, auditoría, programas, filtros, páginas, acciones y confirmaciones. |
| `shared/auth/permissions.js` | Reconocimiento de permisos de configuración. |
| `server/app.cjs` | API protegida de configuración, auditoría ampliada y fechas de programas. |
| `server/store.cjs` | Permisos de configuración solo para administrador del sistema. |
| `scripts/verify-server.cjs` | Verificación de las dos migraciones instaladas. |
| `package.json` | Incluye las nuevas pruebas. |

## Archivos nuevos

| Archivo | Finalidad |
|---|---|
| `server/migrations/002-global-settings.sql` | Configuración persistente y metadatos de actualización de programas. |
| `server/settings.cjs` | Definiciones y validación autoritativa. |
| `shared/settings/simulation-settings.js` | Lectura, valores iniciales y snapshots por simulación. |
| `shared/admin/filters.js` | Filtros compartidos y verificables de usuarios/programas. |
| `shared/admin/settings-ui.js` | Pantalla, permisos, confirmación y guardado de Configuración. |
| `scripts/verify-admin-v3.cjs` | Pruebas de filtros, permisos, cambios, persistencia y snapshots. |
| `docs/ADMINISTRATION_V3.md` | Este informe, inventario y decisiones. |

**Archivos eliminados: ninguno.** Los catálogos embebidos mantienen 29 pregrados, 144 posgrados y sus valores originales; sus 173 IDs siguen siendo únicos. Los seis archivos `03-finance-core.js`/`07-financing-engine.js` conservan sus hashes de referencia.

## Publicación y siguiente prueba

La migración se aplica automáticamente al arrancar el backend actualizado. No se agregan credenciales al repositorio. Render debe desplegar el último commit de `feat/dtic-readiness`; GitHub Pages no puede ejecutar estas funciones administrativas del servidor. Esta entrega no configura una cuenta Render ni confirma un servicio externo activo.

En la demo Render Free la base sigue siendo efímera: un reinicio o reconstrucción que descarte el almacenamiento elimina también usuarios de prueba, configuración y auditoría. Persistencia verificada significa conservación sobre el mismo archivo/disco; para DTIC debe usarse almacenamiento institucional persistente y su política de copias. No se incorporó un servicio de pago ni Supabase.
