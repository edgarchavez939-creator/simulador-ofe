# Despliegue institucional — guía para DTIC

Revisión del **20 de octubre de 2026**. Esta guía describe el código entregado y las decisiones pendientes. El alojamiento institucional no depende de Render, GitHub Pages ni Supabase. GitHub institucional conserva el código; el servidor de DTIC ejecuta la aplicación y guarda sus datos.

## 1. Arquitectura confirmada y decisiones previas

El responsable confirmó el **20 de octubre de 2026** que se mantendrá la arquitectura actual: **un único proyecto, servicio y origen HTTPS**, con pantalla pública `/apps/public/`, área interna `/apps/ofe/`, login `/login`, API y base de datos compartidas. Las pantallas conservan sus carpetas y recursos compartidos. El público accede sin cuenta; el área interna y su administración mantienen autenticación, roles y permisos del servidor.

La división en dos proyectos o despliegues no forma parte de esta entrega ni se registra como trabajo pendiente. DTIC debe revisar esta arquitectura como parte de su conformidad institucional; la decisión del responsable no representa una aprobación ya emitida por DTIC.

Antes de autorizar producción, DTIC debe completar:

| Decisión | Estado y acción |
| --- | --- |
| Dominio institucional | Confirmar un origen HTTPS canónico para el servicio único y configurar en él las rutas públicas e internas. |
| Acceso institucional | Microsoft Entra ID está pendiente de implementar. Hay usuarios locales con permisos y auditoría reales. DTIC debe aprobar expresamente cualquier uso temporal de esas cuentas. |
| Red | Definir restricciones de acceso interno y aplicarlas también a las API de autenticación/administración. La plantilla no limita el acceso a la red universitaria. |
| Persistencia | Definir volumen local permanente, respaldos, retención, responsables y recuperación. |
| Textos | Recibir concepto de Jurídica y aplicar los ajustes aprobados; el envío previo no equivale a aprobación. |
| Repositorio | El responsable informa que cargó el proyecto en GitHub institucional. Confirmar que esta revisión actualizada se incorpore allí; el ZIP no crea permisos ni actualiza repositorios remotos. |

Usar un único origen canónico. Las mutaciones validan origen y CSRF, las cookies son del host y la vista previa requiere el mismo origen. La arquitectura actual no requiere habilitar CORS ni usar comodines. La restricción del acceso interno debe abarcar también las API correspondientes, conforme a la política que defina DTIC.

## 2. Requisitos y rutas

- Node.js **24 o posterior**; la validación de esta entrega usa Node 24.22.0. Confirmar `node --version`. El backend usa módulos nativos, incluido SQLite; no necesita instalar paquetes npm de servidor.
- Proceso dedicado sin privilegios de administrador, una instancia del aplicativo y almacenamiento local persistente. SQLite se usa en modo WAL: no ubicar la base en NFS/SMB ni compartirla entre equipos. Para varias instancias se requiere evaluar y adaptar el almacenamiento.
- HTTPS en un proxy institucional. Publicar las rutas del servidor, sin exponer la carpeta completa de código como sitio estático.
- Acceso de instalación al repositorio institucional o al ZIP. Las bibliotecas y fuentes del navegador ya son locales. Los ejemplos de dominios con `.invalid` se deben sustituir; no son direcciones reales.

Rutas de referencia para Linux:

| Ruta | Contenido y acceso |
| --- | --- |
| `/opt/simulador-ofe` | Código completo, lectura para el usuario del servicio, sin escritura del proceso |
| `/etc/ofe/ofe.env` | Entorno privado, lectura para el usuario del servicio; fuera del repositorio |
| `/var/lib/ofe` | Base y archivos WAL/SHM, escritura exclusiva para el usuario del servicio |
| `/var/backups/ofe` | Copias consistentes, acceso restringido; copiar además a un destino protegido fuera del servidor |

El ejemplo usa usuario y grupo `ofe`; DTIC debe crearlos mediante sus procedimientos y preparar permisos. Como referencia, directorios de datos/respaldos `0700`, base `0600`, archivo de entorno `0640` propiedad de root y grupo del servicio. No colocar datos ni secretos en una carpeta publicada. Adaptar rutas y comandos a la plataforma real.

## 3. Todas las variables del servidor

Copiar [la plantilla Linux](../deploy/institutional.env.example) a `/etc/ofe/ofe.env` y completar los valores. La aplicación **no busca ni carga archivos `.env` por sí sola**. Node puede leer el archivo con `--env-file`; alternativamente, DTIC puede suministrar el entorno al proceso. Las variables ya presentes en el entorno del proceso prevalecen sobre el archivo: retirar valores heredados que apunten a otra base u origen.

| Variable | Uso institucional | Comportamiento del código |
| --- | --- | --- |
| `NODE_ENV` | `production` | Activa el requisito de origen HTTPS. Sin este valor el código no aplica esa validación de producción. |
| `APP_ORIGIN` | Origen HTTPS canónico, por ejemplo `https://simulador.ejemplo.invalid`, sustituyéndolo por el real | Sin ruta, consulta, fragmento ni credenciales. Prioritario sobre `RENDER_EXTERNAL_URL`. Determina comprobación de origen, cookies seguras, HSTS y enlace público. Un HTTPS configurado no instala el certificado ni cifra el tramo local: lo hace el proxy. |
| `HOST` | `127.0.0.1` con proxy en el mismo servidor | Predeterminado `127.0.0.1`. En Docker se usa `0.0.0.0` dentro del contenedor y se publica el puerto solo en loopback del host. |
| `PORT` | `8787`, o puerto libre acordado con el proxy | Predeterminado `8787`; debe coincidir con el destino del proxy. |
| `OFE_DATABASE` | Ruta absoluta persistente, por ejemplo `/var/lib/ofe/ofe.sqlite` | El arranque normal, bootstrap y respaldo usan esta variable. Sin ella usan `var/ofe.sqlite` relativo al directorio de trabajo. En Docker el contenedor usa `/app/var/ofe.sqlite` por defecto. Mantener exactamente la misma ruta para las tres operaciones. |
| `OFE_PUBLIC_ENABLED` | `1` para activar la pantalla y API públicas; `0` para desactivarlas | Solo admite `0` o `1`. Ausente significa desactivado. No concede permisos administrativos. |
| `OFE_PUBLIC_FRAME_ORIGINS` | Orígenes HTTPS autorizados, separados por espacios; por ejemplo `https://www.uninorte.edu.co` | Ausente o vacía: solo se permite iframe desde el propio origen. Sin rutas, comodines, credenciales, consulta ni fragmento. Añadir `https://uninorte.edu.co` solo si el portal realmente lo necesita. No limita una página específica dentro del origen autorizado. |
| `RENDER_EXTERNAL_URL` | Omitir | Compatibilidad con el antiguo alojamiento. Solo se usa si no se define `APP_ORIGIN`; no hace conexiones con Render. En DTIC definir siempre `APP_ORIGIN`. |
| `OFE_EPHEMERAL_DEMO` | Omitir | Exclusiva de `server/start-demo.cjs`; exige `1` para esa entrada. No usar ese arranque en el servicio institucional. |
| `OFE_DEMO_ADMIN_NAME` | Omitir | Exclusiva del primer administrador de la demostración efímera. |
| `OFE_DEMO_ADMIN_EMAIL` | Omitir | Exclusiva de la demostración; no configura cuentas institucionales. |
| `OFE_DEMO_ADMIN_PASSWORD` | Omitir | Secreto exclusivo de la demostración; no incluir en Git ni trasladar al servidor institucional. |

`NODE_VERSION` pertenece a la configuración histórica del proveedor: este código no instala Node ni lee esa variable para cambiar de versión. DTIC debe instalar el binario apropiado. No se implementan variables `ENTRA_*`, `TENANT_ID`, cadenas de PostgreSQL ni claves de API: agregarlas no activa funcionalidades que el código no contiene.

## 4. Instalación y primer arranque con Node

1. Si el repositorio institucional contiene solamente el ZIP, incorporar primero su contenido descomprimido: `package.json`, `server/`, `apps/` y `shared/` deben estar en la raíz del proyecto que se ejecutará, sin una carpeta extra accidental. Clonar o copiar esa revisión aprobada completa a `/opt/simulador-ofe`, preservando `server/`, `apps/`, `shared/`, `scripts/`, `package.json` y el resto de la entrega. No montar un HTML aislado. Conservar el identificador de revisión para operación y reversión.
2. Preparar usuario del servicio, directorios de datos/respaldos y archivo de entorno. Confirmar el dominio real, permisos y puerto.
3. En una copia de validación y con Node 24 o posterior, ejecutar `npm test`. Las pruebas usan datos aislados; no reemplazan la aceptación en el servidor definitivo.
4. Crear el primer administrador desde una terminal interactiva, como el usuario del servicio, con el mismo archivo de entorno que usará el proceso:

```bash
cd /opt/simulador-ofe
node --env-file=/etc/ofe/ofe.env server/bootstrap.cjs
```

Solicita nombre, correo, contraseña y confirmación sin mostrar la contraseña. Solo funciona si no hay usuarios; no ejecutar contra una base migrada para intentar recrearlos. No existen credenciales predeterminadas. Para un servicio gestionado por otro usuario, DTIC debe ejecutar el comando bajo esa identidad, por ejemplo con `sudo -u ofe`, conservando ruta del binario y permisos.

5. Iniciar el servicio con ese mismo entorno:

```bash
node --env-file=/etc/ofe/ofe.env server/start.cjs
```

`npm start` equivale al arranque normal y funciona si las variables ya se inyectaron al proceso. Crear un archivo llamado `.env` y ejecutar solamente `npm start` no lo carga automáticamente. No usar `npm run start:demo`.

El primer uso prepara migraciones y carga los **29 pregrados y 144 posgrados** embebidos cuando el catálogo de la base está vacío. Una base existente conserva sus cambios; volver a publicar código no sincroniza ni sobrescribe automáticamente las matrículas ya editadas. Revisar la base existente antes de migrar datos.

## 5. Servicio permanente Linux y HTTPS

La [plantilla systemd](../deploy/ofe.service.example) usa `/usr/bin/node`, usuario `ofe`, las rutas anteriores y reinicio ante fallo. Confirmar la ruta real del binario con `command -v node` y adaptarla. Crear antes todos los directorios de `ReadWritePaths`; si cambian las rutas de datos, ajustar también la unidad.

Después de revisar la plantilla, DTIC puede instalarla como `/etc/systemd/system/ofe.service`, validarla y administrarla:

```bash
systemd-analyze verify /etc/systemd/system/ofe.service
systemctl daemon-reload
systemctl enable --now ofe
systemctl status ofe
journalctl -u ofe --since today
```

Estos comandos requieren los privilegios institucionales correspondientes. El servicio captura SIGTERM y cierra HTTP/SQLite. Tras cambiar el entorno, reiniciar el servicio; tras cambiar la unidad, ejecutar además `daemon-reload`.

La [plantilla Nginx](../deploy/nginx-institutional.conf.example) hace proxy al puerto local. DTIC debe reemplazar dominio y certificados, ajustar sus políticas TLS y comprobar `nginx -t` antes de activar. En IIS u otro proxy, configurar el equivalente institucional: HTTPS, mismo origen y rutas preservadas, cookies y cabeceras transmitidas, sin entregar archivos del repositorio directamente. No se entrega un conector IIS probado.

Conservar las cabeceras que emite la aplicación: CSP, `nosniff`, HSTS en HTTPS, `Cache-Control` y cookies. No añadir otra CSP que bloquee estilos/recursos permitidos ni un `X-Frame-Options: DENY` global que impida el iframe público. La aplicación interna usa `frame-ancestors 'none'`; la pública usa los orígenes autorizados. El código permite estilos en línea por compatibilidad con la interfaz, pero no scripts externos de CDN ni JavaScript en línea.

Mantener el puerto Node fuera del acceso público directo. No usar caché compartida para login, API ni documentos del aplicativo. El servidor limita los intentos de login; detrás de un proxy el límite por dirección puede compartirse entre usuarios. No confía automáticamente en `X-Forwarded-For`. Si DTIC necesita límites por IP real, debe diseñarlos en el proxy sin cambiar la confianza del servidor de forma improvisada.

## 6. Alternativa Docker institucional

Usar esta alternativa en lugar de systemd directo sobre Node. El [archivo Docker de entorno](../deploy/institutional.docker.env.example) cambia `HOST` a `0.0.0.0` y la base a `/app/var/ofe.sqlite`; completar el dominio real. No reutilizar sin cambios el archivo Linux con `HOST=127.0.0.1` dentro del contenedor.

```bash
cd /opt/simulador-ofe
docker build -t simulador-ofe:institucional .
docker volume create ofe-data
docker run --rm -it --env-file /etc/ofe/ofe-docker.env --mount source=ofe-data,target=/app/var simulador-ofe:institucional node server/container.cjs bootstrap
docker run -d --name ofe --restart unless-stopped --env-file /etc/ofe/ofe-docker.env --mount source=ofe-data,target=/app/var -p 127.0.0.1:8787:8787 simulador-ofe:institucional
```

El contenedor prepara permisos del volumen y descarta privilegios antes de iniciar. El proxy HTTPS se configura en el host o infraestructura de DTIC. Conservar el volumen al reemplazar el contenedor. No ejecutar simultáneamente una segunda instancia sobre la misma base. La imagen, systemd y Nginx requieren validación en destino; no se han ejecutado esos servicios en el equipo de preparación.

## 7. Público, iframe y configuración funcional

Con acceso público habilitado, las direcciones institucionales serán `<APP_ORIGIN>/apps/public/` y `<APP_ORIGIN>/apps/ofe/`. En Configuración → Acceso público e integración, el administrador obtiene el enlace, código y vista previa de la dirección desplegada; no debe conservar un enlace de Render en el portal institucional.

Autorizar el origen del portal mediante `OFE_PUBLIC_FRAME_ORIGINS` y, si la CSP del portal limita `frame-src`, autorizar allí el origen del simulador. La página pública no requiere cookies ni autenticación. Login y administración no deben insertarse por iframe. Ver [acceso público](PUBLIC_INTEGRATION_PLAN.md) y el [ejemplo HTML](../examples/uninorte-embed.html).

Los roles existentes son `simulator_user`, `program_admin` y `system_admin`, definidos en el servidor. Crear las cuentas desde Usuarios; las cuentas creadas o restablecidas deben cambiar su contraseña inicial. Los módulos del menú público se activan u ocultan en Configuración → Acceso público e integración → Módulos visibles para el público. Los cambios se aplican al abrir o recargar la pantalla pública y no alteran los módulos internos. No requieren variables nuevas; se guardan en `public_module_settings` mediante la migración `004-public-modules.sql`. Ver [uso y validación v18](MODULOS_PUBLICOS_Y_PLANES_V18.md).

Las tasas, cuotas y aportes Garantisa se administran en Configuración; las matrículas e idiomas, en Actualizar Programas. No son variables de entorno ni deben editarse en las fórmulas. Los colores se guardan en la base; el blanco/negro de cada modo se conserva.

Los recursos de exportación, fuentes y licencias se incluyen localmente. Los documentos de Banco Aliado mantienen presentación sin marca. Los textos jurídicos siguen pendientes de concepto.

## 8. Respaldo y restauración

DTIC debe acordar frecuencia, retención, cifrado, destino externo y responsables. SQLite guarda usuarios, hashes de contraseña, catálogo, parámetros, colores y auditoría. El historial de simulaciones está en el navegador y no se convierte en un expediente central ni se incluye en la copia SQLite.

Para una copia consistente, con la misma variable `OFE_DATABASE`, como el usuario del servicio y con un nombre de destino nuevo:

```bash
node --env-file=/etc/ofe/ofe.env server/backup.cjs /var/backups/ofe/ofe-AAAAMMDD-HHMM.sqlite
```

Sustituir fecha y hora por valores reales. La carpeta de destino debe existir. El comando rechaza un archivo ya existente, aplica permiso `0600` y no cifra la copia: proteger y cifrar su traslado y almacenamiento conforme a DTIC. No copiar en caliente solo el `.sqlite` original: puede haber datos en WAL.

En Docker, con un nombre nuevo dentro del volumen de datos:

```bash
docker exec ofe node server/container.cjs backup /app/var/ofe-respaldo-AAAAMMDD-HHMM.sqlite
```

Extraer esa copia consistente por el canal de operación de DTIC y conservarla fuera del servidor; no confiar únicamente en que esté en el mismo volumen.

Para restaurar, primero ensayar en un entorno aislado: detener el servicio, conservar juntos los archivos actuales `.sqlite`, `-wal` y `-shm` en una copia de resguardo, colocar el respaldo consistente en la ruta configurada, verificar que no queden WAL/SHM antiguos junto a la base restaurada y corregir propietario/permisos. Comprobar `PRAGMA integrity_check` y que devuelva `ok`, iniciar y probar login, catálogo, configuración y auditoría. No reutilizar archivos WAL de la base anterior. DTIC debe decidir la revocación de sesiones y el tratamiento de datos al trasladar una base con usuarios.

## 9. Actualizaciones y reversión

Identificar commit/paquete aprobado y conservar el anterior. Antes de actualizar, hacer una copia consistente y ejecutar las pruebas en una copia aislada. Detener el servicio, reemplazar solo el código, conservar entorno/volumen/base, iniciar y ejecutar la aceptación. Las migraciones pendientes se aplican al abrir la base; revisar compatibilidad antes de cada actualización.

Revertir el código no revierte migraciones ni datos. Si el esquema no es compatible, restaurar de forma controlada el respaldo anterior; considerar la pérdida de escrituras posteriores. No reemplazar la base por una nueva al copiar el ZIP ni ejecutar el bootstrap de demostración para recuperar cuentas.

## 10. Aceptación en el servidor final

Registrar resultado, revisión, fecha y responsable:

- `GET /api/health` responde 200 y `{ "ok": true }`. Es una comprobación básica, no una auditoría completa de almacenamiento o permisos.
- Público sin login: consulta catálogo activo, selecciona programa y bloquea matrícula oficial; la simulación libre permite matrícula manual sin programa. API pública sin usuarios ni auditoría.
- Interno sin sesión: exige login. Probar roles, cambio inicial, cierre de sesión y acceso directo a API con 401/403 según corresponda.
- Como administrador de programas: editar en prueba matrícula e idiomas, importar Excel, revisar, guardar y comprobar auditoría y consulta pública. Mantener registros y valores oficiales fuera de las pruebas sintéticas.
- Calcular corto plazo, mixto, banco aliado, idiomas, cuota inicial y reestructuración. Revisar PDF/Excel, gráficos y ausencia de peticiones a CDN.
- Activar y ocultar módulos públicos, comprobarlos al recargar y verificar que OFE conserve sus opciones. Revisar auditoría y conservación tras reiniciar.
- Validar colores, enlace/iframe desde el portal autorizado y rechazo desde un origen no autorizado. Revisar cookies Secure/HttpOnly/SameSite y cabeceras en las respuestas reales detrás del proxy.
- Reiniciar proceso/servidor y comprobar conservación de cuentas, catálogo, parámetros y auditoría. Generar y restaurar un respaldo en un entorno separado.
- Confirmar aprobación jurídica, decisión sobre Entra ID y restricciones de red. Obtener conformidad de DTIC sobre la arquitectura de servicio único y la instalación antes de habilitar producción.

## 11. Diagnóstico

| Síntoma | Revisar |
| --- | --- |
| No inicia | Node 24+, archivo de entorno cargado, `APP_ORIGIN` válido, permisos de datos, puerto disponible y logs del servicio |
| Cookies no funcionan / error de origen al guardar | Acceso por el HTTPS canónico; `APP_ORIGIN` idéntico; proxy conserva cookies y no reescribe rutas/origen; no usar IP/HTTP alternativos para login |
| Público redirige al login o API devuelve 404 | `OFE_PUBLIC_ENABLED=1` en el entorno efectivo y reinicio del proceso correcto |
| Iframe bloqueado | Origen exacto del portal, `frame-ancestors` del simulador y `frame-src` del portal; políticas duplicadas del proxy |
| Catálogo vuelve a valores iniciales | Ruta `OFE_DATABASE` distinta o no persistente; volumen no montado; no sobrescribir una base real para resolverlo |
| Archivo Excel falla | Revisar la plantilla identificada, validación en pantalla y límites del proxy; el JSON de actualización del servidor tiene límite de 1 MiB |
| 429 al entrar | Límite temporal de intentos; revisar uso legítimo y topología del proxy, sin desactivar controles |

## 12. Fuentes y límites de verificación

Las variables y rutas se contrastaron con `server/start.cjs`, `public-access.cjs`, `bootstrap.cjs`, `backup.cjs` y `container.cjs`. Se prueba el arranque real con `--env-file` y SQLite persistente en un entorno aislado. Las plantillas de proxy, servicio e imagen son material para adaptación; no constituyen una instalación institucional validada.

Referencias oficiales: [Node CLI y archivo de entorno](https://nodejs.org/api/cli.html#--env-filefile), [proxy HTTP de Nginx](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass), [servicios systemd](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html) y [SQLite WAL](https://sqlite.org/wal.html). La opción `--env-file` también se comprobó con el binario Node 24.22.0 usado en pruebas.
