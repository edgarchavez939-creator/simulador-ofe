# Mejoras institucionales v19

Revisión del 20 de octubre de 2026. Se conserva un proyecto y servicio con API y SQLite compartidas. No se modifican el motor financiero, las matrículas oficiales ni los 29 pregrados y 144 posgrados del catálogo base.

## Uso administrativo

### Mantenimiento del simulador

En **Configuración → Acceso público e integración → Mantenimiento del simulador**:

1. Consultar el estado actual; editar título (hasta 100 caracteres) y mensaje (hasta 500 caracteres; admite saltos de línea).
2. Activar o desactivar el interruptor, revisar la confirmación y guardar.
3. Consultar la vista previa o abrir el enlace público para verificar el resultado.

Solo los usuarios con `settings.update` pueden guardar; la consulta requiere `settings.read`. Se mantienen los permisos, sesión, origen, CSRF, control de versión y auditoría existentes. Estado, título y mensaje se guardan globalmente en SQLite. No requieren cambios de código ni reinicio para aplicarse.

Con mantenimiento activo, el servidor devuelve el aviso institucional con **HTTP 503**, `Retry-After: 60`, `Cache-Control: no-store` y las autorizaciones de iframe vigentes. Bloquea las rutas públicas, sus archivos de simulación y los datos de `/api/public/`, incluyendo accesos directos y peticiones desde sesiones internas a rutas públicas. `/api/public/status` permite consultar únicamente el aviso y el estado. Login, salud del servicio y área interna autorizada siguen disponibles. La vista previa administrativa también puede mostrar el aviso.

Las páginas públicas abiertas comprueban el estado periódicamente, al recuperar el foco y antes de calcular o descargar. En pestañas suspendidas por el navegador, la comprobación periódica puede retrasarse hasta que se reactiven. El control de acceso a rutas y datos se aplica siempre en el servidor; no depende de ocultar botones.

**Límite de la arquitectura:** el servicio no puede retirar archivos ya descargados ni impedir que alguien ejecute una copia local del motor JavaScript. El mantenimiento suspende el servicio público, sin convertir el cálculo local en un cálculo de servidor. `OFE_PUBLIC_ENABLED=0` mantiene su prioridad: un interruptor administrativo no puede habilitar un servicio desactivado desde el entorno.

### Recursos de radicación por línea de crédito

En **Configuración → Parámetros → Recursos de radicación por línea de crédito**, cada línea tiene un formulario y guardado independiente:

| ID técnico reutilizando los dominios existentes | Línea |
| --- | --- |
| `shortTerm:pregrado` | Crédito Pregrado - Corto Plazo |
| `shortTerm:posgrado` | Crédito Posgrado - Corto Plazo |
| `languages` | Crédito Idiomas - Corto Plazo |

`shortTerm`, `languages`, `pregrado` y `posgrado` ya identifican resultados y niveles en el aplicativo; no son códigos institucionales. Se capturan al simular, incluidos escenarios con matrícula manual. No se deducen del nombre del programa ni del texto del título al descargar.

Cada formulario permite habilitar el enlace, editar URL HTTPS, texto (hasta 72 caracteres), descripción opcional (hasta 100) y tipo informativo: video, documento, página web, tutorial, presentación u otro. Se admiten URL con cualquier extensión o sin extensión; no se aceptan HTTP, JavaScript, datos, credenciales ni caracteres de control. No se verifica la disponibilidad del destino ni se descarga contenido remoto desde el servidor.

Los recursos comienzan **deshabilitados y sin URL**. No se suministran recursos ficticios ni se modifica la configuración de otras líneas al guardar una. Si está deshabilitado o no tiene URL, el PDF se genera sin elementos adicionales. Si falla la consulta de configuración al exportar, se informa el error y puede reintentarse; no se utiliza silenciosamente otro enlace.

La descarga consulta la configuración vigente, incluso para un resultado calculado antes de cambiar el recurso. Los PDF ya descargados permanecen iguales. La configuración tiene versión compartida para detectar ediciones concurrentes: ante un conflicto, recargar y revisar antes de guardar. El tipo y la descripción son informativos; no alteran cálculos, tasas ni condiciones.

## PDF: ubicación y conservación del diseño

Se inspeccionó el PDF anterior: existe un espacio entre el aviso legal y la firma. El enlace subrayado usa ese espacio, con el color institucional existente y texto de 9,5 puntos en la coordenada vertical 784; descripción opcional en 795. Se añade una anotación de enlace HTTPS sobre el texto, sin mostrar URL largas. Aparece una vez en la primera página correspondiente a cada simulación; no se repite en los anexos.

Se conservan A4, encabezado, logotipo, tipografías de los elementos existentes, márgenes, tablas, columnas, orden, datos y número de páginas. No se cambia el límite del cuerpo ni se agregan páginas para el enlace. La descripción se acorta si supera el ancho disponible. Si un futuro aviso legal ocupa más de tres líneas, el enlace no se fuerza en ese espacio; deberá revisarse otra ubicación antes de alterar el diseño.

No se añade recurso a mixto, largo plazo, banco aliado, cuota inicial ni reestructuración. El PDF de Banco Aliado conserva su presentación neutra. En un PDF combinado, cada simulación elegible incorpora solo su propio recurso.

## Identidad visual

`shared/ui/institutional.css` centraliza roles de color sobre los tokens existentes. Botones, navegación, selección de controles, foco, tablas e indicadores reutilizan la paleta guardada; los gráficos mantienen los tokens de capital e intereses. Se conserva la geometría de los módulos y las superficies de claro/oscuro. El rojo y dorado personalizados derivan colores de texto legibles. Los colores de éxito, advertencia y error mantienen su significado y no se sustituyen por colores de marca.

La calibración se comparte con login, OFE y público. No cambia la identidad de los exportables existentes ni sus valores.

## Despliegue y persistencia

No hay variables nuevas. Se aplica automáticamente `005-institutional-settings.sql` al abrir la base, agregando `institutional_settings`, con estado de mantenimiento y recursos separados. Se conservan usuarios, catálogo, parámetros, apariencia, módulos públicos y auditoría. Respaldar la base antes de actualizar y conservar `OFE_DATABASE` en almacenamiento persistente; se mantienen las instrucciones de despliegue y restauración de la guía institucional.

El proxy debe reenviar las peticiones a Node, sin servir por su cuenta `/apps/public/` ni los archivos de simulación. No debe cachear respuestas o reemplazar el 503 institucional por una página genérica. Las plantillas existentes de Nginx mantienen `proxy_cache off` y `proxy_intercept_errors off`.

**GitHub Pages es estático:** conserva la simulación con catálogo embebido y los ajustes visuales, pero no ejecuta estos controles globales ni consulta la configuración de SQLite. El mantenimiento y los recursos administrables operan en Render y en el futuro servidor institucional con Node. Para incluirlos en el portal, utilizar el enlace/iframe del servicio, no una copia de los archivos estáticos.

## API agregada

| Ruta | Acceso y respuesta |
| --- | --- |
| `GET /api/admin/maintenance` | `settings.read`; configuración, versión y metadatos |
| `PUT /api/admin/maintenance` | `settings.update`, sesión, origen y CSRF; `{version, changes}` |
| `GET /api/admin/radication-resources` | `settings.read`; las tres configuraciones, versión y metadatos |
| `PUT /api/admin/radication-resources` | `settings.update`, sesión, origen y CSRF; `{version, changes: {ID: recursoCompleto}}` |
| `GET /api/public/status` | Público habilitado; `{maintenance: {enabled,title,message}}`, sin datos administrativos |
| `GET /api/public/radication-resources` | Público habilitado sin mantenimiento; solo recursos habilitados con URL, sin metadatos |
| `GET /api/radication-resources` | Sesión y `simulator.use`; recursos habilitados con URL |

Las escrituras son transaccionales junto con su auditoría: si falla el registro, se revierte el cambio. Los cambios de otras sesiones se detectan con 409; validación con 422; falta de sesión o permiso con 401/403. Guardar sin cambios no incrementa la versión ni crea un cambio artificial.

## Validación y archivos

La batería completa aprobó **145 pruebas, 0 fallidas**, incluidas ocho pruebas nuevas de mantenimiento, permisos, CSRF, validación de URL, independencia, concurrencia, auditoría/rollback, migración, persistencia, enlaces PDF, geometría y comprobación de páginas públicas abiertas.

Se generaron PDF de pregrado, posgrado, idiomas y mixto, y casos habilitado/deshabilitado/sin URL. La comparación con el PDF anterior confirmó las posiciones de los caracteres existentes y el mismo número de páginas. La imagen renderizada con enlace deshabilitado fue idéntica al original. Se verificaron visualmente claro/oscuro, activación y restablecimiento desde Administración, operación interna durante mantenimiento y descarga pública real. Los destinos `example.test` utilizados en las pruebas son ficticios y no se guardan en la configuración entregada.

Archivos principales:

- Servidor: `server/app.cjs`, `server/store.cjs`, `server/institutional-settings.cjs` y migración 005.
- Configuración e interfaz: `shared/settings/institutional-settings.js`, `shared/admin/institutional-settings-ui.js`, ajustes en integración/auditoría, `shared/ui/institutional.css`, `brand-palette.js`, `public-availability.js` y archivos `maintenance.*`.
- Exportación: `shared/exports/simulation-report.js` y `pdf-report.js`; solo identificación técnica, consulta del recurso y enlace en el espacio libre.
- Carga: los tres HTML principales y login; versiones de recursos actualizadas.
- Pruebas: `scripts/verify-institutional-v19.cjs`, soporte de navegador simulado y conteo de migraciones actualizado; comando de pruebas en `package.json`.
- Documentación: README, guía de despliegue, integración DTIC, este documento y manifiesto de integridad.

Se mantienen pendientes la integración real con Entra ID, la conformidad de DTIC y el concepto jurídico según la documentación existente.
