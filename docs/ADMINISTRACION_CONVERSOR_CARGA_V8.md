# Administración, conversor y carga v8

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

Cambios sobre `23f5519`, en la rama `feat/dtic-readiness`.

## 1. Rediseño de administración

Se reorganizan las cuatro áreas: Programas, Usuarios, Configuración y Auditoría. Se cambia su composición, además de los estilos: cabecera de contexto/acción principal, indicadores reales cuando aportan información, herramientas de búsqueda, título de resultados y tabla independiente.

- **Programas:** cabecera de Catálogo académico, totales reales de programas/activos/inactivos, filtros alineados y acciones Editar visibles junto a su icono. Matrículas alineadas a la derecha; nombres y niveles a la izquierda. El editor utiliza un resumen lateral del programa y un área de edición; en móvil se apilan.
- **Usuarios:** Personas y accesos, indicadores reales de registros y estado, directorio y acciones explícitas. El formulario se divide en Identidad, Permisos y Activación inicial, con pie de acciones consistente. La activación inicial se oculta al editar una persona existente.
- **Configuración:** cabecera de Condiciones globales, versión/fecha, tarjetas paralelas de Simulación y Garantisa, referencia de Reestructuración y aviso de alcance. Valores en contenedores numéricos; edición/cancelación mantienen el contrato existente.
- **Auditoría:** cabecera de Actividad y trazabilidad, filtros y acciones agrupados, registro de cambios y detalle con metadatos alineados, comparación Anterior/Nuevo y estado. No se cambia el filtro de eventos administrativos ni la paginación.
- **Excel en lote:** cabecera, pasos, zona de archivo y controles con la misma geometría. Conserva revisión y confirmación antes de aplicar cambios.

Public Sans y cifras tabulares; controles de 40 px, iconos de 16 px en botones, botones Editar de 32 px, títulos y textos con funciones diferenciadas. Superficies y bordes usan los tokens del tema, tanto en claro como en oscuro. Se conserva la escala de subtítulos de simulación de 11 px solicitada en la fase anterior.

El nuevo estilo de administración y conversor se concentra en `shared/ui/workspace.css`, cargado después de la escala común. Los diálogos conservan etiquetas, nombres accesibles, cierre con Escape y devolución del foco.

## 2. Conversor y fórmulas

La configuración de origen/destino ocupa dos paneles equilibrados. El resultado se presenta debajo en una franja completa, junto con el origen y la descripción de la tasa de destino. Al final aparecen equivalencias y fórmulas; en tablet/móvil se apilan. Se corrigió también un mínimo heredado de tabla que recortaba la última columna en escritorio.

Se recuperan cuatro fórmulas coherentes con la implementación vigente:

1. Origen efectivo a efectiva anual: `iEA = (1 + io)^no − 1`.
2. Origen nominal a efectiva anual: `iEA = (1 + jo × no / mo)^mo − 1`.
3. Efectiva anual a destino efectivo: `id = (1 + iEA)^(1 / nd) − 1`.
4. Efectiva anual a destino nominal: `jd = (md / nd) × [(1 + iEA)^(1 / md) − 1]`.

Las tasas de las expresiones se interpretan en decimal; `n` es períodos por año y `m` capitalizaciones por año. Origen/destino son los períodos declarados en los controles. Se usa subíndice/superíndice en HTML, sin otra librería tipográfica. Una referencia anual del caso actual se actualiza junto con los resultados. Las nueve periodicidades, los cálculos, el intercambio y las validaciones se mantienen.

## 3. Iconos

La flecha duplicada procedía de `enhanceSelects`: añadía un icono al selector nativo oculto que acompaña al buscador de programas. Se omite la decoración de selectores ocultos o con `aria-hidden=true` y se protege la presentación de envoltorios antiguos. El buscador visible conserva únicamente su botón de despliegue.

Contraer/expandir navegación utiliza ahora `panel-left-close` / `panel-left-open` en el registro local de SVG, con dibujo actualizado según el estado; se retira el giro que correspondía al antiguo chevron. Conserva etiquetas, tooltip, persistencia y teclado.

## 4. Capa global de carga

`shared/ui/loading.js` y `loading.css` muestran una capa que sombrea el sistema y presenta un círculo de carga. Se integra con inicio del simulador, consultas del catálogo, solicitudes autenticadas, inicio de sesión, operaciones administrativas, validación de archivos y las acciones existentes que calculan o generan documentos. Las acciones instantáneas de filtrado local o conversión al escribir no añaden una espera artificial.

- **Avance medible:** porcentaje y etapas completadas. El inicio cuenta catálogo y módulos realmente inicializados. La validación de Excel informa cuatro etapas del procesamiento del archivo. No se interpreta ese porcentaje como bytes transferidos ni como tiempo restante.
- **Servidor sin avance medible:** círculo animado y fases reales («Conectando…», «Procesando respuesta…»), sin porcentaje inventado. La API actual no comunica progreso intermedio de sus operaciones.
- **Concurrencia:** un registro de tareas mantiene la capa hasta que todas terminan; una petición anidada no desbloquea la tarea principal.
- **Interacción:** el fondo queda `inert`, el cuerpo indica `aria-busy` y el foco permanece en la capa. Se restauran el estado previo y el foco al terminar, conciliando cualquier modal que se haya abierto o cerrado durante la operación. La capa manual está en el nivel superior del navegador y puede cubrir diálogos.
- **Errores:** cierre en `finally`; se preservan los mensajes de validación/autenticación y la recuperación de la interfaz. Un error de inicialización sigue mostrando el aviso de arranque existente y bloquea el simulador incompleto.
- **Accesibilidad:** `progressbar` con valores únicamente cuando son medibles, mensaje `status`, texto de etapas, nombres accesibles y respeto a movimiento reducido.
- Las comprobaciones silenciosas periódicas de vigencia de sesión no interrumpen la interacción con una capa de espera.

No se añadieron retrasos de demostración al producto. Para revisar visualmente la capa se simularon 2,5 segundos de latencia exclusivamente en el servidor temporal de QA; esa configuración no se entrega ni se despliega.

## 5. Verificación

105 pruebas aprobadas: las 100 existentes y cinco pruebas nuevas de carga. Cubren tareas anidadas, finalización idempotente, progreso, restauración de foco/estado `inert`/ARIA, errores de tarea/red, apertura/cierre de modales durante una operación y recuperación de arranque parcial en las dos aplicaciones. Se mantienen las pruebas financieras, de catálogo, importación, sesiones, permisos y exportaciones.

Revisión en navegador con servidor real y cuenta ficticia: escritorio 1440 px, tablet 1024 px y móvil 390 px; claro/oscuro, navegación expandida/contraída, cuatro vistas administrativas y diálogos, conversor, intercambio y fórmulas. Sin errores de consola ni desbordamiento horizontal del documento. Las tablas extensas conservan desplazamiento interno en móvil. Se comprobó la edición/cancelación de parámetros y la liberación del sistema/foco tras una consulta lenta. La instancia temporal utiliza una base propia; no se editaron usuarios o programas reales.

No se alteran los seis archivos financieros protegidos, los 29 pregrados, los 144 posgrados, sus IDs ni sus matrículas. Tampoco se cambia la lógica de roles o las reglas de aprobación. Las capturas de revisión quedan en los artefactos locales `ui-v8`. El despliegue remoto no se considera verificado mediante estas pruebas locales.

## Inventario

### Archivos modificados

- `apps/ofe/index.html`
- `apps/ofe/simulador-assets/js/00-runtime.js`
- `apps/ofe/simulador-assets/js/01-core-ui.js`
- `apps/ofe/simulador-assets/js/06-actions-history.js`
- `apps/ofe/simulador-assets/js/09-bootstrap.js`
- `apps/public/index.html`
- `apps/public/simulador-assets/js/00-runtime.js`
- `apps/public/simulador-assets/js/01-core-ui.js`
- `apps/public/simulador-assets/js/06-actions-history.js`
- `apps/public/simulador-assets/js/09-bootstrap.js`
- `index.html`
- `package.json`
- `server/app.cjs`
- `shared/admin/admin-ui.js`
- `shared/admin/settings-ui.js`
- `shared/auth/auth-adapter.js`
- `shared/auth/login.html`
- `shared/auth/login.js`
- `shared/program-catalog/catalog-http.js`
- `shared/ui/app-shell.js`
- `shared/ui/icons.js`
- `shared/ui/overlays.js`
- `shared/ui/rate-ui.js`
- `simulador-assets/js/00-runtime.js`
- `simulador-assets/js/01-core-ui.js`
- `simulador-assets/js/06-actions-history.js`

- `simulador-assets/js/09-bootstrap.js`

### Archivos nuevos

- `docs/ADMINISTRACION_CONVERSOR_CARGA_V8.md`
- `scripts/verify-interface-v8.cjs`
- `shared/ui/loading.css`
- `shared/ui/loading.js`
- `shared/ui/workspace.css`

Archivos eliminados: ninguno.
