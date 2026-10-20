# Resultados y Excel compacto v14

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

16 de octubre de 2026. Continúa sobre PDF B + C y la rama `feat/dtic-readiness`.

## Presentación de resultados

`shared/ui/result-details.js` reorganiza únicamente el resultado ya calculado:
primero «Pago total de contado» (el pago inicial completo al desembolso), debajo
el contado de matrícula con su porcentaje real y el aporte Garantisa con su base
y tasa. Mixto conserva los aportes CP y LP separados; banco aliado conserva sus
otros cargos y no inventa Garantisa. Idiomas y Cuota inicial usan el mismo orden.
El porcentaje de contado se calcula sobre la matrícula neta cuando hay beneficios.
Se elimina la tarjeta «Valor Matrícula» del bloque «Crédito a Amortizar».

La transformación se ejecuta después de un cálculo exitoso. No modifica el objeto
financiero, los controles ni las condiciones guardadas; un cálculo fallido no
sustituye las tarjetas. Las tres entradas cargan el mismo módulo de presentación.

## Exportables

- PDF: logo a 243 pt de ancho, antes 270 pt, con altura proporcional. Reducción
  exacta del 10% en cada encabezado. Se preservan arte, Public Sans y composición B+C.
- Excel: Aptos Narrow en todos los textos, también en la plantilla administrativa.
  La aplicación y el PDF conservan Public Sans. No se redistribuyen archivos de Aptos.
- Resumen: etiquetas e importes en una sola fila; total inicial primero;
  tasa Garantisa junto a su aporte; tasa del crédito identificada como efectiva
  mensual vencida; plazo y número de cuotas combinados únicamente si coinciden.
  Se retiran repeticiones del capital y totales que ya se consultan en el plan.
  Se conservan beneficios, costos aplicables, capacidad, advertencias LP y leyenda.
- El encabezado de Excel utiliza la misma marca, a 324 px (243 pt), proporcional.
  Los importes, tasas y fechas siguen siendo valores numéricos y fecha nativos.
- Plan de pagos: cuota, pago mensual, capital, intereses y saldo. Se conserva
  cada cuota y su precisión; se omite la columna redundante de saldo inicial.
  Los totales siguen siendo fórmulas SUM. Con varios componentes se añade una
  columna que los identifica. Se mantienen filtros, encabezado fijo e impresión.
- Se reutiliza el snapshot normalizado; no se recalculan amortizaciones.
  En el ejemplo CP, el resumen pasa de 46 a 32 filas y conserva las seis cuotas
  en una segunda hoja. Un largo plazo pendiente no recibe un plan inventado.

## Verificación

127 pruebas aprobadas, incluyendo fuentes, tipos de celda, totales reales, filas
completas de todas las modalidades, componentes múltiples, 600 cuotas, importes
altos, Garantisa cero y largo plazo puro. Los tres controles nuevos verifican
conservación de snapshots, suma del desglose inicial y reducción exacta del logo.

Se generaron y reabrieron XLSX de seis modalidades; se revisaron visualmente el
resumen y el plan del ejemplo CP con ArtifactTool. Se renderizó el PDF actualizado.
En navegador se verificaron CP, mixto y Cuota inicial, así como las acciones de
Excel/PDF. Caso CP: Ciencia Política y Gobierno, matrícula 13.170.800, contado
1.000.000, Garantisa 507.522, pago inicial 1.507.522, financiado 12.170.800,
cuota 2.138.465, intereses 659.992 y costo total 14.338.314. Pantalla y exportables
coinciden. No hubo errores de consola durante la revisión.

Los catálogos embebidos, 29 pregrados/144 posgrados, matrículas y los seis archivos
`03-finance-core.js`/`07-financing-engine.js` permanecen idénticos, comprobados por
hash. No se cambian API, autenticación ni almacenamiento. La configuración de
Render tiene despliegue automático desactivado: es necesario desplegar el nuevo
commit para que los cambios aparezcan en línea.

## Excepción de marca para Banco Aliado

El resumen, el plan de pagos y la comparación de escenarios bancarios usan
acentos grises, encabezado neutro y pie «Banco Aliado», sin logo ni nombre
Uninorte. La autoría del archivo es «Simulador de crédito»; la nota de validación
remite a la entidad financiera. La descarga bancaria no carga la identidad
institucional y omite el logo incluso si se proporciona al constructor.
Se conserva Aptos Narrow y el mismo snapshot de importes y cuotas.
Se actualizan las expectativas existentes sin ejecutar pruebas, por indicación
del usuario.
