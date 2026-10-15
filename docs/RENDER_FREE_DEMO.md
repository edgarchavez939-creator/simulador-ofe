# Pruebas gratuitas en Render antes de entregar a DTIC

Esta ruta permite una demostración con autenticación, roles y auditoría reales, sin disco de pago. No es almacenamiento permanente. El arranque normal y la propuesta persistente siguen disponibles por separado.

## 1. Cuenta y repositorio

Entrar en https://dashboard.render.com y crear una cuenta o iniciar sesión con GitHub. Elegir el espacio gratuito. Conectar únicamente el repositorio necesario: `edgarchavez939-creator/simulador-ofe`.

Crear **New → Web Service** desde **Git Provider** y seleccionar ese repositorio. No crear Static Site: no ejecuta la API. No usar el Blueprint `render.yaml` existente, porque propone un servicio de pago con disco persistente.

## 2. Configuración exacta

| Campo de Render | Valor |
|---|---|
| Name | `simulador-ofe-pruebas` (u otro disponible) |
| Branch | `feat/dtic-readiness` |
| Region | Virginia (o una disponible) |
| Root Directory | Vacío |
| Language / Runtime | **Node**; cambiarlo si detecta Docker |
| Build Command | `node --version` |
| Start Command | `node server/start-demo.cjs` |
| Instance Type | **Free** |
| Health Check Path, si aparece | `/api/health` |
| Auto-Deploy | Desactivado, si aparece la opción |

No se necesita instalar dependencias npm del backend. El comando de construcción solo comprueba la versión. No agregar disco, PostgreSQL, Redis u otro servicio para esta prueba.

## 3. Variables privadas

En Environment Variables agregar las siguientes claves, respetando mayúsculas:

| Key | Value |
|---|---|
| `NODE_VERSION` | `24.22.0` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `OFE_DATABASE` | `/tmp/ofe-demo/ofe.sqlite` |
| `OFE_EPHEMERAL_DEMO` | `1` |
| `OFE_DEMO_ADMIN_NAME` | Nombre que quieras para el administrador de pruebas |
| `OFE_DEMO_ADMIN_EMAIL` | Correo con el que ingresarás |
| `OFE_DEMO_ADMIN_PASSWORD` | Contraseña exclusiva de pruebas, de 12 a 128 caracteres |

No copiar una contraseña de ejemplo ni reutilizar una institucional. Escribirla solo en el panel privado de Render, nunca en GitHub, YAML, archivos públicos o el chat. Las variables del servidor no se envían al navegador. El proceso elimina la contraseña de su entorno tras leerla y SQLite guarda el hash scrypt; Render conserva el valor configurado para volver a iniciar una demostración vacía.

No configurar `APP_ORIGIN`: el servidor usa el origen HTTPS de `RENDER_EXTERNAL_URL`. No establecer `PORT`: usar el proporcionado por Render.

## 4. Publicar y entrar

Antes de crear, confirmar **Free** y que no haya recursos de pago añadidos. Pulsar **Create Web Service**. En Events/Logs esperar estado **Live**. El log debe mostrar el aviso de entorno temporal y “Simulador disponible en …”. No hay que ejecutar bootstrap ni abrir Shell.

Abrir la dirección HTTPS `onrender.com` que Render muestre en el servicio, preferiblemente con **Open app**. El nombre y URL finales pueden variar según disponibilidad. Debe aparecer el login. Ingresar con el correo y contraseña definidos en las variables privadas.

Si aparece un error:

- `No se pudo preparar la demostración`: revisar las cuatro variables OFE del modo de pruebas, correo válido y contraseña de 12–128 caracteres. No compartir sus valores secretos al pedir ayuda.
- Error de Node o `node:sqlite`: revisar `NODE_VERSION=24.22.0`, Runtime Node y volver a desplegar.
- No detecta puerto: revisar `HOST=0.0.0.0`; no fijar un PORT diferente al asignado por Render.
- Error de origen al guardar: entrar siempre por la URL HTTPS del servicio; eliminar un `APP_ORIGIN` manual equivocado.
- Login rechazado después de una actualización: usar la cuenta inicial configurada; el almacenamiento temporal pudo reiniciarse.

## 5. Recorrido de aceptación

Usar únicamente personas y datos ficticios.

1. Como administrador inicial, abrir Usuarios y crear una cuenta `simulator_user` y otra `program_admin`, cada una con contraseña inicial propia. Al entrar por primera vez deberán elegir una contraseña personal.
2. Como usuario del simulador, calcular CP/mixto/banco/cuota inicial y documentos. Verificar que no puede administrar usuarios, programas ni auditoría.
3. Calcular un programa A, cambiar a B y regresar a A. Los resultados anteriores deben desaparecer y la matrícula debe corresponder al nuevo programa.
4. Probar Reestructuración: saldo, plazo/tasa, tasa cero, negativos, capacidad opcional, escenarios, comparación y PDF; alternar claro/oscuro.
5. Como administrador de programas, editar una matrícula ficticia y verificar que se refleja en el simulador. Descargar plantilla, modificar, cargar, revisar y guardar. Consultar auditoría; no debe ver la administración de usuarios ni eventos de otros módulos.
6. Como administrador del sistema, revisar auditoría completa, cambiar rol/estado de una cuenta y comprobar revocación de acceso. Probar restablecimiento de contraseña con una cuenta ficticia, no con la única cuenta administrativa.
7. Cerrar sesión y comprobar que las rutas OFE requieren volver a ingresar.
8. Guardar capturas, PDF y observaciones para DTIC antes de dejar de usar la demo. No confiar en Render Free para conservar auditoría o cuentas de prueba.

## 6. Qué ocurre al suspenderse o reiniciar

Render Free se suspende tras 15 minutos sin tráfico y tarda aproximadamente un minuto en despertar. Su sistema de archivos es efímero: suspensión, reinicio o nuevo despliegue eliminan los archivos locales. Por eso pueden desaparecer usuarios, sesiones, cambios de programas y auditoría.

El arranque opcional crea de nuevo los 173 programas originales y el primer administrador con las variables configuradas **solo cuando la base está vacía**. Nunca sobrescribe cuentas ni cambios si la base existente sigue disponible. Al perderse la base, usar de nuevo la contraseña inicial configurada; las contraseñas cambiadas dentro de la demo no se conservan. Las otras cuentas deben recrearse. El historial local del navegador no equivale al respaldo de la base y, si cambia el ID del usuario al reconstruirlo, puede dejar de aparecer bajo la nueva cuenta.

No usar servicios para mantener la demo despierta artificialmente ni suponer disponibilidad permanente. No se ha contratado ningún recurso. Si no se añade un método de pago, los límites gratuitos pueden suspender el servicio o los builds; revisar las condiciones que muestre Render al crear la cuenta. Si pide contratar o pagar, detenerse.

## 7. Entrega a DTIC

Entregar la rama y la revisión probadas, informe técnico, configuración y evidencias. Las cuentas y auditorías de esta demo son descartables; DTIC debe crear sus cuentas en su infraestructura y utilizar el arranque habitual `node server/start.cjs`, con base persistente y bootstrap interactivo. No activar `OFE_EPHEMERAL_DEMO` ni trasladar las contraseñas de pruebas al entorno institucional.

Agregar SSO/Entra requerirá la configuración institucional y vinculación de identidades, conservando los permisos y eventos ya definidos. No se necesita Supabase.

## Fuentes y verificación

Documentación oficial consultada el 15-10-2026: [Render Free](https://render.com/docs/free), [Web Services](https://render.com/docs/web-services), [variables privadas](https://render.com/docs/configure-environment-variables). El arranque de demostración se verifica con pruebas de bootstrap, login real, permisos, 173 IDs, hashes y auditoría, preservación de datos existentes y reconstrucción en una base vacía. El despliegue remoto se completará cuando el propietario conecte su cuenta.

Validación local de esta ampliación: 82 pruebas aprobadas, 0 fallidas, en Node 24.22.0; comando de arranque real, endpoint de salud, cierre limpio y logs sin contraseña comprobados con una base descartable. Catálogos y motores financieros preservados.
