# Recursos de radicación: tres módulos de crédito (v20)

Corrección solicitada el 20 de octubre de 2026. La configuración tiene exactamente tres enlaces independientes:

| Módulo | ID existente | Alcance |
| --- | --- | --- |
| Cuota Inicial | `initialPayment` | Pregrado y posgrado |
| Crédito a Corto Plazo | `shortTerm` | Pregrado y posgrado |
| Crédito Corto y Largo Plazo | `mixed` | Pregrado y posgrado |

En **Administración → Configuración → Parámetros → Recursos de radicación por módulo de crédito**, habilitar y editar cada recurso de forma independiente. Se conservan validación HTTPS, texto, descripción opcional, tipo, revisión previa, permisos, CSRF, auditoría y control de versión. No se separan los enlaces por nivel académico.

El PDF utiliza el identificador del módulo capturado al calcular. Corto y Largo Plazo usa `mixed` también cuando un escenario financia el 100 % a CP o el 100 % a LP. Idiomas hereda el enlace de Corto Plazo o Corto y Largo Plazo según dónde se originó el resultado; cambiar después el módulo visible no cambia el enlace de esa simulación. Banco Aliado e idiomas desde Banco Aliado, y Reestructuración, conservan sus exportables sin estos recursos.

El espacio y tratamiento del enlace en el PDF permanecen idénticos a v19: primera página de cada simulación, sin cambios en geometría, contenido financiero, tipografías anteriores ni número de páginas. Deshabilitado o sin URL, no agrega elementos.

## Actualización desde v19

No requiere variables nuevas. Respaldar SQLite y actualizar el código conservando `OFE_DATABASE`. La migración automática `006-radication-modules.sql`:

1. Conserva la configuración previa de pregrado, posgrado e idiomas, su versión y responsable en `radication_resources_legacy`. Esta información solo se presenta en la consulta administrativa, dentro de «Consultar la configuración anterior».
2. Crea los tres módulos. Cuota Inicial y Corto y Largo Plazo comienzan sin URL y deshabilitados.
3. Si los recursos anteriores de pregrado y posgrado son exactamente iguales, conserva ese recurso como enlace común de Corto Plazo. Si difieren, Corto Plazo comienza sin enlace y el administrador puede consultar ambos para decidir qué configurar. No se reasigna automáticamente el antiguo recurso de Idiomas a otro módulo.
4. Incrementa la versión y registra la migración en auditoría. Al reiniciar no repite el cambio ni sobrescribe configuraciones nuevas. Las ediciones desde una página vieja reciben conflicto de versión o validación; recargar antes de guardar.

Se conservan cuentas, catálogo (29 pregrados y 144 posgrados), matrículas, configuración financiera, mantenimiento, apariencia y módulos del menú público. No se modifican los motores de cálculo.

## Validación

**147 pruebas aprobadas, 0 fallidas**. Incluyen los tres enlaces en ambos niveles, independencia y URL seguras, PDF con y sin recursos, distinción frente a Banco Aliado y Reestructuración, herencia de Idiomas, distribuciones 100 % CP/LP, migración de recursos iguales/distintos, copia administrativa, auditoría y persistencia. Se compara el número de páginas y las posiciones de los elementos originales del PDF.

Las configuraciones globales requieren el servicio Node (Render o servidor institucional). GitHub Pages sigue siendo estático. La entrega no incluye bases, credenciales ni URL inventadas; los dominios de prueba solo aparecen en pruebas automatizadas.
