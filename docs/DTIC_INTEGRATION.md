# Simulador de Crédito — información para DTIC

Entrega revisada el **20 de octubre de 2026**. El responsable confirma que cargó el proyecto en GitHub institucional. La versión de ese repositorio debe actualizarse con esta entrega. La preparación de archivos no representa una instalación en el servidor institucional.

## Entregado

- Simulaciones, comparación, conversor y exportación PDF/Excel; Banco Aliado sin marca institucional.
- Pantalla pública sin cuenta y área interna con autenticación local, roles, permisos y auditoría de cambios.
- Actualización de matrículas e idiomas, importación Excel, parámetros y colores administrables. Control de los siete módulos del menú público desde Configuración, con persistencia y auditoría.
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

La revisión v18 incorpora [planes de pago y control del menú público](MODULOS_PUBLICOS_Y_PLANES_V18.md), validada con 137 pruebas. No requiere variables nuevas; incluye la migración automática `004-public-modules.sql`.

La revisión v19 incorpora [mantenimiento público, recursos de radicación por línea y calibración de colores](MEJORAS_INSTITUCIONALES_V19.md), validada con 145 pruebas. No agrega variables de entorno. La migración automática 005 conserva los datos existentes. El mantenimiento se aplica desde Node, incluyendo rutas y API públicas; el área interna mantiene su autenticación. GitHub Pages no ejecuta la configuración global del servicio.

La corrección [v20](RECURSOS_POR_MODULO_V20.md) configura tres enlaces por módulo —Cuota Inicial, Corto Plazo y Corto y Largo Plazo— compartidos por pregrado y posgrado. Incluye migración 006 con conservación de los recursos anteriores y validación completa de 147 pruebas.

La mejora [v21 de Reestructuración](REESTRUCTURACION_V21.md) incorpora distribución de pagos/condonaciones simuladas, comparación a una misma fecha de corte y plazo por capacidad. No añade variables ni migraciones; conserva la autenticación y el historial local. La batería completa aprueba 157 pruebas.

La [configuración de textos v22](TEXTOS_CONFIGURABLES_V22.md) añade Configuración → Textos y migración automática 007, sin variables nuevas. Valida el espacio de cada título y aviso antes de guardarlo; conserva el diseño PDF, permisos, auditoría y versiones por simulación. La batería completa aprueba 167 pruebas.
