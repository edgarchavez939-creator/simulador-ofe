# Simulador de Crédito Educativo OFE — P3.8

Arquitectura modular sin framework ni build system.

## Estructura

- `index.html`: estructura, vistas y bloques actualizables `PROGRAMAS` / `POSGRADOS`.
- `simulador-assets/styles.css`: Design System y composiciones visuales.
- `simulador-assets/js/00-runtime.js`: runtime compartido, configuración, estado, registro de módulos y ciclo de vida.
- `simulador-assets/js/01-core-ui.js`: navegación, tema, programas y control local de acceso.
- `simulador-assets/js/02-reestructuracion.js`: Reestructuración de Crédito.
- `simulador-assets/js/03-finance-core.js`: motor financiero común.
- `simulador-assets/js/04-exports-pdf-excel.js`: PDF/Excel de simulaciones.
- `simulador-assets/js/05-idiomas-herramientas.js`: Idiomas, Conversor de Tasas y herramientas financieras.
- `simulador-assets/js/06-actions-history.js`: delegación de eventos, historial y escenarios.
- `simulador-assets/js/07-financing-engine.js`: beneficios, distribución y sincronización de financiación.
- `simulador-assets/js/08-updater.js`: importación Excel y actualización de programas.
- `simulador-assets/js/09-bootstrap.js`: único punto de arranque.

## Ciclo de vida

Los módulos se registran mediante `SimuladorOFE.register(nombre, { init() })`. Ningún módulo funcional debe depender de ejecutar inicialización al momento de descargarse. `09-bootstrap.js` llama una sola vez a `SimuladorOFE.init()` cuando el DOM está disponible.

Las APIs de dominio que necesitan ser visibles para diagnóstico o integración se publican en `SimuladorOFE.services`. La configuración institucional compartida está en `SimuladorOFE.config`.

## Estado por dominio

El estado mutable de la aplicación vive únicamente bajo `SimuladorOFE.state`; no se usan propiedades privadas `window._*` ni declaraciones `let`/`var` mutables en el scope superior.

- `state.access`: desbloqueo local y flujo del PIN.
- `state.ui`: nivel académico por pestaña y unidades de plazo.
- `state.results`: resultados CP, mixto, banco, cálculo de cuota inicial, idiomas y proyecciones.
- `state.restructuring`: resultado actual y escenarios de Reestructuración de Crédito.
- `state.languages`: contexto, beneficios y configuración del Conversor de Tasas.
- `state.financing`: beneficios por simulación y bloqueo de redistribución.
- `state.comparison`: escenarios comparativos de simulaciones.
- `state.history`: configuración de persistencia del historial.
- `state.updater`: HTML fuente, workbook, hoja activa, mapeos y programas vigentes.

Los módulos pueden conservar referencias locales a su dominio, pero esas referencias no son fuentes de verdad independientes.

## Regla del actualizador

Los marcadores `PROGRAMAS_START/END` y `POSGRADOS_START/END` deben permanecer dentro de `index.html`. El actualizador reemplaza únicamente esos bloques.

## Despliegue

Publicar el contenido del paquete conservando rutas relativas. No publicar `index.html` aislado: necesita `simulador-assets/`.


## P3.1 — Accesibilidad e interacción

- Modales fuera del árbol accesible cuando están cerrados (`hidden` + `aria-hidden`).
- Trampa de foco y retorno al control de origen al cerrar un modal.
- `Escape` cierra la capa superior y `Enter` no interfiere con botones del PIN.
- Modales con `aria-labelledby` y `aria-describedby`.
- Todos los `input`, `select`, `textarea` y botones estáticos tienen nombre accesible.
- Los accesos a Financiación de Idiomas son botones nativos.
- En móvil, el sidebar cerrado usa `inert`/`aria-hidden` para evitar foco fuera de pantalla.
- Enlace de salto directo al contenido principal.
- Ajustes responsive para modales y entradas PIN en pantallas pequeñas.
- Se conserva `prefers-reduced-motion`.


## P3.2 — Pulido visual y feedback

- Feedback del actualizador normalizado con `.feedback` y variantes semánticas.
- Mensajes dinámicos anuncian cambios mediante `aria-live="polite"`.
- Se eliminaron estilos inline repetidos y se sustituyeron por utilidades y componentes del Design System.
- Resúmenes del actualizador usan `summary-tile` y grids responsive reutilizables.
- Se validó que no existan atributos `class` duplicados tras la migración.
- La lógica financiera y los contratos de servicios permanecen sin cambios.


## P3.3 — Convergencia final al Design System

- Los estilos inline bajaron de 142 a 27.
- Los 27 estilos inline restantes dependen de valores calculados en runtime (porcentajes, colores de escenarios o filas dinámicas); no quedan estilos inline estáticos.
- Se consolidaron utilidades de espaciado, tipografía, grids, callouts, paneles, banners, estados vacíos y micro-notas.
- Se eliminaron dos atributos `class` duplicados detectados en templates dinámicos del motor financiero.
- Las composiciones estáticas ya consumen clases/tokens del Design System en lugar de declaraciones `style` locales.

## P3.4 — Responsive hardening

- Breakpoints revisados para escritorio, tablet, móvil y móvil estrecho: 1024, 768, 640, 430 y 360 px.
- Grids dobles, pares sincronizados, mapeadores y filas de tasa colapsan a una columna cuando el ancho lo requiere.
- Banners de totales se apilan en móvil y ocultan operadores decorativos que consumen ancho.
- Tablas mantienen desplazamiento horizontal controlado y muestran una indicación de deslizamiento en móviles.
- Botoneras, herramientas de vista, pies de modal y resultados se convierten a distribución vertical en pantallas estrechas.
- Cards, KPIs, modales y navegación reducen padding/tipografía progresivamente sin modificar el contenido.
- Sidebar móvil, modales y controles PIN conservan las mejoras de accesibilidad introducidas en P3.1.

La lógica financiera y los contratos de servicios permanecen sin cambios en P3.3/P3.4.


## P3.5 + P3.6 — Estados UX y accesibilidad final

- Lectura de HTML/Excel anuncia estado de procesamiento, error y finalización mediante `aria-live` y `aria-busy`.
- Acciones de generación/exportación utilizan estado ocupado accesible sin duplicar ejecuciones.
- Exportaciones PDF/Excel muestran confirmación de descarga.
- Resultados principales (`CP`, mixto, banco, reestructuración, cuota inicial e idiomas) son regiones vivas `polite`.
- Tooltips de ayuda son alcanzables por teclado y anuncian su contenido mediante nombre accesible.
- Tablas generadas y estáticas reciben `scope=col` y sus contenedores desplazables son regiones enfocables con nombre accesible.
- El título de vista es el `h1` principal dinámico de la aplicación.
- Alertas temporales usan `hidden` en lugar de estilos de visibilidad directos.
- En tema claro se reforzaron los tonos semánticos `success`, `warning` y `danger` para cumplir contraste AA como texto normal sobre fondos suaves.
- Los estados de feedback incluyen símbolo además de color, y `prefers-reduced-motion` desactiva animaciones de carga.

La lógica financiera y los contratos de P2 permanecen sin cambios.


## P3.7 + P3.8 — Limpieza técnica y QA funcional

- Se eliminaron funciones obsoletas, duplicadas y shims heredados de etapas anteriores.
- Se corrigieron dos fallos de foco al agregar beneficios: simulaciones generales e Idiomas ahora enfocan el nuevo campo de nombre correctamente.
- Se retiró una implementación antigua de aportes que todavía dependía de IDs eliminados (`pct1` / `cont1`) y podía quedar enmascarada por el orden de carga.
- Se limpiaron estilos específicos sin uso de funcionalidades retiradas (publicación GitHub antigua, gauge, subcomponentes antiguos de Idiomas y variantes visuales reemplazadas).
- Se normalizó terminología visible restante de Refinanciación a Reestructuración de Crédito.
- La auditoría estática queda sin funciones declaradas huérfanas ni declaraciones de función duplicadas entre módulos.
- Matriz funcional automatizada con DOM simulado: 15/15 rutas superadas, incluyendo CP, Mixto, Banco, Cálculo de Cuota Inicial, Idiomas, Conversor, Reestructuración, escenarios/historial, PDF/Excel y reemplazo del Actualizador.
- Las 10 pruebas internas del motor financiero continúan en estado OK.

Nota de alcance: Chromium headless del entorno no produjo una sesión utilizable, por lo que la validación visual/navegador real continúa reservada para P3.9. El QA de P3.8 valida lógica y flujos con un DOM simulado y mocks de dependencias de descarga; no sustituye la prueba final en navegador.
