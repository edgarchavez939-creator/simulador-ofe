# PDF: auditoría y propuestas para aprobación visual

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

Fecha: 16 de octubre de 2026. Estado: propuestas; exportador sin modificar.

## Cambio administrativo completado

Idiomas y Editar llamaban a `selectProgram` con el mismo programa, permisos
`programs.update`, formulario, revisión y actualización `PUT /api/admin/programs/:id`.
Idiomas solo enfocaba `#program-languages`; no tenía campos, permisos ni guardado
exclusivos. Se elimina su botón, rama de eventos, argumento de enfoque y contenedor
con estilo exclusivo. Editar conserva la sección Idiomas, validación, guardado y
registro de auditoría del valor. La columna Idiomas continúa visible.

Verificación: 119 pruebas aprobadas, incluida edición exclusiva de Idiomas sin
cambiar matrícula; comprobación en navegador con una base efímera: cambiar Idiomas
de 0 a 175.000 desde Editar, revisar y guardar; matrícula 16.105.200 intacta.
No se modifican datos reales o embebidos durante esa prueba.

## Auditoría del exportador vigente

Se inspeccionaron las tres copias de `10-pdf-aptos.js`, su conexión al servicio de
exportación y el modelo `shared/exports/simulation-report.js`. Se renderizaron los
resúmenes de corto plazo, mixto, cuota inicial, idiomas y reestructuración con el
renderer actual sobre canvas, usando snapshots de los calculadores y Public Sans.
No se alteró el código de producción para generar las vistas de auditoría.

1. **Duplicación:** en corto plazo la tasa E.A. aparece en el destacado, tarjeta y
   condiciones; plazo y número de cuotas en tres zonas. Financiado, intereses,
   Garantisa y cuota inicial reaparecen en condiciones. La tabla suma repeticiones.
2. **Orden de lectura:** domina la cuota antes de explicar matrícula, aporte inicial
   y capital. En corto plazo falta el valor de matrícula y el total inicial; el
   total del crédito mostrado excluye el pago inicial y no equivale al costo total.
3. **Alineación:** las columnas del bloque destacado no reservan espacio exclusivo
   para etiquetas y montos; cantidades largas se acercan o superponen a etiquetas.
   El nombre académico se fuerza a una línea con tamaño mínimo, sin salto adaptativo.
   En el renglón de totales de la tabla, total del crédito ocupa la columna Saldo;
   debe tener una ubicación y un significado propios.
4. **Espacio y jerarquía:** destacado de 220 px, cuatro tarjetas y condiciones
   repetidas consumen el espacio que necesita un resumen progresivo. La geometría
   decorativa no aporta comprensión financiera. Resúmenes parciales de amortización
   vuelven a aparecer en los anexos cuando el plazo supera ocho cuotas.
5. **Información por modalidad:** cuota inicial distingue el desembolso, pero
   repite Garantisa y alterna su nombre con “aporte al fondo”. Mixto presenta CP y
   capital LP dispersos, sin condiciones LP completas en el resumen. Idiomas conserva
   etiquetas CP aunque sea una operación simple. Banco aliado conserva cargos cero.
   Largo plazo puro hereda bloques CP “No aplica”.
6. **Identificación y alcance:** no existe firma corta ni etiqueta Usuario Público,
   ni Vigilado Mineducación. La nota informativa breve no contiene el alcance íntegro
   de validación y aprobación solicitado. El PDF se rasteriza como JPEG: el texto no
   queda seleccionable y puede perder nitidez al ampliar.
7. **Snapshot:** los importes principales salen del resultado, pero fecha, código y
   calendario estimado se generan al exportar; nivel y proyecciones dependen del
   estado vigente. La futura implementación debe usar el snapshot completo, sin
   volver a leer controles o condiciones globales posteriores. El modelo compartido
   ya conserva fecha, programa y nivel, pero hoy guarda el nombre del usuario; la
   firma corta debe derivarse del correo de sesión al implementar, sin cambiar Excel
   accidentalmente.
8. **Reestructuración:** existen capital pendiente, intereses corrientes, mora,
   saldo y costos; no existen cuota vigente, tasa anterior o plazo restante. No se
   inventará una comparación o ahorro para campos no capturados.

9. **Diferencias entre copias:** la pública y la raíz conservan leyendas con 4,17%
   fijo en algunos exports, mientras OFE utiliza el porcentaje del resultado; las
   fechas públicas dependen de la zona del navegador. La copia raíz también conserva
   el encabezado anterior de Cuota Inicial. Unificar esas salidas forma parte de la
   implementación posterior a la aprobación, no de esta entrega.

## Tres alternativas entregadas para revisión

Cada PDF contiene dos muestras independientes: una de corto plazo y una mixta.
No son dos páginas de una única simulación. Los importes provienen del motor actual
mediante los fixtures del proyecto; el total mixto conocido procede de OFEReport.
Public Sans está incrustada; montos en COP, rojo y dorado institucionales, nota
completa, firma representativa chavezje y leyenda vertical ascendente en margen.
Son maquetas independientes: no están conectadas a botones o servicios de la app.

| Propuesta | Ventaja / lectura | Densidad | Mixto y reestructuración | Anexos y extensión |
|---|---|---|---|---|
| A: editorial | Lectura institucional: contexto, pago inicial, financiación, resultado. Los importes comparten eje derecho. | Media, orientada al resumen. | CP y LP en dos columnas debajo de la financiación total; situación actual y propuesta seguirían el mismo patrón. | Resumen en una página; plan completo en anexo. Encabezado y columnas repetidos en cada página del anexo. |
| B: flujo de pago | Ruta numerada: valor académico, pago inicial, financiación, resultado. Explica cada paso. | Baja a media; lectura guiada. | Desglose CP y LP dentro del paso de financiación; comparación de condiciones como subsecciones del paso correspondiente. | La ruta termina en el resumen; calendarios y proyecciones comienzan en nueva página, sin repetir la ruta. |
| C: compacta | Consulta rápida en bandas y filas. Integra seis cuotas en el resumen de corto plazo. | Alta, con tabla de 7,6 pt; revisar preferencia de legibilidad antes de elegir. | CP y LP comparten columnas; reestructuración usaría columnas Actual y Propuesta solo para datos disponibles. | Una página para escenarios sencillos con tabla corta; tablas extensas pasan completas a anexos, con encabezados repetidos. |

Para todas: nunca dividir una fila, bloque Garantisa o firma entre páginas; si un
nombre largo o contenido adicional desplaza la nota, ampliar a una página más sin
reducir excesivamente el texto. Mantener márgenes y pie, numerar páginas y conservar
el alcance de simulación en anexos, sin repetir los totales del resumen.

## Cifras de la muestra corta (mismo snapshot para A, B y C)

- Programa: Ciencia Política y Gobierno; pregrado.
- Matrícula: 13.170.800 COP; cuota inicial: 1.000.000 COP.
- Capital financiado: 12.170.800 COP; Garantisa: 507.522,36 COP (4,17%).
- Total inicial: 1.507.522,36 COP.
- Tasa: 1,53% efectiva mensual vencida; seis meses, seis cuotas.
- Cuota calculada: 2.138.465,3341507674 COP.
- Intereses: 659.992,0049046724 COP; costo total: 14.338.314,364904605 COP.
- Visualización a pesos enteros; no se recalculan cuotas a partir del valor redondeado.

## Validación de las propuestas

Se revisaron las seis páginas renderizadas. Se comprobó fuente Public Sans incrustada,
márgenes de contenido y de leyenda vertical, orientación de abajo hacia arriba,
nota completa, firma corta sin correo y correspondencia de cifras con los snapshots.
La firma chavezje en las muestras es representativa solicitada para la propuesta;
la obtención automática desde la sesión y Usuario Público se implementarán solamente
tras aprobar el diseño. Los PDFs no constituyen una integración o validación de esa
función futura. Tampoco se ha hecho aún la validación final pantalla/PDF/Excel de
un nuevo exportador: queda para la fase expresamente autorizada después de elegir.

## Límite de esta entrega

No se cambian los exportadores, el modelo de snapshots, las fuentes, los cálculos,
Garantisa, los catálogos, los archivos 03-finance-core.js ni 07-financing-engine.js.
No hay migraciones ni archivos de producción eliminados. Únicamente se publican
la limpieza del acceso duplicado y esta auditoría. La implementación del nuevo PDF
queda pendiente de selección o aprobación explícita del usuario.
