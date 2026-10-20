# Reestructuración: tratamiento del saldo, comparación y capacidad — v21

Fecha: 20 de octubre de 2026. Implementación sobre `59ca624`, rama `feat/dtic-readiness`.

## Uso del módulo interno

1. Registrar capital pendiente, intereses corrientes causados no pagados y mora, con una misma fecha de corte. No incluir otra vez pagos anteriores. Los costos nuevos se registran por separado.
2. En **Tratamiento del saldo y los costos**, indicar el pago inicial al formalizar y la condonación simulada de cada concepto. Lo que no se paga ni se condona se financia. Los importes vacíos equivalen a cero; la suma de pago y condonación no puede superar el importe de ese concepto.
3. Si hay condonación, registrar su supuesto o referencia en el campo correspondiente. Es una hipótesis de simulación, sujeta a autorización; el módulo no aprueba condonaciones ni modifica una obligación real.
4. Mantener el plazo manual o seleccionar **Calcular según la capacidad mensual** e ingresar una capacidad mayor que cero. Se busca el menor número entero de meses cuya cuota no supera esa capacidad, utilizando la función de cuota existente. El límite técnico es 600 meses; no es una política institucional de autorización.
5. Opcionalmente activar **Comparar con el crédito vigente**. Completar cuota vigente, tasa mensual vencida, cuotas mensuales pendientes y total pendiente según el plan vigente, todos a la misma fecha de corte.

El total del plan vigente debe proceder de cartera o de su plan de pagos e incluir capital, intereses causados y futuros y cargos aún pendientes. Excluye lo ya pagado. No se deduce multiplicando la cuota por el plazo ni se vuelve a sumar el saldo de arriba. Si no se dispone de esos datos, dejar desactivada la comparación: la propuesta se puede calcular, pero no se anuncia ahorro frente al plan anterior.

## Criterios de cálculo

- **Saldo actual** = capital + intereses corrientes causados + mora.
- **Importe de referencia** = saldo actual + costos nuevos.
- **Monto a financiar** = importe de referencia − pagos iniciales − condonaciones simuladas.
- **Total de la propuesta** = pago inicial + suma de las nuevas cuotas, incluidos sus intereses.
- **Reducción mensual** = cuota vigente informada − nueva cuota. Un resultado negativo es aumento mensual.
- **Variación del total pendiente** = total de la propuesta − total vigente informado. Un resultado positivo es aumento, aunque la cuota baje.

No se suman por segunda vez costos pagados, conceptos condonados ni intereses incluidos en el total vigente. La comparación es nominal, desde la fecha de corte declarada; no calcula valor presente, flujos con vencimientos reales, aprobación crediticia ni tasa efectiva de una operación con cargos.

La tasa cero es válida. Si todo se paga o condona, el monto financiado es cero: no se generan intereses nuevos ni amortización. Si la capacidad no supera los intereses del primer mes, ampliar el plazo no resuelve el caso. Si no hay solución hasta 600 meses, se informa y no se publica un resultado exportable.

## Formato, historial y documentos

Todos los campos monetarios del módulo agrupan miles con puntos mientras se escribe y permiten hasta dos decimales con coma. Ejemplo: `1000000,50` se presenta como `1.000.000,50`. Se aceptan importes completos pegados en formato colombiano o internacional reconocible. Negativos y textos ambiguos se rechazan al validar; no se convierten silenciosamente en positivos.

Los valores numéricos conservan sus decimales en el cálculo y los registros guardados. La presentación general de resultados y PDF mantiene el formato de pesos enteros ya usado en el simulador; Excel guarda los valores numéricos completos. La distribución por concepto se realiza en centavos.

Modificar una entrada invalida el resultado hasta recalcular. Guardar escenarios crea copias independientes. Duplicar desde el historial recupera los importes, fecha, distribución, referencia, modalidad de plazo y datos de comparación; no reutiliza un resultado anterior. Reiniciar limpia los nuevos campos.

PDF y Excel consumen la simulación calculada. Las propuestas ampliadas incorporan tratamiento del saldo, comparación y capacidad; el PDF incluye el plan completo como anexo y Excel una hoja de tratamiento con cuatro conceptos y totales. Los escenarios manuales sin distribución ni comparación conservan el exportable compacto anterior.

## Alcance para DTIC

Se conserva un solo servicio y la autenticación vigente. El módulo continúa limitado al área interna. No hay tablas ni variables de entorno nuevas; no requiere migración adicional a la versión 006 existente. El historial sigue siendo local al navegador y no constituye un expediente institucional centralizado.

No se modifican `03-finance-core.js` ni `07-financing-engine.js` en ninguna de sus tres ubicaciones, ni los 29 pregrados, 144 posgrados o sus matrículas. La lógica adicional está en `shared/finance/restructuring.js`; el formato, en `shared/ui/refi-money.js`.

## Verificación

157 pruebas aprobadas, cero fallidas: batería previa más diez casos nuevos de distribución con centavos, límites, plazo mínimo, tasa cero, incapacidad, comparación con mayor costo pese a menor cuota, liquidación completa, historial, formato y exportación real.

Revisión local en navegador con usuario ficticio: escritura progresiva, comparación, plazo automático, duplicación y descargas. PDF descargado renderizado para revisar encabezados, tabla, separación de secciones, amortización y límites de página. Se mantienen las verificaciones de catálogo, permisos, dependencias y presentación neutra de Banco Aliado. Estas pruebas no certifican un despliegue institucional ni aprobación financiera o jurídica.
