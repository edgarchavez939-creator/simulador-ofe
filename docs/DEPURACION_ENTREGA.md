# Entrega institucional y depuración del proyecto

**Fecha:** 20 de octubre de 2026. **Punto de partida:** commit `fed52b6` y ZIP depurado previo.

Esta revisión incorpora al proyecto las instrucciones de instalación para DTIC y las exclusiones del ZIP depurado. La publicación en el repositorio institucional y la instalación en el servidor definitivo las debe efectuar su operador. No se ha publicado esta revisión en los ambientes anteriores.

## Cambios de esta entrega

- Guía institucional completa, con todas las variables leídas por el servidor, valores predeterminados, diferencias con el modo de prueba y uso explícito de `--env-file`.
- Plantillas sin secretos para Node/Linux y Docker; ejemplo de servicio systemd y proxy Nginx. DTIC debe completar dominio, certificados, usuarios y rutas y validarlos en destino.
- Procedimientos de primer administrador, base persistente, permisos, HTTPS, acceso público/iframe, respaldo, restauración, publicación, reversión y aceptación.
- Pendientes explícitos: Microsoft Entra ID, separación en dos proyectos/dominios si se exige, restricciones de red, operación y concepto jurídico. No se presentan como implementados.
- Mensaje de Configuración independiente del proveedor de alojamiento. La plantilla del portal usa un dominio reservado `.invalid` que debe sustituirse por el real.
- Documentación de API corregida y antecedentes identificados; instrucciones de instalación sin rutas personales de macOS.
- Identidad ficticia en la prueba de firma PDF. No se incluyen la cuenta ni la contraseña de pruebas del responsable.

## Limpieza conservada

Se retiraron estos diez archivos del proyecto y del paquete:

| Archivo | Motivo |
| --- | --- |
| `README-DTIC-SCAFFOLD.md` | Instrucciones iniciales de un paquete parcial; la entrega actual contiene el proyecto completo. |
| `scripts/bootstrap-dtic-structure.sh` | Crea carpetas del scaffold inicial que el servidor actual no necesita. |
| `scripts/verify-dtic-scaffold.sh` | Valida carpetas iniciales vacías que ya no representan la estructura real. |
| `simulador-assets/app.js` | Bundle antiguo sin referencias de carga; los HTML usan módulos en simulador-assets/js/. |
| `apps/ofe/simulador-assets/app.js` | Bundle antiguo sin referencias de carga. |
| `apps/public/simulador-assets/app.js` | Bundle antiguo sin referencias de carga. |
| `shared/auth/mock-auth-adapter.js` | Autenticación ficticia sin referencias; se conserva el adaptador real y sus pruebas. |
| `deploy/nginx.example.conf` | Ejemplo estático antiguo; no representa la ejecución del servidor de usuarios/API. |
| `deploy/iis-web.config.example` | Política fija antigua que puede interferir con el iframe y los recursos actuales. |
| `deploy/security-headers.example` | Política fija antigua, distinta de las cabeceras dinámicas del servidor. |

La nueva plantilla `deploy/nginx-institutional.conf.example` sustituye los ejemplos antiguos de sitio estático por un proxy al servidor. No se configura una raíz web con acceso a todo el código.

## Verificación

**132 pruebas aprobadas, 0 fallidas**, con Node 24.22.0. La nueva prueba ejecuta `server/start.cjs` mediante `--env-file` en un proceso real, con entorno aislado, origen HTTPS de prueba y base persistente. Verifica cookies seguras, rutas protegidas, catálogo de 173 IDs, edición de matrícula/idiomas en datos ficticios, conservación tras reiniciar, respaldo consistente por CLI y apertura de la copia restaurada con `PRAGMA integrity_check = ok`.

Los motores financieros, HTML de las aplicaciones con sus catálogos originales, valores y dependencias distribuidas permanecen byte por byte iguales al punto de partida. El cambio ejecutable de producto es un texto de ayuda en Configuración; no cambia cálculos, permisos, sesiones ni contratos de API. Se conserva el código de pruebas necesario para repetir la validación.

Las plantillas systemd, Nginx y Docker no se han ejecutado en este equipo: no están instalados esos servicios. DTIC debe comprobarlas en su infraestructura. Las pruebas locales no certifican dominios, certificados, restricciones de red, integración Entra ni despliegues remotos.

El [manifiesto](../MANIFIESTO-ENTREGA.json) registra exclusiones, archivos modificados y SHA-256 de los archivos entregados salvo el propio manifiesto. El ZIP final se comprueba tras volver a extraerlo. No incluye `.git`, `node_modules`, bases, respaldos, `.env` reales, credenciales, logs ni archivos temporales. Las plantillas `.env.example` son configuración de ejemplo sin secretos.

## Lectura inicial para DTIC

1. [README](../README.md).
2. [Despliegue institucional](DESPLIEGUE_INSTITUCIONAL.md).
3. [Plantillas y rutas](../deploy/README.md).
4. [Información y pendientes](DTIC_INTEGRATION.md).
5. [Seguridad](SECURITY.md), [dependencias](DEPENDENCIES.md) y [revisión jurídica](PDF_TEXTS_FOR_LEGAL_REVIEW.md).
