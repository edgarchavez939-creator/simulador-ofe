# Módulos públicos, planes de pago y composición — v18

## Cambios aprobados

- «Ver proyección» inicia apagado en el crédito mixto y en el modal de idiomas. El usuario puede activarlo expresamente; la simulación y sus exportables incluyen la proyección solamente cuando se calcula con la opción activa.
- Títulos aprobados: **Plan de pago a corto plazo** y **Plan de pago a largo plazo**, con una explicación visible de cuándo se paga cada parte. Se conservan los plazos, condiciones y fórmulas.
- Cuota Inicial presenta una barra de composición de 40 px de alto, a todo el ancho disponible. Los porcentajes se centran dentro de cada segmento cuando caben. Un segmento muy pequeño conserva su valor en la leyenda y su descripción accesible, evitando superposición o distorsionar la proporción. El contraste del texto se adapta al fondo y al modo claro/oscuro.

## Configurar lo que ve el público

Como administrador del sistema, abrir **Configuración → Acceso público e integración → Módulos visibles para el público**.

1. Consultar los estados actuales. Los siete módulos comienzan visibles al aplicar la migración.
2. Encender o apagar las opciones: Crédito a Corto Plazo, Corto y Largo Plazo, Crédito Banco Aliado, Cuota Inicial, Conversor de Tasas, Comparar escenarios y Mis simulaciones.
3. Pulsar **Revisar y guardar módulos**, revisar el resumen y confirmar.
4. Abrir o recargar la pantalla pública, o actualizar la vista previa, para comprobar el resultado.

Los cambios se guardan en el servidor y quedan registrados por campo en auditoría. Solo se controla el menú público: el área interna conserva sus módulos y permisos, y Reestructuración/Administración siguen sin publicarse. No se introducen interruptores individuales para Idiomas o Ver proyección.

El módulo oculto no puede abrirse mediante la navegación del aplicativo ni desde los botones que llevan a él. Si el primero está oculto se abre el primer módulo habilitado. Si todos están apagados, se presenta «Sin opciones públicas disponibles». No se borran los datos del historial del navegador ni los catálogos al ocultar módulos.

Los cambios se aplican al abrir o recargar la página; no se fuerza la interrupción de una simulación que ya está abierta. La disponibilidad es una configuración de presentación pública, no un sustituto de la autenticación y permisos internos.

## Servidor y persistencia

La migración `004-public-modules.sql` crea `public_module_settings`, con estados booleanos, versión y autor/fecha de actualización. Se aplica al abrir la base existente, conservando usuarios, catálogo, colores y parámetros. Está incluida en las copias SQLite del proyecto. No se necesitan nuevas variables de entorno.

| Ruta | Uso |
| --- | --- |
| `GET /api/admin/public-modules` | Consulta con sesión y permiso `settings.read` |
| `PUT /api/admin/public-modules` | Guarda cambios con `settings.update`, origen válido, CSRF y versión actual |
| `GET /api/public/modules` | Devuelve únicamente `{values:{...}}`, sin datos administrativos; requiere acceso público habilitado |

El PUT recibe `{ "version": 1, "changes": { "bank": false } }`. Solo admite las siete claves documentadas en `shared/settings/public-modules.js`, con valores booleanos. Rechaza campos desconocidos, versiones anteriores y valores no booleanos. La actualización y su auditoría se ejecutan en una transacción; un fallo revierte ambas. Guardar sin cambios no incrementa la versión ni crea eventos ficticios.

La lectura pública exige una configuración completa y válida: si falla la consulta, el arranque informa el error y no sustituye la política del servidor por un menú con todas las opciones visibles.

La variante estática de GitHub Pages no ejecuta este servidor ni recibe cambios administrativos. Mantiene las opciones predeterminadas. Para controlar el menú público desde OFE se utiliza el servicio institucional con API habilitada.

## Publicación para DTIC

1. Respaldar la base de forma consistente y actualizar el proyecto completo.
2. Reiniciar el servicio normal para cargar el código y aplicar la migración. Conservar la misma ruta `OFE_DATABASE` y el mismo origen HTTPS.
3. Como administrador, configurar los módulos y comprobar el enlace público en una ventana sin sesión y la vista previa.
4. Verificar que OFE conserva sus módulos, que la auditoría registra los cambios y que los estados permanecen tras reiniciar.

Revertir a una revisión anterior a v18 deja de aplicar esta política de visibilidad, aunque la tabla siga en la base. Revisar este comportamiento antes de una reversión.

## Verificación

**137 pruebas aprobadas**, incluidas permisos, CSRF, validación estricta, conflictos de versión, guardado sin cambios, rollback por fallo de auditoría, migración sobre una base previa, persistencia, selección del primer módulo disponible, caso de todos apagados y separación entre navegación pública e interna. Las pruebas financieras, importación y exportables se conservan.

Se comprobó en navegador el guardado real de visibilidad y su efecto al abrir la pantalla pública, la navegación interna conservada, la proyección apagada y los títulos aprobados. La barra se revisó en escritorio y móvil de 390 px, en claro/oscuro y con un segmento de 0,1 %, sin desbordamiento horizontal de la página ni de la barra. Las pruebas se hicieron con datos ficticios en una base aislada; no se modificaron ambientes remotos.

Los seis archivos `03-finance-core.js` / `07-financing-engine.js` permanecen intactos, al igual que los datos JSON embebidos de los 29 pregrados y 144 posgrados y los archivos de las bibliotecas locales.
