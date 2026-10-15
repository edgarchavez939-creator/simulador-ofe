# Iteración funcional v1E y preparación administrativa

Fecha: 2026-10-15. Rama: `feat/dtic-readiness`. Base: `d300f3a`.

## Alcance acordado

El usuario eligió integrar exclusivamente la infraestructura de DTIC y avanzar ahora con las mejoras funcionales. Esta entrega completa la parte funcional y prepara la validación del actualizador. La fase integral de autenticación, autorización servidor y auditoría **no está completada**: depende de la infraestructura institucional.

La inspección previa cubrió componentes, estado, catálogo, motores financieros, cuota inicial, idiomas, actualizador, adaptador de autenticación, servicios disponibles y tokens. El repositorio contiene aplicaciones estáticas, sin API de escritura ni base de datos. El adaptador de autenticación existente está sin configurar.

## Comportamiento implementado

- En las cuatro modalidades con catálogo (CP, mixto/LP, banco y cuota inicial), seleccionar un programa carga su matrícula y la deja readonly. Cambiar programa actualiza el valor. Eliminar la selección limpia la matrícula y habilita ingreso manual. Antes de calcular se restaura el importe del catálogo, también al duplicar un historial con programa identificado.
- Un componente compartido permite buscar por texto parcial sin distinguir mayúsculas ni tildes. Conserva nivel/subnivel, IDs y los dos posgrados homónimos con sus matrículas diferenciadas. Incluye combobox/listbox, flechas, Enter, Escape, Tab, mensajes accesibles y botón de eliminación. Utiliza los controles y tokens existentes, sin dependencias nuevas.
- Cuota inicial utiliza `min(capacidad ingresada, cuota necesaria para financiar el saldo neto)`. Reutiliza `cuotaMes`, `maxFinanciado` y `amortizacion`. Conserva la capacidad solicitada y precisión completa en memoria para recalcular al cambiar programa, matrícula, plazo, tasa o beneficios; el campo muestra COP redondeados. La capacidad se trata como límite. El fondo se paga al inicio y no se suma al capital que determina la cuota mensual.
- El resultado separa cuota inicial sin fondo, aporte al fondo y total inicial a pagar. El total tiene mayor jerarquía. Se actualizaron pantalla, historial, PDF legacy, PDF v5 efectivo y Excel. La tasa del fondo se toma de la configuración del sistema. Duplicar cuota inicial conserva una tasa de interés de cero.
- Idiomas reutiliza el token institucional de acento en sus estados success heredados. La corrección incluye `--state-success`, responsable del sombreado verde. Su botón mantiene la distribución grid en lugar de forzar flex; la flecha conserva su ancho y queda dentro del contenedor.
- Se revisaron los handlers de todos los botones delegados del HTML. Se ajustaron textos/iconos en el sistema existente, controles ocultos, y una regla CSS tardía que reactivaba dos columnas en móvil. Se conservan hover, foco, estados ocupados, disabled y navegación existentes.

## Preparación del actualizador

El módulo se conserva. Se añadió un analizador compartido de propuestas con importes COP estrictos, validación de nombres, subniveles y semestres; evita truncar importes con separadores, redondear semestres inválidos o convertir importes imposibles en cero. Las filas inválidas se muestran como errores y bloquean la propuesta completa. Cambiar un mapeo invalida el resultado anterior. Un nuevo archivo descarta las propuestas anteriores y exige revisar todas sus hojas.

La preparación combina las hojas revisadas, mantiene el nivel no importado, valida el catálogo resultante y cuenta programas, IDs únicos y grupos de nombres repetidos. Nunca fusiona los posgrados homónimos ni inventa códigos institucionales. El orden fuente distingue IDs técnicos; una importación reordenada necesita conciliación institucional antes de escribir.

El acceso administrativo se oculta por defecto y consulta el permiso central `programs.update`. La descarga de un HTML modificado queda deshabilitada, incluso invocando directamente la función. Esto evita una vía de modificación sin auditoría. No se realizan cambios al catálogo vigente.

## Autenticación, permisos y sesiones: pendiente de DTIC

`OFEPermissions` centraliza los permisos de interfaz y deniega ante adaptador no configurado, sesión no autenticada o error. Es una preparación de interfaz; **no constituye autorización servidor ni protege el código estático por sí sola**. El mock de autenticación no se activa. No hay contraseñas propias, usuarios de prueba, tokens persistidos ni login ficticio.

DTIC debe aportar y confirmar:

| Elemento | Contrato por completar |
| --- | --- |
| Proveedor institucional | Entra ID, registro de aplicación, tenant, audiencia, redirecciones y grupos autorizados |
| Perfil operativo | `simulator.use`, `programs.view` |
| Perfil `program_admin` | Permisos operativos y `programs.update`; `audit.view` solo si DTIC lo concede |
| Sesiones | Inicio, restauración, expiración, revocación, usuario inactivo, cierre y navegación hacia atrás |
| Interfaz de sesión | Acceso institucional, errores genéricos, identificación discreta y cierre; mismo Design System |
| Rutas | Proteger la aplicación OFE en servidor/infraestructura; conservar la aplicación pública según política institucional |
| API | Validar identidad y permiso en cada petición; 401 sin sesión, 403 sin permiso; no confiar en roles enviados por el cliente |

Los PIN locales históricos no son autenticación. El actualizador ya no utiliza ese flujo para conceder acceso. El PIN operativo de reestructuración permanece sin cambios.

## Auditoría y transacción: pendiente de DTIC

No se ha creado una tabla ni se afirma registrar cambios en servidor. La base de datos no está disponible. Contrato propuesto para una tabla institucional equivalente a `program_audit_log`:

`id`, `user_id`, `user_email`, `action`, `entity_type`, `entity_id`, `entity_name`, `field_name`, `old_value`, `new_value`, `created_at` (UTC), `origin`, `request_id`; código institucional nullable hasta que DTIC lo suministre. Fecha y hora se derivan del timestamp. No guardar contraseñas ni tokens.

El servidor deberá obtener el actor desde la sesión, validar valores y permisos, leer/bloquear la versión actual, actualizar el programa e insertar **una entrada por campo cambiado dentro de la misma transacción**. Si falla una entrada, revertir todo. Una versión/ETag debe impedir sobrescrituras concurrentes (409/412). Intentos rechazados no se registran como UPDATE exitoso; un log de seguridad separado podrá registrar denegaciones. La consulta de auditoría requerirá `audit.view` y permitirá filtros por actor, programa, fecha, acción y campo.

Las pruebas institucionales pendientes incluyen roles reales, sesión expirada/revocada, usuario inactivo, acceso directo, 401/403, actualización multicampo, rollback por fallo de auditoría y concurrencia. La publicación solo debe habilitarse al completar esas pruebas con el servicio de DTIC.

## Archivos modificados

| Archivo | Cambio |
| --- | --- |
| `apps/public/index.html` | Controles buscables y ayuda de matrícula; carga del componente compartido |
| `apps/ofe/index.html` | Mismos controles; permisos administrativos; vista previa y publicación pendiente |
| `apps/public/simulador-assets/js/01-core-ui.js` | Matrícula readonly/canónica, inicialización de buscadores, guard administrativo |
| `apps/ofe/simulador-assets/js/01-core-ui.js` | Mismos cambios de interfaz |
| `apps/public/simulador-assets/js/06-actions-history.js` | Capacidad efectiva, totales iniciales, Excel/PDF legacy e historial |
| `apps/ofe/simulador-assets/js/06-actions-history.js` | Mismos cambios funcionales |
| `apps/public/simulador-assets/js/10-pdf-aptos.js` | PDF v5 de cuota inicial coherente con pantalla |
| `apps/ofe/simulador-assets/js/10-pdf-aptos.js` | Mismo ajuste del PDF v5 |
| `apps/ofe/simulador-assets/js/08-updater.js` | Validación estricta de archivos/propuestas, invalidación y cierre de escritura sin DTIC |
| `apps/public/simulador-assets/styles.css` | Buscador, readonly, idiomas, botones y distribución responsive |
| `apps/ofe/simulador-assets/styles.css` | Mismos ajustes del Design System |
| `scripts/test-support/selector-context.cjs` | Eventos y operaciones DOM necesarios para probar interacción |
| `scripts/verify-program-catalog-v1d.cjs` | Expectativa del layout grid corregido en idiomas |
| `README.md` | Estado actual y alcance del actualizador |
| `docs/DTIC_INTEGRATION.md` | Referencia al contrato y dependencias institucionales |
| `docs/SECURITY.md` | Estado explícito de autorización y auditoría pendientes |

## Archivos nuevos

| Archivo | Finalidad |
| --- | --- |
| `shared/program-catalog/program-picker.js` | Buscador compartido accesible sobre los selectores existentes |
| `shared/program-catalog/catalog-import.js` | Parseo y validación pura de propuestas, sin escritura |
| `shared/auth/permissions.js` | Consulta central de permisos de interfaz, denegación por defecto |
| `scripts/verify-functional-v1e.cjs` | Regresión funcional, exportaciones efectivas y validaciones administrativas |
| `docs/FUNCTIONAL_V1E.md` | Informe, límites, contratos y entrega |

**Archivos eliminados: ninguno.** Se retiró la implementación de exportación de catálogo sin auditoría, conservando el módulo y su entrada bloqueada con explicación.

## Validación

Comando reproducible:

```sh
node --test scripts/verify-program-catalog.cjs scripts/verify-program-catalog-v1c.cjs scripts/verify-program-catalog-v1d.cjs scripts/verify-functional-v1e.cjs
```

58 pruebas: 44 existentes y 14 nuevas. Incluyen las cuatro modalidades en ambas aplicaciones, catálogo embebido/mock/API simulada, readonly y matrícula manual, IDs homónimos, cálculo y metadatos, historial, búsqueda/teclado, límites de capacidad 500.000/800.000 y 1.200.000/800.000, cambio de plazo, beneficios, tasa cero, precisión sin deriva, fondo configurado, PDF legacy y override v5 efectivo, Excel, importes inválidos, remapeo y permisos no configurados.

Se conservan por SHA-256 todos los catálogos embebidos (29 pregrados, 144 posgrados) y los seis archivos `03-finance-core.js`/`07-financing-engine.js` de las tres copias. `ProgramCatalog.list()` devuelve 173 registros con 173 IDs únicos en ambas aplicaciones.

Navegador real: búsqueda sin tildes/Enter, selección y matrícula bloqueada en los cuatro módulos, edición manual, idiomas y su flecha contenida, capacidad reactiva, resultados iniciales, controles móviles y revisión de colores. Anchos revisados: 320, 390, 768 y 1440 px. Sin desbordamiento de página ni botones en las vistas verificadas.

PDF: se ejecutó el renderer v5 real con canvas y la misma versión de jsPDF 2.5.1, verificada por su integridad SRI; se renderizó y revisó visualmente el archivo de prueba. El navegador ejecutó la exportación sin errores y mostró confirmación; su interfaz de automatización no entregó el archivo descargado. La revisión del PDF se realizó sobre el archivo generado por el renderer real fuera del navegador.

## Pendientes reales

- Conexión institucional completa y pruebas servidor descritas arriba. No desplegar OFE como aplicación administrativa autenticada hasta completarlas.
- Conciliar los IDs técnicos basados en posición con las identidades institucionales antes de permitir importaciones que reordenen registros.
- Validación final en los navegadores institucionales objetivo y traslado de dependencias CDN a alojamiento institucional según la política ya documentada.
- La copia legacy de la raíz se conserva como referencia previa; las mejoras de esta iteración se aplican a `apps/public` y `apps/ofe`.
