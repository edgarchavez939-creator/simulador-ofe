# PDF B + C implementado

> Informe histórico de la fase v13. La versión de jsPDF indicada aquí fue sustituida por 4.2.1; el estado vigente está en [Dependencias](DEPENDENCIES.md).

Aprobado por el usuario el 16 de octubre de 2026, junto con la inclusión del logo
y el título “Simulación de Crédito Uninorte” a 15 pt.

## Arquitectura y archivos

Modificados: las tres páginas `index.html` (raíz, OFE y pública), las tres entradas
`10-pdf-aptos.js`, `shared/exports/simulation-report.js`, `package.json`,
`scripts/verify-functional-v1e.cjs` y `docs/DEPENDENCIES.md`.

Nuevos: `shared/exports/pdf-report.js` (composición compartida),
`shared/vendor/jspdf-2.5.1.umd.min.js` (misma dependencia ahora local),
`shared/branding/ofe-color.png`, `ofe-monocromo.png`, `ofe-monocromo-alternativo.png`,
`scripts/verify-pdf-v13.cjs` y este documento. Archivos eliminados: ninguno.

Las entradas anteriores ahora delegan al mismo renderer. El texto es vectorial,
seleccionable y usa únicamente Public Sans incrustada. El logo se rasteriza desde
el arte vectorial aportado, con resolución suficiente para el tamaño de encabezado;
el documento financiero no se convierte en imagen.

La ruta numerada organiza datos académicos, pago inicial, financiación y resultado.
Se omiten bloques sin datos aplicables y los pasos presentes se numeran seguidos.
El resumen comparte márgenes y ejes; los montos se alinean a la derecha. Las tablas
se numeran por cuota, sin inventar fechas de vencimiento. Una tabla de hasta seis
cuotas cabe en el resumen si hay espacio; en caso contrario pasa completa a un
anexo, sin duplicar las primeras filas. Los planes largos y las proyecciones
continúan con encabezados repetidos y nunca se truncan a 16 o 20 registros.

## Contenido por modalidad

- Corto plazo y banco aliado: matrícula, descuentos y neto cuando aplican, aporte
  inicial real, capital, tasa efectiva mensual vencida, plazo, cuotas, intereses y
  costo total. Banco aliado no muestra Garantisa y omite cargos iniciales cero.
- Mixto y largo plazo: financiación total seguida de componentes CP/LP. Se
  conserva el plazo de amortización estimado que devuelve el motor, distinto de
  semestres de estudio. No se inventan tasa, intereses o cuota LP pendientes.
  El costo conocido se identifica expresamente y excluye intereses futuros LP.
- Cuota inicial: cuota requerida sin Garantisa, Garantisa y total inicial como
  conceptos distintos; capacidad y diferencia disponible acompañan el resultado.
- Idiomas: misma composición con valor de idiomas y su propio plan. El PDF
  combinado reúne los dos reportes completos, como simulaciones independientes,
  sin recalcular un crédito nuevo ni mezclar sus calendarios.
- Reestructuración: situación actual, costos adicionales y nueva financiación.
  Cuota, tasa y plazo anterior no registrados se explican como ausentes; no se
  estima un ahorro ficticio. La comparación conserva cada escenario completo
  identificado y su plan dentro del mismo documento.

## Snapshot, Garantisa e identidad

Se reutiliza el modelo normalizado de OFEReport, compartido con Excel; el renderer
no calcula amortizaciones ni obtiene tasas desde controles actuales. Cada resultado
calculado se vincula mediante un WeakMap privado a una copia de su modelo PDF,
incluidas fecha, programa, nivel, condiciones, importes y proyecciones. Exportar
posteriormente no lee los parámetros globales nuevos ni la proyección vigente.
Se devuelve una copia para que un consumidor no pueda modificar el modelo guardado.
Resultados antiguos sin metadata no reciben fechas de simulación inventadas.

Garantisa usa el monto, base y porcentaje del snapshot. La leyenda es
“4,17% sobre $12.170.800 financiados”, adaptada al resultado, sin “3,5% + IVA”.
Los importes se redondean solo al mostrar pesos; el plan conserva la precisión
de los cálculos originales y el mismo total que Excel.

La firma se deriva internamente del correo recibido desde la sesión autenticada
al iniciar el módulo, tomando la parte anterior a @. No se solicita por inputs
ni se lee desde parámetros de URL o una firma enviada por el cliente al servidor.
Se conserva en el modelo privado de la simulación; editar metadata pública no
la sustituye. En la app pública siempre se utiliza Usuario Público, incluso si
hay identidad interna disponible. No se imprimen nombres completos, correos,
roles ni IDs. El archivo sigue siendo una simulación informativa, no un documento
firmado criptográficamente ni una certificación de identidad.

El pie de cada página incluye la leyenda completa de simulación y validación,
la frase “Este documento no constituye aprobación del crédito”, firma corta y
número de página. “Vigilado Mineducación” se ubica en el costado izquierdo con
rotación ascendente de 90 grados, dentro de un margen imprimible.

## Identidad de la Oficina

Se usó el PDF entregado por el usuario. El nombre confirmado es Oficina de
Financiamiento Estudiantil. Solo se sustituyó su texto Arial por Public Sans Bold;
los trazados, colores y proporciones de la marca Universidad del Norte y el
separador se preservaron. Se conservaron los estados gráficos CMYK originales
al retirar el texto, y se verificó igualdad de píxeles del área universitaria en
las tres páginas al renderizar ambas versiones con el mismo motor y escala.
El archivo trae una versión a color y dos páginas monocromáticas; no se inventó
una variante blanca de la marca. El PDF vectorial actualizado se entrega como
arte independiente y la versión a color se usa en los exportables.

## Validación

Suite completa: 124 pruebas, incluyendo seis modalidades, comparación y combinado,
firma chavezje/asesor.credito, vista pública, campos opcionales cero, largo plazo
puro, nombres extensos, 10^12 COP, 96 cuotas, proyección de 20 semestres, cambios
posteriores de configuración, manipulación de metadata y copia del snapshot.

Se generaron PDF reales con jsPDF, se reabrieron y se revisaron todas las páginas
de las seis modalidades. Se validaron fuentes, márgenes, pie, números, ausencia
de correo, orientación de leyenda y saltos de tabla. La descarga del navegador
público se comprobó con Ciencia Política y Gobierno: matrícula 13.170.800, inicial
1.000.000, Garantisa 507.522, financiado 12.170.800, cuota 2.138.465, intereses
659.992 y total 14.338.314; coincide con la pantalla y el modelo de Excel. También
se comprobó una descarga autenticada con firma admin, sin correo completo.

Los catálogos embebidos y los seis archivos 03-finance-core.js/07-financing-engine.js
permanecen idénticos a su versión anterior. No hay cambios de API, migraciones,
roles o autenticación. Render debe desplegar el commit para exponer esta versión
en línea; la validación descrita corresponde a la copia local de la aplicación.

## PDF de bancos aliados sin marca institucional

El exportable de Banco Aliado utiliza encabezado y acentos neutros. Se omiten
el logo UN/OFE, el título Uninorte, la autoría institucional en los metadatos y
la leyenda lateral «Vigilado Mineducación», también en los anexos. La nota de
validación remite a la entidad financiera. No se incorpora una marca bancaria
sin un recurso y una identificación aportados por el usuario.

Los datos académicos, importes y plan de pagos provienen del mismo snapshot.
Esta excepción se aplica por reporte; los demás PDF mantienen su identidad.
Se actualizan las expectativas existentes del control PDF para reflejar esta
excepción. No se ejecutaron pruebas por indicación del usuario.
