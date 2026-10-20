# Comenzar aquí — despliegue institucional OFE

La guía principal es [Despliegue institucional](../docs/DESPLIEGUE_INSTITUCIONAL.md). Documenta todas las variables leídas por el servidor, instalación, primer administrador, HTTPS, iframe, respaldos, restauración, actualizaciones y aceptación.

| Archivo | Uso |
| --- | --- |
| [institutional.env.example](institutional.env.example) | Variables para Node en Linux; copiar a una ruta privada y completar el dominio |
| [institutional.docker.env.example](institutional.docker.env.example) | Variables para Docker, con volumen persistente |
| [ofe.service.example](ofe.service.example) | Servicio systemd; ajustar usuario, rutas y ubicación de Node |
| [nginx-institutional.conf.example](nginx-institutional.conf.example) | Proxy HTTPS a Node; completar dominio y certificados |
| [../Dockerfile](../Dockerfile) | Imagen portable del aplicativo |

Estas plantillas no se activan al descomprimir. DTIC debe adaptarlas y validarlas en su servidor. La aplicación no carga un `.env` automáticamente: usar `node --env-file=...` o variables del servicio. El entorno se mantiene fuera de Git.

La arquitectura confirmada mantiene un único proyecto, servicio y origen HTTPS para público e interno, con API y base compartidas. No se planifica dividir el despliegue en dos aplicaciones. Entra ID continúa pendiente de integración. Ver [pendientes y responsables](../docs/DTIC_INTEGRATION.md).

Se retiraron los antiguos ejemplos estáticos. La nueva plantilla Nginx hace proxy al servidor; no publica la raíz del repositorio. El ZIP no incluye credenciales, base de datos ni respaldo.
