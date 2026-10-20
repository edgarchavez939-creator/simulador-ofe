# Simulador de Crédito — información para DTIC

Entrega revisada el **20 de octubre de 2026**. El responsable confirma que cargó el proyecto en GitHub institucional. La versión de ese repositorio debe actualizarse con esta entrega. La preparación de archivos no representa una instalación en el servidor institucional.

## Entregado

- Simulaciones, comparación, conversor y exportación PDF/Excel; Banco Aliado sin marca institucional.
- Pantalla pública sin cuenta y área interna con autenticación local, roles, permisos y auditoría de cambios.
- Actualización de matrículas e idiomas, importación Excel, parámetros y colores administrables.
- Backend portable Node.js/SQLite y recursos del navegador locales, con licencias y manifiesto de integridad.
- [Guía de despliegue](DESPLIEGUE_INSTITUCIONAL.md) con todas las variables, arranque, primer administrador, persistencia, HTTPS, iframe, respaldo/restauración y aceptación. [Plantillas](../deploy/README.md) para completar por DTIC.
- ZIP depurado, pruebas reproducibles y documentación histórica identificada como antecedente.

## Arquitectura que se mantendrá

El responsable confirmó el 20 de octubre de 2026 mantener **un único proyecto y servicio** para la pantalla pública y el área interna protegida, bajo un mismo origen HTTPS, con API y base de datos compartidas. La división en dos aplicaciones desplegables no se incluye en el alcance ni en los trabajos pendientes. DTIC debe revisar esta arquitectura en su conformidad institucional.

## Configuración e implementación pendientes

| Tema | Qué debe coordinarse |
| --- | --- |
| Dominio y servidor | DTIC define origen HTTPS, certificados, plataforma, cuenta de servicio, volumen persistente y operación. No se requiere Render. |
| Microsoft Entra ID | No implementado. Requiere configuración institucional, desarrollo del flujo y validación. Crear variables de tenant no activa SSO. |
| Restricción de red | DTIC debe definir y aplicar controles sobre el área interna y todas sus API; las plantillas no incorporan una ACL universitaria. |
| Datos y mantenimiento | Crear cuentas autorizadas, decidir si se migra información, fijar respaldo, retención, recuperación y responsables de futuras versiones. No se incluyen bases ni credenciales. |
| Portal institucional | Incorporar el enlace/iframe con el dominio final y autorizar los orígenes necesarios. |
| Repositorio anterior | Coordinar su retiro y el cierre de los ambientes anteriores, considerando la continuidad de las pruebas. Este paquete no los modifica. |

Los textos de exportación **ya fueron enviados a Jurídica**; está pendiente recibir su concepto y aplicar las observaciones. La autorización de producción corresponde a la validación final de DTIC y las aprobaciones aplicables.
