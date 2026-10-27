# Auditoría administrativa v23

Revisión del 27 de octubre de 2026, sobre `e867f93`.

## Categorías disponibles

| Módulo | Categoría | Qué identifica |
| --- | --- | --- |
| Usuarios | Usuarios | Creación, nombre, correo, rol y estado de una persona. |
| Programas | Programas académicos | Nombre, matrícula, idiomas, semestres y estado del programa. |
| Configuración | Parámetros de simulación | Tasas, cuotas y porcentajes de Garantisa. |
| Configuración | Textos del simulador y PDF | Cada uno de los 42 textos, con su nombre descriptivo. |
| Configuración | Colores de la interfaz | Color principal y colores de apoyo. |
| Configuración | Mantenimiento del simulador | Activación, título y mensaje. |
| Configuración | Menú público | Visibilidad de cada módulo. |
| Configuración | Recursos de radicación | Enlaces, descripción y tipo de recurso por módulo de crédito. |

La tabla presenta fecha, usuario, categoría, acción, elemento/campo, resultado y detalle. Un cambio en `ui_academic`, por ejemplo, se identifica como **Textos del simulador y PDF → Actualizó un texto → Sección de información académica**. Los nombres describen el campo y se mantienen estables aunque cambie su contenido.

## Consulta y detalle

- El filtro Categoría se adapta al módulo seleccionado y Acción muestra las operaciones correspondientes al módulo o categoría. Aplicar filtros inicia una consulta nueva; Mostrar más conserva la última consulta aplicada, aunque se estén editando los controles. Limpiar filtros reinicia la consulta.
- El detalle muestra Anterior y Nuevo completos, con saltos de línea, ajuste de palabras y un único desplazamiento del diálogo para textos largos. Roles, estados, visibilidad, importes y tipos de recurso se expresan en español. Los recursos compuestos y migraciones históricas se muestran por campo, sin convertir objetos en texto técnico.
- Los códigos e identificadores originales se consultan en Referencia técnica, que permanece cerrada inicialmente. También conserva los valores originales. Los contenidos se escapan antes de insertarlos en la interfaz.
- La consulta administrativa incluye las migraciones de recursos que ya existan. No crea eventos históricos ni modifica los almacenados. La base conserva separadamente los eventos de acceso y contraseñas; esta tabla de cambios administrativos mantiene su exclusión antes de paginar.
- El administrador de programas solo consulta cambios de Programas. El servidor sigue aplicando este límite aunque se manipulen filtros. El usuario del simulador no accede a Auditoría.

## Instalación y validación

Desplegar el código actualizado siguiendo el procedimiento institucional existente. Sin variables, dependencias ni migraciones nuevas. En GitHub Pages no hay servicio de auditoría; esta función opera en el área interna autenticada del servidor.

176 pruebas aprobadas: cobertura nueva de categorías, nombres de los 42 textos, traducciones, objetos anidados, textos largos, escape de contenido, filtros, paginación y permisos. Revisión local en navegador de tabla, filtros, comparación de textos y recursos. Los motores, los 173 registros base del catálogo y los exportables permanecen intactos.
