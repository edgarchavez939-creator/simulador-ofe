# Program Catalog v1D: selección de programas por ID

Los selectores de Público y OFE consumen `SimuladorOFE.catalog.programs`, la lista validada que `ProgramCatalog` entrega durante el arranque. Cada opción guarda el ID único del programa. Cambiar de selección, nivel o subnivel no vuelve a consultar al proveedor.

## Comportamiento

- Se muestran únicamente programas activos del nivel y subnivel seleccionados.
- Los subniveles se obtienen del catálogo cargado. Se conserva el orden conocido de Doctorado, Maestría y Especialización cuando están presentes; otros subniveles suministrados por la fuente se añaden después.
- Matrícula, idiomas y semestres se toman del registro seleccionado por ID. No se buscan semestres por nombre ni se interpretan valores económicos desde el texto de la opción.
- En Mixto se conserva el valor de respaldo de 8 semestres cuando la fuente no proporciona semestres, como en la interfaz anterior.
- Una selección vacía o inválida limpia la matrícula y los datos del botón de idiomas. Cambiar de nivel o filtro también limpia la selección anterior.
- Los arrays legacy `PROGRAMAS` y `POSGRADOS` siguen publicados por el runtime como compatibilidad, pero los selectores ya no los leen.

## Nombres repetidos

Cuando varios programas comparten nivel, subnivel y nombre, la etiqueta visible incluye su matrícula. Para el grupo real de Seguridad de la Información aparecen $20.495.600 y $14.346.600, con IDs diferentes.

La etiqueta nativa `option.label` contiene esta distinción; `textContent` conserva el texto que los consumidores financieros anteriores esperan. Los resultados generados por la interfaz conservan el nombre completo del registro, sin incorporar el texto de la matrícula. No se inventan códigos, sedes ni modalidades.

## Identidad en simulaciones e historial

La capa de interfaz añade `progId`, `catalogSource`, `nivel` y `subnivel` a los resultados nuevos de Corto Plazo, Mixto, Banco y Cuota Inicial, después del cálculo correcto. Esta información acompaña al snapshot existente del historial. No altera fórmulas ni importes.

Al duplicar un historial nuevo, se recupera el ID exacto del mismo origen y se respeta su nivel académico. Si el ID no existe, pertenece a otro origen o no coincide con el nombre/nivel guardados, no se selecciona otro registro parecido. Los valores históricos siguen restaurándose para permitir una simulación manual.

Los historiales antiguos, sin ID, se resuelven por nombre y matrícula solo cuando la coincidencia es inequívoca; un nombre único permite conservar selecciones con una matrícula histórica ajustada. Ante ambigüedad, el selector queda vacío. La matrícula y demás condiciones guardadas siguen siendo las del historial.

Los IDs del origen embedded continúan siendo técnicos y transitorios. La garantía de identidad entre versiones requiere identificadores persistentes suministrados por DTIC; v1D no convierte esos IDs en códigos institucionales.

## Verificación

```bash
node --test scripts/verify-program-catalog.cjs scripts/verify-program-catalog-v1c.cjs scripts/verify-program-catalog-v1d.cjs
```

La prueba v1D usa un DOM simulado y los módulos reales de interfaz, cálculos, exportaciones, idiomas, historial y financiación. En ambas aplicaciones y con los tres proveedores, selecciona los 173 registros en los cuatro selectores y comprueba valores e identidad. Verifica filtros, etiquetas duplicadas, selección vacía, inactivos, subniveles proporcionados por API, ausencia de peticiones adicionales, las cuatro rutas de cálculo, Idiomas y recuperación de historial. Ejecuta también las 10 pruebas internas del motor financiero.

Las regresiones de v1B/v1C verifican IDs, carga remota y preservación de los tres catálogos y las seis copias de los motores financieros por SHA-256. Estas pruebas no sustituyen la aceptación visual final en los navegadores objetivo de DTIC.

## Comprobación en navegador — 15 de octubre de 2026

Se verificó el arranque de Público y OFE en el navegador integrado, sin errores de consola. En Público se calcularon Corto Plazo con el posgrado de matrícula $14.346.600 y Mixto con Arquitectura; la selección conservó 9 semestres y $1.635.500 de idiomas, y el cálculo de Idiomas se completó. En OFE se calcularon Banco y Cuota Inicial con Arquitectura, se comprobaron las dos etiquetas del posgrado duplicado con el filtro de Especialización y se duplicó desde el historial una simulación del registro `source-71`, recuperando su ID, nivel y matrícula de $20.495.600.

Las 44 pruebas automatizadas pasaron en el repositorio real antes del commit.
