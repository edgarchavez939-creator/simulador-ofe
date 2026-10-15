# Servicio autónomo OFE y alojamiento propuesto

## Pruebas con presupuesto cero

Para pruebas temporales y entrega a DTIC, usar [la guía Render Free](RENDER_FREE_DEMO.md). Este modo crea el primer administrador mediante variables privadas, ya que Free no ofrece Shell. El disco es efímero: al reiniciar, suspenderse o redesplegar pueden perderse usuarios, auditoría y cambios. La propuesta con persistencia de las secciones siguientes es opcional para una futura operación; no contratarla para esta demostración.

## Decisión de arquitectura

Se propone **Render Web Service de pago, Docker y disco persistente de 1 GB**. La aplicación y su API se sirven desde el mismo origen HTTPS. Node 24 y SQLite permiten comenzar con un equipo pequeño sin contratar un proveedor de identidad ni Supabase. El paquete no usa servicios propietarios de Render para la lógica de negocio: también puede ejecutarse en un servidor Linux de DTIC.

`render.yaml` define el servicio, la rama `feat/dtic-readiness`, el plan `0.5c-512mb`, la región Virginia, el volumen `/app/var`, la comprobación `/api/health` y despliegues manuales. Los datos se escriben únicamente en el volumen. No se crean usuarios de muestra ni credenciales predeterminadas.

La elección es una recomendación para esta fase de uso interno. Render documenta que un disco persistente requiere servicio de pago, admite una sola instancia y produce una breve interrupción al desplegar. Si se requiere alta disponibilidad o varias instancias, conviene migrar el almacenamiento a PostgreSQL antes de escalar. La integración SSO con DTIC no exige por sí sola cambiar SQLite.

Fuentes verificadas el 15-10-2026: [discos y limitaciones](https://render.com/docs/disks), [Blueprint](https://render.com/docs/blueprint-spec), [precios vigentes](https://render.com/pricing). Confirmar el total de servicio, almacenamiento y cuenta en el panel antes de contratar; no se ha contratado ni aprovisionado alojamiento en esta entrega.

## Uso local inmediato

Requisito: Node.js 24 o posterior. No hay dependencias npm de servidor que instalar.

```bash
cd /Users/edgarchavez/Proyectos/simulador-ofe
npm run bootstrap-admin
npm start
```

El primer comando pide nombre, correo y contraseña confirmada, sin mostrarla. Solo crea el primer administrador si la base no contiene usuarios. El segundo abre el servicio en `http://127.0.0.1:8787`; entrar con la cuenta creada. La base se crea en `var/ofe.sqlite` y permanece al reiniciar.

Desde Usuarios, el administrador crea las demás cuentas. Una contraseña inicial o restablecida obliga a elegir una personal al ingresar. Los cambios de contraseña cierran las sesiones existentes. La recuperación de una cuenta ordinaria se hace mediante otro administrador; no hay recuperación por correo ni puerta trasera. Mantener más de un administrador autorizado reduce el riesgo de perder el acceso.

## Publicación en Render

1. Tener la revisión validada en la rama remota indicada por el Blueprint.
2. En una cuenta propia de Render, conectar este repositorio y crear un Blueprint desde `render.yaml`. Revisar y aprobar el costo recurrente antes de crear los recursos.
3. Confirmar Docker, plan de pago, disco montado en `/app/var`, variable `OFE_DATABASE=/app/var/ofe.sqlite` y despliegue manual. Nunca usar almacenamiento efímero para esta base.
4. Al completar el despliegue, abrir la Shell del **servicio en ejecución** y ejecutar `node server/container.cjs bootstrap`. Crear allí el administrador real. No usar un trabajo separado: no ve el disco del servicio.
5. Abrir la URL HTTPS del servicio; comprobar login, cambio obligatorio inicial, roles, actualización individual y por Excel, auditoría, logout y reinicio del servicio conservando los registros.
6. Usar esa URL para OFE. GitHub Pages sigue siendo la versión pública estática y no ejecuta esta API. No redirigir el sitio público hasta decidir su propósito y verificar el nuevo servicio.

`APP_ORIGIN` se obtiene de `RENDER_EXTERNAL_URL`; si se usa un dominio propio, configurarlo expresamente como origen HTTPS sin ruta, por ejemplo `https://simulador-ofe.ejemplo.edu`. `NODE_ENV=production` rechaza orígenes HTTP. No habilitar CORS: interfaz y API comparten origen.

El contenedor ajusta permisos del volumen y descarta los privilegios de root antes de abrir SQLite y HTTP. Las herramientas de bootstrap y respaldo usan el mismo mecanismo. Se excluyen bases, secretos, repositorio Git y pruebas temporales del contexto Docker.

## Despliegue portátil en Docker

```bash
docker build -t simulador-ofe:2 .
docker volume create ofe-data
docker run --rm -it -v ofe-data:/app/var simulador-ofe:2 node server/container.cjs bootstrap
docker run --name simulador-ofe -p 127.0.0.1:8787:8787 -v ofe-data:/app/var -e APP_ORIGIN=https://simulador-ofe.ejemplo.edu simulador-ofe:2
```

El último comando requiere un proxy HTTPS para el dominio indicado. Para una prueba exclusivamente local sin proxy, agregar `-e NODE_ENV=development -e APP_ORIGIN=http://127.0.0.1:8787`. El puerto de ejemplo solo se enlaza a loopback.

El servidor se probó en Node 24.22.0 real. La imagen Docker está preparada pero **no se construyó en este equipo porque Docker no está instalado**. La construcción y la prueba sobre el volumen de Render son verificaciones pendientes del primer despliegue.

## Respaldo, restauración y actualizaciones

Generar una copia consistente con el servicio en marcha:

```bash
node server/backup.cjs /ruta/segura/ofe-respaldo.sqlite
```

En la Shell de Render usar `node server/container.cjs backup /app/var/ofe-respaldo-FECHA.sqlite`, con un nombre nuevo. Descargar por un canal seguro la copia consistente y conservarla cifrada fuera del servicio. No copiar en caliente únicamente el archivo SQLite principal: puede haber datos en WAL. Las instantáneas de disco del proveedor no sustituyen esta copia de base de datos. Definir responsable y frecuencia operativa antes del uso real; no se ha configurado un trabajo remoto de respaldos.

Para restaurar: detener el servicio, conservar una copia del estado anterior, reemplazar la base por el respaldo consistente, retirar los archivos WAL/SHM del estado anterior, corregir propietario y permisos, iniciar y verificar `PRAGMA integrity_check`, login, catálogo y auditoría. No publicar respaldos ni cargarlos a Git. Probar la restauración en un entorno aislado antes de necesitarla.

Antes de actualizar: respaldo consistente, pruebas, despliegue manual y comprobación funcional. Para revertir código, desplegar la revisión anterior compatible con el esquema. Las migraciones futuras deben documentar compatibilidad; un rollback de código no revierte automáticamente los datos.

## Traspaso a DTIC

Se entrega el código, Dockerfile, esquema versionado, configuración no secreta y respaldo consistente. Cambiar alojamiento conserva los IDs de usuario y programa y el historial de auditoría. Las sesiones deberían revocarse durante el traslado.

Para SSO institucional se implementará la validación del proveedor OIDC/Entra y una tabla de correspondencia `(provider, subject) → users.id` mediante una migración nueva. Vincular cuentas explícitamente; nunca por coincidencia de correo sin verificación. El usuario interno mantiene su rol, permisos y autoría de auditoría. No se otorgan roles de administrador por pertenecer al dominio de correo.

Esta fase implementa el proveedor local y el contrato de cliente `OFEAuth`; no contiene un SSO ficticio ni un conector Entra terminado. DTIC deberá aportar tenant, cliente, redirect URIs, criterios de vinculación y política de acceso. Es trabajo de integración delimitado, sin rehacer simuladores, permisos ni auditoría.
