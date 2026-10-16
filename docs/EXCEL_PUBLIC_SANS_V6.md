# Excel institucional y calibración visual v6

> Documento histórico. La tipografía y composición de Excel se actualizan en
> [Resultados y Excel compacto v14](RESULTADOS_EXCEL_V14.md): Aptos Narrow
> exclusivamente para Excel; Public Sans permanece en la app y el PDF.

Implementación sobre `feat/dtic-readiness`, a partir de `7ff8f7a`. Verificación: 15 de octubre de 2026. Los datos de prueba son ficticios y se ejecutan en una base temporal.

## Resultado y fuente de verdad

El Excel se genera localmente con ExcelJS 4.4.0 y abre en **Resumen**. La hoja **Plan de pagos** aparece únicamente cuando el resultado contiene filas reales de amortización. Los comparativos contienen los indicadores guardados de cada escenario en Resumen.

`simulation-report.js` lee `SimuladorOFE.state.results` y `state.restructuring.current`, los mismos resultados del motor consumidos por la pantalla y el PDF. El exportador no vuelve a calcular cuotas, intereses, Garantisa o amortizaciones; utiliza los importes y las filas guardadas. Las sumas de presentación y las fórmulas SUM del detalle consolidan esos importes, sin introducir otro motor financiero. La diferencia de capacidad se presenta como cero si el residuo de coma flotante es inferior a una millonésima de peso, para evitar un «($ 0)» engañoso.

Cada cálculo nuevo captura fecha, programa/nivel seleccionados y nombre del usuario de la sesión. No se consultan los campos editados posteriormente ni los parámetros globales vigentes al descargar. Los resultados antiguos sin fecha capturada indican «Fecha de exportación · Fecha original no registrada». No se inventan programa, identificador institucional ni fechas de vencimiento. El identificador interno del catálogo no se imprime.

Los seis archivos protegidos `03-finance-core.js` y `07-financing-engine.js`, las tres copias de los catálogos embebidos, los 29 pregrados, los 144 posgrados, sus matrículas y sus IDs permanecen intactos. La prueba de catálogo compara sus SHA-256 con la línea base existente y verifica 173 IDs únicos.

## Estructura y campos exactos

Encabezado común: Simulador de Crédito, Universidad del Norte, modalidad, programa/nivel cuando existen, fecha real y usuario cuando está disponible. Todas las modalidades incluyen la leyenda informativa completa.

Grupos reutilizados (solo se emiten valores presentes, finitos y pertinentes):

- **Matrícula:** Valor de matrícula; Becas y descuentos y Valor neto cuando hay beneficios.
- **Aporte inicial:** Cuota inicial; Aporte Garantisa; Total inicial. En mixto se separan Garantisa corto plazo y Garantisa largo plazo para cada componente financiado. Banco muestra Otros cargos iniciales y no Garantisa.
- **Garantisa:** Porcentaje aplicado; Base de cálculo. El importe se muestra una sola vez en Aporte inicial. No se incluye en el capital ni en cada cuota.
- **Financiación:** Monto financiado; Tasa; Tipo de tasa (Efectiva); Periodicidad (Mensual vencida); Plazo (meses); Número de cuotas; Cuota mensual estimada.
- **Totales proyectados:** Monto financiado; Total intereses; Total de cuotas proyectadas; Costo total estimado. Una nota explica lo que incluye el costo.

| Modalidad | Campos/grupos exportados y particularidades |
| --- | --- |
| Corto plazo | Matrícula, Aporte inicial, Garantisa, Financiación, Totales proyectados. Plan con las filas CP originales. |
| Largo plazo puro | Matrícula, Cuota inicial, Garantisa largo plazo, Total inicial; Porcentaje aplicado y Base de cálculo LP; Monto financiado total; Componente largo plazo con Monto financiado y Plazo estimado de amortización (meses); Totales conocidos con Monto financiado, Capital LP sin intereses futuros y Costo total conocido, sin intereses futuros LP. Sin plan cuando no existe amortización definitiva. |
| Mixto | Matrícula, Aporte inicial CP/LP, Garantisa CP y LP; Financiación total (Monto financiado total); Componente corto plazo con todos los campos de Financiación; Componente largo plazo con capital y plazo estimado si la tasa está pendiente; Totales conocidos: Monto financiado, Intereses conocidos (corto plazo), Crédito conocido (CP + capital LP), Costo total conocido, sin intereses futuros LP. Plan solo con las filas existentes. |
| Banco aliado | Matrícula; Cuota inicial, Otros cargos iniciales, Total inicial; Financiación y Totales proyectados. No Garantisa. El costo incluye los cargos iniciales reales del resultado. |
| Cuota inicial | Matrícula; Cuota inicial requerida (sin Garantisa), Aporte Garantisa, Total inicial; Garantisa; Financiación; Totales proyectados; Capacidad de pago con Capacidad mensual indicada, Cuota mensual calculada y Diferencia disponible. La cuota inicial requerida excluye expresamente Garantisa. |
| Idiomas CP | Valor de idiomas, beneficios/valor neto cuando existen; Aporte inicial, Garantisa, Financiación y Totales proyectados. El plan utiliza la amortización propia de Idiomas. |
| Idiomas mixto | Valor de idiomas y grupos del Mixto aplicados a `idCP`/`idLP`, con pendientes LP explícitos. |
| Reestructuración | Condición actual: Capital pendiente, Intereses corrientes causados, Intereses de mora, Saldo actual. Nueva condición: Costos adicionales financiados, Monto reestructurado. Financiación de la nueva condición; Totales proyectados. Capacidad de pago, si se indicó: Capacidad mensual indicada, Nueva cuota mensual, Diferencia disponible. No inventa programa ni ahorro frente a una cuota vigente desconocida. |
| Comparación de escenarios | Por escenario guardado: Programa, Monto financiado, Pago inicial, Cuota mensual (o CP), Total intereses (o Intereses conocidos CP), Costo total estimado (o Costo conocido, sin intereses futuros LP). No produce un plan que los escenarios no almacenan. |

**Plan de pagos:** Cuota, Saldo inicial, Capital, Interés, Pago y Saldo final. Si hay varios planes reales, añade Componente. El saldo inicial de cada fila es el principal o el saldo final anterior; capital/interés/pago/saldo final son los valores originales. Totales de capital, intereses y pagos con SUM y resultados almacenados. Sin columnas técnicas ni fechas artificiales.

### Límite financiero del largo plazo y de reestructuración

El motor actual representa LP con `noAmortize`, capital, plazo estimado, cuota nula y filas vacías. La tasa se define al iniciar la amortización. Por ello no es correcto completar tasa, cuota, intereses ni plan LP. El Excel explica esta ausencia y excluye los intereses futuros LP de los totales conocidos. El plan del mixto contiene el componente CP real. Si en una fase posterior el motor entrega filas LP y una tasa definitiva, el adaptador admite esos datos sin recalcularlos.

En reestructuración se registran los componentes del saldo actual y las condiciones nuevas; no se registran cuota vigente, tasa anterior ni plazo restante. Se informa esa limitación y no se estima ahorro.

### Garantisa

Se conserva el importe calculado y el porcentaje de `settingsSnapshot` del resultado: referencia inicial CP 4,17 % y LP 2,86 %, ajustable mediante la configuración existente. Para resultados antiguos se utiliza la tasa capturada o la proporción importe/base fiable. Base CP/Idiomas CP: monto financiado CP; base LP: capital LP; Cuota inicial: financiación calculada. Banco aliado y reestructuración no incorporan Garantisa. Los cambios globales posteriores no alteran el Excel de una simulación ya calculada.

## Formato, impresión y leyenda

Public Sans en todas las celdas con contenido y en el pie de impresión. Importes numéricos con formato COP `[$$-es-CO] #,##0` (secciones adicionales para negativos/cero), porcentajes decimales con `0.00%`, cuotas/plazos enteros y fecha/hora como fecha real de Excel. El formato respeta la configuración regional del lector; el renderizador de QA muestra separadores estadounidenses, mientras Excel aplica su configuración local. Las fechas se representan con la hora colombiana del instante capturado, en el serial de Excel que no tiene zona horaria.

Resumen usa bloques con espacio en blanco, rojo institucional sobrio y acento dorado; no es una tabla gigante de clave/valor. No tiene autofiltro. Plan de pagos usa bandas sutiles, encabezado fijo, filtro, cuatro filas congeladas y títulos de impresión repetidos. Áreas de impresión explícitas, A4, una página de ancho y alto libre; el número de páginas verticales depende de la modalidad y del número de cuotas. Resumen es vertical y Plan de pagos horizontal.

La leyenda se ubica inmediatamente después de Totales, dentro del área imprimible, antes del bloque complementario de capacidad cuando existe. Título: **SIMULACIÓN SUJETA A VALIDACIÓN Y APROBACIÓN**. Texto exacto:

> Esta es una simulación de crédito con fines informativos. Las condiciones, valores, tasas, plazos, cuotas y demás resultados presentados están sujetos a validación, estudio y aprobación definitiva por parte de la Universidad del Norte y/o las entidades que intervengan en el proceso de financiación.

## Public Sans y escala visual

Fuente variable alojada en el proyecto y servida también en el acceso anónimo; no depende de Google Fonts en tiempo de ejecución. Se retiraron los enlaces externos y se reemplazaron los estilos visuales Inter/JetBrains/Montserrat/Aptos por Public Sans. Las familias antiguas pueden aparecer en documentación histórica o cadenas protegidas del motor: la regla visual común impone Public Sans sin modificar esos archivos. Los alias `--font-sans` y `--font-mono` apuntan a Public Sans; las cifras usan `font-variant-numeric: tabular-nums` y `font-feature-settings: 'tnum' 1`.

| Token semántico | Tamaño de escritorio |
| --- | --- |
| `--type-page` / `--type-numeric` | 20 px |
| `--type-section` | 16 px |
| `--type-subsection` | 14 px |
| `--type-body`, `--type-button`, `--type-table` | 13 px |
| `--type-label`, `--type-small` | 12 px |
| `--type-caption` | 11 px |
| `--type-display` / resultado principal | 34 px |

Se recuperó la escala previa a v5 tomando como referencia etiquetas, campos, títulos de tarjeta y cifras del formulario CP y Mixto. Se recalibraron acceso, navegación, Usuarios, Programas, Configuración, Auditoría, modales, conversor y exportaciones; no se ampliaron los formularios financieros de referencia. En móvil el título de cabecera baja a 14 px y el resultado principal a 26 px. Los grupos de métricas de resultados estrechos pasan a dos columnas para conservar completos los importes. El PDF sigue utilizando los resultados guardados y carga Public Sans antes de dibujar sus páginas.

Excel no incrusta automáticamente una fuente de sistema en el libro. Se incluyen fuentes estáticas oficiales Regular/Bold y sus licencias; quedaron instaladas en este equipo para las pruebas. La aplicación Excel ya abierta conservó sustitución visual en algunos textos regulares aunque la celda declara Public Sans. Puede necesitar reiniciarse; no se cerraron los otros libros del usuario para forzarlo. El libro conserva Public Sans en todos sus estilos y el navegador sí muestra la fuente local.

## Iconografía, apariencia y carga en lote

Se reutiliza el registro local de SVG de **Lucide** en `shared/ui/icons.js`; no se añade otra biblioteca ni un CDN. Actualizar Programas utiliza `book-open`; Configuración, `settings`; Usuarios, `users`; Auditoría, `clipboard`. Garantisa utiliza `shield-check`. Se añadieron iconos funcionales a títulos administrativos, categorías de parámetros, búsqueda y acciones de archivo (seleccionar, validar, confirmar y quitar), con texto en las acciones y nombre accesible en botones de solo icono.

Apariencia permanece en el avatar. Tres botones horizontales `sun`/`moon`/`monitor`, tooltips Claro/Oscuro/Sistema, etiquetas Tema claro/Tema oscuro/Usar tema del sistema, `aria-pressed` y señal visual de selección. Conserva la persistencia existente y el seguimiento del tema del sistema. Tab recorre las opciones del popover; Escape lo cierra y devuelve el foco. No se introducen controles de tema paralelos en la barra lateral.

La desalineación del cargador provenía de los contenedores de icono con alineación de línea y dimensiones implícitas. El componente común fija un área de 40 × 40 px con grid centrado, SVG de 24 px y alineación flex central; no usa desplazamientos arbitrarios. Se comprobó una carga de una fila: un cambio y cero incidencias, retenida para revisión sin confirmar ni alterar el catálogo. La plantilla operativa también usa ExcelJS/Public Sans y conserva exactamente los 173 IDs, matrículas, columnas y versiones del protocolo de importación.

## Conversor

Se sustituyó una tabla sin destino explícito por origen/destino visibles: valor, tipo efectiva/nominal, período y capitalización de las nominales. Resultado principal, explicación de la tasa, botón Intercambiar, conversión por formulario y tabla de equivalencias complementaria. En tablet el resultado baja del formulario; en móvil los grupos se apilan.

Las nueve periodicidades y las fórmulas anteriores se conservan: diaria 365, semanal 52, quincenal 24, mensual 12, bimestral 6, trimestral 4, cuatrimestral 3, semestral 2 y anual 1. Se usa la tasa efectiva anual como puente. La nominal se interpreta según su período declarado y su capitalización. No se modificó el motor financiero.

Se rechazan vacío, negativo, valores no finitos, períodos inválidos y desbordamiento; cero es válido. Se corrigió la interferencia del validador genérico que retiraba el error propio del conversor. El intercambio mantiene precisión y actualiza controles/resultado. Caso visible: 1,25 % efectiva mensual → 16,075452 % efectiva anual → intercambio → 1,25 % efectiva mensual.

## Pruebas y evidencia

- **100 pruebas automatizadas aprobadas**, sin omitidas ni fallidas: catálogo, selectores, resultados, permisos/sesiones/CSRF, administración, parámetros, auditoría, PDF y Excel. El nuevo grupo v6 aporta cuatro pruebas con miles de combinaciones internas.
- Conversión: 9 × 9 períodos, los cuatro pares de tipos, cuatro valores (incluido cero), capitalizaciones y retorno con tolerancia 1e-7 puntos porcentuales; comparación con las fórmulas anteriores.
- Excel: serialización y reapertura real de CP, Mixto, Banco, Cuota inicial, Idiomas y Reestructuración; tipos numéricos/fecha, Public Sans en cada celda, detalle real, SUM, filtros, congelación, impresión y leyenda. LP puro sin hoja ficticia; Idiomas mixto con pendientes; Garantisa cero, principal de 1 y 10^12 pesos, 600 cuotas, programa ausente/nombre extenso y configuración cambiada después del cálculo.
- Importación, recálculo, inspección sin errores de fórmula y render de ambas hojas de las seis muestras con el motor de artefactos. Inspección visual de Resumen/Plan; apertura nativa de Excel y vista previa de impresión, sin enviar a impresora. Se conservan los libros que el usuario tenía abiertos.
- PDF real generado con el exportador vigente y Public Sans registrada: sin errores de exportación, página renderizada y revisada; conserva Garantisa capturada del 5 % aunque la configuración posterior cambie al 10 %.
- Navegador local con servidor real y cuenta ficticia: escritorio 1440 px, tablet 1024 px, móvil 390 px; sin desbordamiento horizontal del documento. Tablas amplias conservan desplazamiento propio. Revisión de claro/oscuro, apariencia del sistema persistida tras recarga, teclado, barra expandida/contraída y sus iconos distintos. Acceso sin sesión comprobado en escritorio y móvil.
- Pantallas revisadas: CP, Mixto, Cuota inicial, Idiomas, Reestructuración, Conversor, Configuración, Usuarios, Auditoría, Programas y cargador. El conversor mantiene su `aria-invalid` al quedar vacío y lo limpia al corregir.

El botón de Excel mostró la confirmación de descarga en el navegador de pruebas. El navegador integrado no entregó un evento de archivo descargado al controlador; por ello la validación de bytes se hizo serializando/reabriendo el mismo generador real, además de abrir el archivo resultante en Excel. No se afirma haber capturado ese archivo desde la carpeta de descargas.

Las capturas y el libro de ejemplo se entregan fuera del repositorio, en los artefactos locales de esta tarea. No contienen datos de usuarios reales. Las pruebas locales no verifican un despliegue en Render: publicar la rama feature no demuestra por sí solo que el alojamiento en línea haya actualizado su rama configurada.

## Dependencias y procedencia

ExcelJS 4.4.0 se conserva localmente con licencia MIT: [documentación oficial](https://github.com/exceljs/exceljs/blob/v4.4.0/README.md), [bundle versionado](https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js). No se añade un servicio externo para exportar.

Public Sans variable procede del [repositorio oficial Google Fonts](https://github.com/google/fonts/tree/main/ofl/publicsans), con OFL; las fuentes estáticas proceden del [repositorio oficial USWDS](https://github.com/uswds/public-sans/tree/main/fonts/ttf), con su licencia incluida. No se descargan fuentes al abrir la aplicación.

| Archivo | SHA-256 |
| --- | --- |
| `shared/vendor/exceljs-4.4.0.min.js` | `7e49da68588e250dbb8bba190d2caa8ab3787cc0284bda1d8b2f805c4df742c9` |
| `shared/fonts/PublicSans-Variable.ttf` | `d75a7dc1a27eb9e336d5b33f55489d2ecb5621bf694d5c43b2415bce2ca830a8` |
| `shared/fonts/PublicSans-Regular.ttf` | `b577e9bc9887284e90aae5ad0699689ce36b5cd96207efbec68f77f8aed88379` |
| `shared/fonts/PublicSans-Bold.ttf` | `bddd96a0bcd49b292524b4beff57d770ce97482fb3f84b788959422e06b863a6` |

## Inventario de archivos

### Archivos modificados

| Archivo | Cambio / finalidad |
| --- | --- |
| `apps/ofe/index.html` | Carga local de fuente y módulos de exportación; formulario de conversión explícito y navegación coherente. |
| `apps/ofe/simulador-assets/js/01-core-ui.js` | Iconos comunes, cabecera administrativa y convivencia con validación propia del conversor. |
| `apps/ofe/simulador-assets/js/02-reestructuracion.js` | Acción de Excel para el resultado de reestructuración. |
| `apps/ofe/simulador-assets/js/04-exports-pdf-excel.js` | Delegación de los exportadores CP, Mixto/LP y Banco al generador institucional. |
| `apps/ofe/simulador-assets/js/05-idiomas-herramientas.js` | Exportación de Idiomas y delegación al conversor común; retira lógica de interfaz duplicada. |
| `apps/ofe/simulador-assets/js/06-actions-history.js` | Exportación de Cuota Inicial/comparaciones y acción de Excel de reestructuración. |
| `apps/ofe/simulador-assets/js/10-pdf-aptos.js` | Public Sans en las páginas PDF; espera la carga antes de dibujar. Conserva el nombre por compatibilidad. |
| `apps/ofe/simulador-assets/styles.css` | Familia Public Sans para estilos y alias tipográficos existentes. |
| `apps/public/index.html` | Carga local de fuente y módulos de exportación; formulario de conversión explícito y navegación coherente. |
| `apps/public/simulador-assets/js/01-core-ui.js` | Iconos comunes, cabecera administrativa y convivencia con validación propia del conversor. |
| `apps/public/simulador-assets/js/04-exports-pdf-excel.js` | Delegación de los exportadores CP, Mixto/LP y Banco al generador institucional. |
| `apps/public/simulador-assets/js/05-idiomas-herramientas.js` | Exportación de Idiomas y delegación al conversor común; retira lógica de interfaz duplicada. |
| `apps/public/simulador-assets/js/06-actions-history.js` | Exportación de Cuota Inicial/comparaciones y acción de Excel de reestructuración. |
| `apps/public/simulador-assets/js/10-pdf-aptos.js` | Public Sans en las páginas PDF; espera la carga antes de dibujar. Conserva el nombre por compatibilidad. |
| `apps/public/simulador-assets/styles.css` | Familia Public Sans para estilos y alias tipográficos existentes. |
| `index.html` | Carga local de fuente y módulos de exportación; formulario de conversión explícito y navegación coherente. |
| `package.json` | Incluye el grupo de pruebas v6 en la verificación completa. |
| `scripts/test-support/selector-context.cjs` | Pruebas y fixtures de resultados reales, Excel operativo/financiero y regresiones. |
| `scripts/verify-admin-v3.cjs` | Pruebas y fixtures de resultados reales, Excel operativo/financiero y regresiones. |
| `scripts/verify-functional-v1e.cjs` | Pruebas y fixtures de resultados reales, Excel operativo/financiero y regresiones. |
| `scripts/verify-ux-v4.cjs` | Pruebas y fixtures de resultados reales, Excel operativo/financiero y regresiones. |
| `server/app.cjs` | MIME de fuentes y acceso anónimo a los recursos locales del login. |
| `shared/admin/admin-ui.js` | Iconos de títulos, búsqueda y acciones de carga/validación. |
| `shared/admin/program-template.js` | Plantilla ExcelJS con Public Sans, manteniendo el protocolo de importación. |
| `shared/admin/settings-ui.js` | Iconos funcionales en las categorías de parámetros. |
| `shared/auth/login.html` | Public Sans local y densidad común del acceso. |
| `shared/ui/app-shell.js` | Apariencia horizontal con tres botones de icono y estado accesible persistente. |
| `shared/ui/overlays.js` | Recorrido de teclado dentro del popover de Apariencia y restauración del foco. |
| `simulador-assets/js/01-core-ui.js` | Iconos comunes, cabecera administrativa y convivencia con validación propia del conversor. |
| `simulador-assets/js/04-exports-pdf-excel.js` | Delegación de los exportadores CP, Mixto/LP y Banco al generador institucional. |
| `simulador-assets/js/05-idiomas-herramientas.js` | Exportación de Idiomas y delegación al conversor común; retira lógica de interfaz duplicada. |
| `simulador-assets/js/06-actions-history.js` | Exportación de Cuota Inicial/comparaciones y acción de Excel de reestructuración. |
| `simulador-assets/js/10-pdf-aptos.js` | Public Sans en las páginas PDF; espera la carga antes de dibujar. Conserva el nombre por compatibilidad. |
| `simulador-assets/styles.css` | Familia Public Sans para estilos y alias tipográficos existentes. |

### Archivos nuevos

| Archivo | Cambio / finalidad |
| --- | --- |
| `docs/EXCEL_PUBLIC_SANS_V6.md` | Informe funcional, financiero, visual, de pruebas e inventario de entrega. |
| `scripts/test-support/report-fixtures.cjs` | Pruebas y fixtures de resultados reales, Excel operativo/financiero y regresiones. |
| `scripts/verify-excel-v6.cjs` | Pruebas y fixtures de resultados reales, Excel operativo/financiero y regresiones. |
| `shared/exports/excel-report.js` | Libro institucional, formatos, impresión, planes, comparación y descarga. |
| `shared/exports/simulation-report.js` | Adaptador de resultados guardados y captura de identidad/fecha al calcular. |
| `shared/finance/rate-converter.js` | Conversión pura con las nueve periodicidades y fórmulas existentes. |
| `shared/fonts/LICENSE-STATIC.md` | Public Sans local oficial y licencias de redistribución. |
| `shared/fonts/OFL.txt` | Public Sans local oficial y licencias de redistribución. |
| `shared/fonts/PublicSans-Bold.ttf` | Public Sans local oficial y licencias de redistribución. |
| `shared/fonts/PublicSans-Regular.ttf` | Public Sans local oficial y licencias de redistribución. |
| `shared/fonts/PublicSans-Variable.ttf` | Public Sans local oficial y licencias de redistribución. |
| `shared/fonts/public-sans.css` | Public Sans local oficial y licencias de redistribución. |
| `shared/ui/density.css` | Escala semántica, densidad, cifras tabulares, apariencia, cargador y adaptación de resultados/conversor. |
| `shared/ui/rate-ui.js` | Formulario origen/destino, errores, intercambio y resultado principal. |
| `shared/vendor/EXCELJS-LICENSE.txt` | ExcelJS 4.4.0 local y licencia MIT. |
| `shared/vendor/exceljs-4.4.0.min.js` | ExcelJS 4.4.0 local y licencia MIT. |

### Archivos eliminados

Ninguno.
