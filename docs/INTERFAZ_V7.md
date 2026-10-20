# Modales, subtítulos y acceso v7

> Informe histórico de una fase anterior. Sus versiones, pendientes y resultados describen ese momento. Para el estado de entrega consultar el [README](../README.md), [Información para DTIC](DTIC_INTEGRATION.md) y [Dependencias](DEPENDENCIES.md).

Cambios sobre `78d5af0` en `feat/dtic-readiness`.

## Modales con agrupaciones visibles

Las capturas mostraban metadatos sueltos y espacios amplios entre etiquetas, valores y secciones. La estructura existente se conserva y se apoya en superficies delimitadas: fondo suave para el cuerpo, paneles con borde para grupos, cabecera separada y acciones en un pie definido.

- Auditoría: seis fichas de datos, comparación Anterior/Nuevo, resultado y referencia técnica contenidos. Menor distancia entre etiqueta y valor; valores largos permiten salto de línea.
- Programa: identificación compacta, panel de Matrícula con valor actual contenido junto al nuevo valor, panel de Datos del programa y estado activo agrupado. Botones sin los márgenes heredados que alteraban la alineación.
- El estilo de cabecera/cuerpo se comparte con los demás diálogos administrativos. Los grupos de parámetros y la revisión conservan sus acciones y campos.
- Ancho máximo 680 px; en móvil, márgenes de 12 px y desplazamiento interior. Se conserva el cierre, el foco inicial y la devolución del foco.

## Subtítulos del simulador

La referencia real `1 · Situación actual` / `2 · Nueva propuesta` usa 11 px, peso 700 y espaciado de 0,5 px. Se incorpora `--type-form-section` y se aplica esa misma escala a `.form-section-label` y `.group__title`: Información académica, Beneficios / Descuentos, Pago de contado / Cuota inicial, Condiciones del crédito, Financiación, segmentos CP/LP, Capacidad de pago e Idiomas. Se mantiene la escala de los títulos principales y los importes.

La regla común cubre las tres entradas del simulador sin duplicar CSS ni modificar los motores financieros.

## Login

Nueva composición con introducción sobria y tarjeta de acceso independiente. Identidad OFE/Universidad del Norte, título compacto, tres capacidades del simulador, formulario delimitado y pie institucional. Public Sans local, iconos existentes y colores semánticos compatibles con claro/oscuro.

En móvil se acorta la introducción y se oculta la lista complementaria, manteniendo visibles el formulario, su contexto y el mensaje de acceso reservado. El formulario conserva los mismos identificadores, campos, autocompletado, botón de contraseña, errores y flujo de activación. No se cambia el contrato de autenticación ni los permisos.

## Archivos

| Archivo | Cambio |
| --- | --- |
| `shared/ui/density.css` | Escala de subtítulos, superficies y separación de los diálogos administrativos. |
| `shared/auth/login.html` | Nueva composición de acceso con los controles originales. |
| `server/app.cjs` | Ruta anónima al CSS del login. |
| `shared/auth/access.css` (nuevo) | Diseño del login y adaptación a móvil/tablet; aislado de los estilos históricos. |
| `docs/INTERFAZ_V7.md` (nuevo) | Alcance y verificación de esta fase. |

Archivos eliminados: ninguno.

## Verificación

- 100 pruebas existentes aprobadas, incluidas autenticación, activación, sesiones, permisos, catálogo y exportaciones.
- Navegador con servidor local real y base temporal de usuarios ficticios: escritorio 1440 px, tablet 1024 px y móvil 390 px; modo claro y oscuro.
- Comparación de estilos computados: todos los subtítulos indicados coinciden con los dos de Reestructuración (11 px, 700, 0,5 px).
- Login: contraseña incorrecta muestra error y recibe foco; credenciales válidas abren el simulador; salida vuelve al nuevo acceso. Recursos locales cargados sin errores de consola.
- Modales de Programa y Auditoría: revisión en claro/oscuro y móvil; contenidos dentro del ancho disponible y desplazamiento interior. Escape cierra Auditoría y devuelve el foco al botón que lo abrió.
- Capturas locales guardadas en los artefactos `ui-v7` de esta tarea. No se aplicaron cambios a programas o usuarios reales.
- Catálogo, matrículas, IDs, motor financiero, cálculo, autenticación y exportadores sin modificaciones funcionales. Despliegue remoto no verificado por esta revisión local.
