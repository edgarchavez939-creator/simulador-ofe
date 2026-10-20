# UX v4 — Acceso, navegación y administración

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

Intervención sobre `feat/dtic-readiness`, después de Administración v3. Alcance principal: login y aplicación autenticada OFE. Se conservan el backend, sus APIs, la base de datos, los permisos, los eventos de auditoría y el motor financiero.

## Cambios de experiencia

| Área | Resultado |
|---|---|
| Login | Composición institucional de dos columnas, jerarquía de producto/acceso, formulario sin card superpuesta, campos y botón alineados, mostrar/ocultar contraseña mediante icono, feedback enfocado y estado de carga. Composición vertical en móvil. Hereda la apariencia global. |
| Header | Se retiró el estado «Lineamientos vigentes» y las otras etiquetas de estado. El espacio derecho presenta iniciales y nombre obtenidos de la sesión real. |
| Avatar | Menú anclado con nombre, correo, Claro/Oscuro/Sistema y cierre de sesión real. Sin enlaces de contraseña ni accesos administrativos duplicados. |
| Sidebar | Solo marca de producto, navegación, módulo activo y controles de navegación. Expandida/compacta en escritorio, tooltips al foco y drawer con cierre propio en móvil. Preferencia recordada. |
| Usuarios | Filtros y tabla comunes; icono de tres puntos; menú en capa superior, sin cambiar altura de fila ni quedar dentro del overflow de la tabla. Editar/cambiar rol/activar/desactivar según permisos. Crear y editar usan un modal accesible. |
| Auditoría | Tabla compacta para quién/qué/dónde/cuándo/resultado. «Ver detalle» abre un modal con metadatos y bloques anterior/nuevo. Valores estructurados se presentan con etiquetas; identificadores y referencias quedan en sección técnica opcional. Cerrar no recarga ni limpia filtros. |
| Programas | Búsqueda, estado y multiselección de nivel; chevron SVG común. Nombres completos, importes y fechas legibles. Edición individual con valor actual/nuevo, confirmación y auditoría intactas. Acceso superior directo al bloque Excel. |
| Excel | Seleccionar/arrastrar un `.xlsx`, revisar nombre/tamaño, retirar o validar, resumen real de filas y cambios, vista previa anterior/nuevo, confirmación y resultado. Un archivo inválido bloquea la aplicación. Se conservan las escrituras por ID/versión y la transacción del servidor. |

No se introdujo una biblioteca UI. Se utilizan Inter y JetBrains Mono, como solicita esta fase, y los tokens de color/espaciado/movimiento existentes. El [Portal Creativo de Uninorte](https://www.uninorte.edu.co/web/comunicaciones/portal-creativo) se consultó como referencia institucional; la descarga completa del manual oficial respondió HTTP 403. Por ello no se afirma una revisión íntegra del Brandbook: se conservaron la paleta y el sistema ya aprobados, sin recrear o alterar un logosímbolo institucional.

## Apariencia: una fuente de verdad

`shared/theme.js` administra `light`, `dark` y `system` mediante:

- `getPreference()`: preferencia guardada.
- `setPreference(mode)`: único punto de cambio.
- `resolved()`: tema efectivo claro/oscuro.
- `subscribe(callback)`: actualización de controles consumidores.
- `charts()`: integración existente de gráficas, sin recalcular resultados.

Se conserva la clave `simulador_tema`, compatible con preferencias anteriores. Sin preferencia válida se usa Sistema. Se atienden cambios del sistema operativo y cambios de almacenamiento entre pestañas. La preferencia Sistema se conserva como tal: no se reemplaza por su resolución del momento. La aplicación puede incorporar posteriormente persistencia de perfil desde este límite central, manteniendo el menú actual.

**En la aplicación autenticada, el único selector visible es Avatar → Apariencia**, tanto en escritorio como en móvil. El control anterior y su contenedor/separadores se eliminaron del HTML del sidebar; no están ocultos con CSS. Se retiraron sus acciones y estilos exclusivos. El login no añade otro selector: hereda la preferencia existente y el sistema operativo. La versión pública anterior conserva su navegación; su adaptador de tema también delega a la misma fuente global, evitando otra implementación del estado visual.

## Navegación

`simulador_sidebar` conserva `expanded`/`collapsed`. El modo compacto utiliza el ancho del token correspondiente y muestra tooltips con hover/foco y estado activo. La tabla y el contenido reciben el espacio restante. Entre 901 y 1100 px se usa compacto por defecto si no existe una preferencia previa; a 900 px o menos se utiliza drawer, con fondo inerte, Escape, cierre visible y retorno de foco. Ninguna variante del sidebar contiene perfil, apariencia o cierre de sesión.

Los menús emplean la capa superior de Popover cuando el navegador la ofrece, y posicionamiento fijo en el límite reutilizable para el resto. Su posición se ajusta al viewport y al desplazamiento. Incluyen Escape, retorno de foco y navegación por flechas/Inicio/Fin en los menús de acciones. Los modales reutilizan las funciones existentes de apertura/cierre, fondo inerte y trampa de foco.

## Contraseñas y preparación institucional

Se eliminaron la navegación ordinaria «Cambiar contraseña», la acción de restablecimiento desde Usuarios y su formulario. El parámetro antiguo `?change=1` ya no abre un cambio voluntario de contraseña en el login.

Se conservan exclusivamente las necesidades del acceso local existente:

- La creación de una cuenta local requiere su clave inicial, porque el contrato del servidor actual la exige. Solo se muestra al crear, no al editar.
- Una cuenta con `must_change_password` debe completar su activación inicial; no se elimina ni se elude esa protección.
- Los endpoints internos actuales se mantienen sin modificaciones para la transición y administración autorizada.

**Preparado para Microsoft:** región visual separada por proveedor, objeto de proveedor local con contrato de sesión/envío aislado del formulario, y template institucional inerte. El template no se inserta en la página y no aparece como botón funcional ni en navegación por teclado. La autorización sigue procediendo de usuarios, roles y permisos internos del servidor.

**Pendiente de DTIC:** proveedor real Entra/OIDC, configuración de tenant/aplicación, URLs autorizadas, login/callback del servidor, validación de tokens y sesión, reglas de vinculación y despliegue. El modelo ya conserva `auth_provider` y `email`; una futura identidad externa requiere una migración acordada con DTIC que vincule emisor y sujeto estable (`external_identity_id` o equivalente). No se vincularán privilegios automáticamente por correo ni por claims arbitrarios. No se añadieron rutas falsas, credenciales, tokens o autenticación simulada. La iconografía oficial Microsoft debe incorporarse al habilitar el proveedor real.

## Limpieza del actualizador anterior

Se eliminó el bloque «Archivos anteriores» y todo el antiguo contenido de la vista 6. El módulo operativo no carga `08-updater.js`, no dispara sus lecturas del HTML y no crea su estado. La plantilla actual proviene exclusivamente del catálogo cargado, con los 173 IDs y versiones.

El archivo legado se conserva para compatibilidad y pruebas aisladas; crea su estado solo cuando se carga explícitamente. No se borró información histórica, auditoría ni almacenamiento del servidor. También se retiraron de la delegación activa las acciones de esa UI antigua. Los estilos genéricos del Design System permanecen disponibles para reutilización.

## Verificación

**92 pruebas automáticas aprobadas con Node 24.22.0.** Se conservan las pruebas de autenticación, sesiones, CSRF, permisos, cambios auditados, importación identificada, configuración, snapshots, persistencia, catálogo y hashes financieros. Las cinco pruebas nuevas cubren:

1. Claro/Oscuro/Sistema, cambios del sistema operativo, persistencia anterior y sincronización entre pestañas.
2. Error, carga y éxito del login local con el contrato real de respuesta.
3. Activación obligatoria y retiro de la navegación ordinaria de contraseña.
4. Ausencia de perfil/tema en sidebar, Microsoft activo falso y bloques retirados.
5. Plantilla operativa con 29 pregrados, 144 posgrados, matrículas, IDs y versiones exactos.

Revisión interactiva en navegador local con usuarios y base de datos ficticios:

| Prueba | Resultado verificado |
|---|---|
| Escritorio 1280 px | Login, sidebar expandida/compacta, persistencia tras recarga, avatar, acciones y modales. |
| Tableta 1024 px | Navegación compacta, filtros, tabla y ausencia de control de apariencia en sidebar. |
| Móvil 390 px | Drawer y retorno de foco, avatar completo dentro del viewport, acciones sin recorte, modales con scroll interno, Excel y login sin desbordamiento horizontal de página. |
| Apariencia | Claro → Oscuro → Claro → Sistema → Oscuro; preferencia/resolución correctas y menú cerrado tras elegir. Login hereda el modo al cerrar sesión. Cambios de SO probados en la suite del controlador. |
| Teclado | Tab/Shift+Tab quedan dentro del modal; Escape cierra; Inicio/Fin/flechas recorren acciones; foco vuelve al disparador; tooltip de navegación aparece al foco. |
| Usuarios | Editar usuario → guardar → feedback y evento de auditoría. La edición no ofrece campos de contraseña. |
| Auditoría | Filtro → detalle modal → Escape → filtro conservado; campos monetarios y anterior/nuevo correctos. |
| Programas | Niveles Pregrado/ninguno/Posgrado/ambos: 29/173/144/173; edición individual confirmada y auditada. |
| Excel | Archivo con ID inválido bloqueado; archivo válido con una fila produce un cambio real; cancelar conserva la propuesta; confirmar aplica y genera evento con anterior/nuevo. |
| Sesión y permisos | Cerrar sesión lleva al login y una ruta administrativa vuelve a pedir acceso. Un `simulator_user` real no recibe navegación administrativa; las pruebas del servidor conservan la denegación de APIs/rutas. |

Los cambios de matrículas de la revisión visual ocurrieron únicamente en la base SQLite temporal de prueba. Los datos del repositorio permanecen originales: 173 programas únicos, 29 pregrados y 144 posgrados. Los seis archivos `03-finance-core.js` y `07-financing-engine.js` conservan sus hashes de referencia.

La validación visual corresponde al navegador integrado de pruebas; no se declara una certificación de compatibilidad con todos los navegadores. El despliegue externo en Render no forma parte de esa comprobación local.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `apps/ofe/index.html` | Header para identidad real, sidebar sin acciones personales, cierre móvil, fuentes y carga de UI; vista antigua de programas retirada. |
| `apps/ofe/simulador-assets/styles.css` | Login, shell, controles, menús, modales, Excel y estados responsive con tokens existentes; retiro de estilos exclusivos antiguos. |
| `apps/ofe/simulador-assets/js/00-runtime.js` | Retira la creación del estado del actualizador legado del arranque activo. |
| `apps/ofe/simulador-assets/js/01-core-ui.js` | Iconos del set actual, apariencia delegada, retiro de estados del header y accesibilidad del drawer. |
| `apps/ofe/simulador-assets/js/06-actions-history.js` | Retira acciones/eventos de tema y carga heredada que ya no existen en la UI. |
| `apps/ofe/simulador-assets/js/08-updater.js` | Inicialización diferida del estado legado para compatibilidad aislada, sin cargarlo en el flujo operativo. |
| `apps/public/simulador-assets/js/01-core-ui.js` | Delega la apariencia al controlador global compartido. |
| `shared/theme.js` | Fuente global light/dark/system, persistencia, SO, pestañas y gráficas. |
| `shared/auth/login.html` | Nueva composición, formulario, ayudas y template institucional inerte. |
| `shared/auth/login.js` | Límite de proveedor local, loading/error y activación inicial exclusivamente obligatoria. |
| `shared/admin/admin-ui.js` | Menús, modal de usuarios, modal de auditoría, filtros normalizados y nuevo proceso Excel. |
| `scripts/test-support/selector-context.cjs` | Carga del controlador real de apariencia en el fixture de selectores. |
| `scripts/verify-functional-v1e.cjs` | Fixture aislado para el validador cuyo HTML se retiró de la aplicación. |
| `package.json` | Incorpora la suite UX v4. |

## Archivos nuevos

| Archivo | Finalidad |
|---|---|
| `shared/ui/overlays.js` | Popovers anclados, teclado, cierre, modal reutilizado y controles select normalizados. |
| `shared/ui/app-shell.js` | Avatar real, apariencia, cierre de sesión, sidebar y tooltips. |
| `shared/admin/program-template.js` | Plantilla desde el catálogo vigente, sin datos de respaldo duplicados. |
| `scripts/verify-ux-v4.cjs` | Pruebas nuevas de apariencia, login, estructura y plantilla. |
| `docs/UX_V4.md` | Informe de entrega, decisiones, alcance institucional y verificaciones. |

**Archivos eliminados: ninguno.** No se modificaron archivos de `server/`, APIs, migraciones, permisos del servidor ni fórmulas financieras. Para publicar, Render debe desplegar el commit actualizado de la rama y servir el backend existente. GitHub Pages por sí solo no ejecuta el login ni la administración autenticada.
