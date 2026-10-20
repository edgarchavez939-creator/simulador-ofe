# Garantisa, Idiomas y carga — v9

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

## Cambios

- Garantisa presenta dos líneas: `Aporte Garantisa: $549.222` y `4,17% sobre $13.170.800 financiados` para la base del ejemplo. Los valores son dinámicos, con formato colombiano y redondeo de presentación a pesos. Se aplica en corto plazo, segmentos CP/LP y Cuota Inicial; se conserva la ayuda contextual.
- Idiomas tiene columna y acceso directo en Actualizar Programas. El editor muestra el valor actual y el nuevo valor en una sección propia para pregrados. Mantiene revisión antes de guardar, control de versiones y auditoría por campo. En posgrados indica No aplica, de acuerdo con el catálogo y el flujo existentes.
- El aviso bajo el título permanece vacío y oculto durante el inicio. La pantalla global sigue mostrando la carga. Ante un fallo de inicio, el aviso se hace visible con instrucciones de recuperación.
- Se documentó la diferencia entre incorporar la pantalla a la web institucional y consultar datos por API. Ver [plan público y pendientes de DTIC](PUBLIC_INTEGRATION_PLAN.md).

## Validación

109 pruebas aprobadas: catálogo de 173 identidades únicas, motores financieros, importación/exportación, autenticación y permisos, auditoría, configuración, carga y leyenda. Las pruebas adicionales verifican el ejemplo, descuento y contado, segmentos CP/LP, Cuota Inicial, porcentajes configurables incluido cero, y edición exclusiva de Idiomas con matrícula intacta y control de concurrencia.

Revisión en navegador del servidor local con una base temporal:

- Guardado de Idiomas de un pregrado de prueba, reapertura del editor y propagación al botón Simular idiomas.
- Leyenda exacta del ejemplo en escritorio y móvil de 390 px, sin desbordamiento horizontal de la leyenda ni del editor.
- Inicio con respuesta del servidor deliberadamente demorada: pantalla global visible y aviso del contenido vacío y oculto.
- Sin errores de consola durante el recorrido.

Los seis archivos 03-finance-core.js / 07-financing-engine.js y los catálogos embebidos originales mantienen sus hashes. No se cambió la base real de programas ni matrículas; los valores utilizados para probar el guardado pertenecen únicamente a una base temporal.

## Publicación

El servicio público institucional sigue pendiente. Esta revisión no cambia el acceso autenticado actual ni habilita nuevas rutas anónimas. Un push de la rama de trabajo no confirma por sí mismo un despliegue en Render o en la web institucional.
