# Refinamiento visual y administración v5

Implementado sobre `feat/dtic-readiness`, después de `a146e05`. La aplicación autenticada mantiene los roles, la sesión real, las actualizaciones transaccionales, el catálogo y el motor financiero.

## Resultado

- Un único H1 en la cabecera de la aplicación. Usuarios, Auditoría, Configuración y Actualizar Programas comienzan con sus herramientas; se retiraron las segundas cabeceras y sus descripciones repetidas. Conversor y Reestructuración conservan títulos internos que describen una subsección distinta.
- Usuarios: botón Pencil con `aria-label` y tooltip «Editar usuario». Abre directamente el modal existente de nombre, correo, rol y estado. No hay menú de tres puntos ni contraseña en la edición. La creación conserva el requisito transitorio de clave inicial del proveedor local.
- Configuración: consulta inicial, botón Editar parámetros, cancelación que restaura valores y confirmación de cambios sensibles. Simulación y Garantisa se agrupan por propósito. Cada campo muestra su valor, alcance y fecha de la última modificación real, obtenida de auditoría. Si no existe una modificación registrada, se indica expresamente; no se inventa una fecha por campo. Reestructuración presenta sus condiciones reales de referencia: 24 meses iniciales y la tasa global de Simulación. No se añade un parámetro financiero nuevo.
- Programa: modal accesible con identificación académica, matrícula actual y nuevo importe; nombre, estado y datos de pregrado cuando correspondan. Solo muestra código institucional si existe. Revisión explícita antes de guardar, opción de volver a editar, validación del formulario, errores de servidor, estado ocupado y confirmación transaccional auditada. Un error asociado a un campo vuelve a mostrar la edición para permitir corregirlo. No se apilan modales de confirmación.
- Login: dos zonas institucionales, rojo y acento dorado existentes, mejor presencia tipográfica y composición adaptable. Microsoft permanece en un template inerte, sin botón funcional ni autenticación simulada.
- Sidebar: control de 44 px exclusivamente mediante icono; tooltip y nombre accesible cambian entre Expandir y Contraer navegación. Conserva persistencia, menú móvil y acceso al tema exclusivamente desde el avatar.

## Consolidación tipográfica

Inter para interfaz, navegación, formularios, filtros, tablas, menús y modales. JetBrains Mono para importes, valores numéricos e identificadores; los números de pasos del flujo Excel usan Inter.

Se consolidan tamaños fijos de CSS sobre los tokens existentes `--fs-xs`, `--fs-sm`, `--fs-md`, `--fs-base`, `--fs-lg`, `--fs-xl`, `--fs-2xl`, `--fs-3xl`, y los tamaños de métricas/display. Los alias semánticos son:

| Token | Uso |
|---|---|
| `--type-display` | Título del producto en acceso de escritorio |
| `--type-page` | Título principal |
| `--type-section` | Sección y título de modal |
| `--type-subsection` | Subsección y grupos funcionales |
| `--type-body` | Formularios, botones, navegación y filas |
| `--type-small` | Ayuda, encabezados de tabla y metadatos |
| `--type-caption` | Contexto y notas breves |
| `--type-numeric` | Escala disponible para cifras destacadas |

Se igualan filas, padding, alineación vertical, labels y controles administrativos. El plugin de presentación de gráficos aplica Inter y tokens también a gráficos que aún contienen configuraciones tipográficas heredadas dentro del archivo financiero protegido; dicho archivo no se edita.

## Iconografía

La base detectada es el conjunto Lucide local, previamente definido en `01-core-ui.js`. Se concentra en `shared/ui/icons.js`, reutilizado por el login, el shell y los módulos. No se añade otra biblioteca ni dependencia remota.

Se centralizan 92 referencias estáticas de la página OFE, más los dos iconos de acceso y las acciones decorativas de calcular/agregar. Se eliminan el registro MoreVertical y una definición duplicada de Upload. Pencil, ChevronLeft, X, ChevronDown, ArrowRight, Plus, Eye, Upload, Download y los iconos existentes comparten el mismo renderizador, `currentColor` y reglas de tamaño/trazo. Los chevrons de selects utilizan el registro común; se retiran las imágenes SVG codificadas en CSS y los indicadores heredados de flecha de CSS. La flecha textual de comparaciones de valores se mantiene como notación de la transición, no como control interactivo.

## Auditoría funcional

La interfaz pide `category=administrative`. El servidor aplica la categoría en SQL **antes de LIMIT/OFFSET**. Esto evita páginas vacías o incompletas causadas por filtrar los registros después de paginarlos.

Visibles: `ADMIN_BOOTSTRAP`, `USER_CREATE`, `USER_UPDATE`, `USER_ROLE_CHANGE`, `USER_ACTIVATE`, `USER_DEACTIVATE`, `PROGRAM_UPDATE`, `CONFIG_UPDATE`, dentro de Usuarios, Programas y Configuración.

Excluidos de la vista: login correcto/fallido, logout, acceso rechazado, cambio/restablecimiento de contraseña y solicitudes administrativas rechazadas. Se conservan íntegros en `audit_log`; no hay borrado ni migración. La consulta técnica sin categoría conserva la compatibilidad previa y sus controles de acceso.

Filtros visibles: Desde, Hasta, Usuario, Módulo y Acción. Usuario resuelve nombre, correo o ID internamente. Entidad se retira del formulario, estado y consulta de la interfaz; se mantiene en el detalle de un cambio y en la API técnica para compatibilidad. Resultado se retira de filtros porque los eventos persistentes mostrados son modificaciones completadas; sigue siendo parte del registro y del detalle.

La restricción de `program_admin` a Programas se aplica en el servidor, incluso si se alteran los parámetros de consulta. Un usuario del simulador no accede a auditoría.

## Fechas

Persistencia: se mantienen timestamps UTC, sin reescribir eventos históricos.

Presentación: `shared/ui/dates.js` usa `es-CO` y `America/Bogota` explícitamente, con hora de 12 horas. Lo consumen Usuarios, Programas, Auditoría, Configuración e Historial. También se ajustan las fechas de generación de resultados y los metadatos de exportación; no se altera el cálculo de cronogramas ni vencimientos.

Filtros: la interfaz envía `timeZone=America/Bogota`. El inicio del día equivale a las 05:00 UTC y el final a las 04:59:59.999 UTC del día siguiente. La API valida el rango y rechaza identificadores de zona no admitidos. Las consultas técnicas anteriores sin zona conservan su interpretación UTC. No se muestran identificadores, offsets ni nombres de región en el texto de la interfaz.

## Pruebas y revisión visual

96 pruebas automatizadas completas, sin fallos ni omisiones, con Node 24.22.0. Incluyen las comprobaciones anteriores de catálogo, selectores, cálculos, snapshots históricos, exportaciones, importación Excel, autenticación, versiones, transacciones y permisos; se añaden cuatro regresiones:

1. Exclusión de 105 eventos de seguridad antes de paginar, conservación física de registros, búsqueda por tres identificadores y restricción por rol.
2. Límites exactos del día local, cruce de fechas UTC, rechazo de fechas/zonas inválidas y timestamps originales intactos.
3. Fecha de modificación por parámetro basada en auditoría real.
4. Presentación de fechas independiente de la zona del navegador y sin identificadores visibles.

Revisión en el navegador integrado:

| Entorno | Comprobaciones |
|---|---|
| Escritorio, 1280 × 900, claro/oscuro | Login, Configuración, Usuarios, Auditoría, edición y revisión de programa, bloque Excel, avatar y sidebar |
| Tablet, 1024 × 900, claro/oscuro | Configuración, Auditoría, navegación compacta y control sin texto; sin desbordamiento de página |
| Móvil, 390 × 844, claro/oscuro | Login, Configuración, filtros, detalle de auditoría, usuarios y programa; modales con desplazamiento interno y sin desbordamiento de página |
| Teclado | Tab/Shift+Tab en el modal de programa, foco circular, Escape y retorno al botón de edición; foco inicial en el importe; cancelación de configuración |
| Sistema | Preferencia claro/oscuro/sistema y cambios del sistema operativo cubiertos por las pruebas existentes del tema compartido |
| Perfiles | Sistema: edición de persona, programa y configuración auditadas. Programas: auditoría limitada a programas y sin configuración/usuarios. Simulador: navegación operativa sin administración. Permisos negativos cubiertos en API |

Las modificaciones de prueba se hicieron en una base aislada bajo `/private/tmp`, con identidades ficticias: nombre de una cuenta, matrícula de un programa (+100 COP) y tasa global (1,25 %). Ninguno de esos cambios se incorpora al catálogo embebido ni a datos reales. El cálculo real de corto plazo vuelve a producir resultado con los componentes consolidados. El bloque Excel conserva su flujo identificado y las pruebas completas de importación; no se afirma una nueva certificación manual de todas las variantes de Excel.

Capturas: carpeta `artifacts/refinement-v5/` del espacio de trabajo de este chat. No se incluyen cuentas ni bases de prueba en el repositorio.

La revisión se realizó en el navegador integrado; no equivale a una certificación de todos los navegadores/dispositivos físicos. El despliegue real en Render sigue pendiente de una URL/servicio que pueda verificarse. Subir esta rama no modifica por sí solo el sitio de GitHub Pages en `main`.

## Archivos modificados

| Archivo | Modificación |
|---|---|
| `apps/ofe/index.html` | Títulos internos, iconos comunes, acciones y control lateral sin texto; carga de helpers |
| `apps/ofe/simulador-assets/styles.css` | Escala por tokens, tablas, parámetros, modal de programa, login y responsive; retirada de iconos de CSS |
| `apps/ofe/simulador-assets/js/01-core-ui.js` | Consumo del registro compartido Lucide |
| `apps/ofe/simulador-assets/js/04-exports-pdf-excel.js` | Metadatos de generación en hora colombiana |
| `apps/ofe/simulador-assets/js/05-idiomas-herramientas.js` | Inter en equivalencias y fecha de generación local |
| `apps/ofe/simulador-assets/js/06-actions-history.js` | Fechas de historial/exportación con helper común |
| `apps/ofe/simulador-assets/js/10-pdf-aptos.js` | Fecha y hora de metadatos en la zona oficial |
| `shared/theme.js` | Tipografía de gráficos por tokens sin editar el motor |
| `shared/ui/app-shell.js` | Tooltip común por hover/foco para edición y control lateral |
| `shared/ui/overlays.js` | Chevron común en todos los selects operativos de clase select |
| `shared/admin/admin-ui.js` | Cabeceras compactas, edición directa, modal/revisión de programas, categoría y filtros de auditoría, fechas |
| `shared/admin/settings-ui.js` | Centro de parámetros en lectura/edición y fechas reales por campo |
| `shared/auth/login.html` | Composición institucional y reutilización de iconos |
| `server/app.cjs` | Categoría funcional de auditoría, días locales, metadatos por campo y asset de iconos para login |
| `scripts/test-support/selector-context.cjs` | Helpers reales compartidos en el contexto de pruebas |
| `package.json` | Incorporación de las cuatro regresiones |

## Archivos nuevos

| Archivo | Finalidad |
|---|---|
| `shared/ui/icons.js` | Registro Lucide único para la aplicación autenticada y login |
| `shared/ui/dates.js` | Presentación uniforme en la zona horaria oficial |
| `scripts/verify-refinement-v5.cjs` | Regresiones de auditoría, fechas, roles y actualizaciones por parámetro |
| `docs/REFINAMIENTO_V5.md` | Entrega, inventario y evidencia de validación |

**Archivos eliminados: ninguno.**

El catálogo conserva sus 29 pregrados y 144 posgrados, 173 IDs únicos y los valores originales. Se comparan los bloques embebidos con la base del trabajo y los hashes de las seis copias de `03-finance-core.js` y `07-financing-engine.js`. No se cambian códigos institucionales, permisos, credenciales, esquema ni reglas de cálculo.
