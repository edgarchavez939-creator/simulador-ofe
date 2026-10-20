# Acceso público e integración con Uninorte — v10

## Configuración dentro de la aplicación — v11

El administrador dispone ahora de Acceso público e integración en Configuración: enlace, código copiable, comprobación anónima y vista previa en escritorio/móvil. También puede calibrar la paleta de marca conservando los fondos de cada modo. Ver [uso y validación](CONFIGURACION_PUBLICA_COLORES_V11.md).

## Qué queda implementado

El mismo servicio dispone de dos entradas independientes:

- Pública: `/simulador/` conduce a `/apps/public/`. Permite calcular sin crear cuenta ni iniciar sesión.
- Interna: `/apps/ofe/` y `/login`. Administración, usuarios y auditoría conservan sesión y permisos.

El acceso público está desactivado por defecto. Se activa expresamente con `OFE_PUBLIC_ENABLED=1`. La activación no cambia permisos internos ni publica datos de usuarios o auditoría.

La pantalla pública consulta el catálogo y los parámetros del servidor, sin depender de una copia manual de los programas. Al abrir o recargar se obtienen los programas activos, matrícula e Idiomas vigentes. Las nuevas simulaciones y el reinicio consultan los parámetros; los resultados existentes conservan los valores con que se calcularon. Los cálculos y exportaciones se ejecutan en el navegador usando los motores actuales.

## Activación en el servidor institucional

Seguir la [guía de despliegue](DESPLIEGUE_INSTITUCIONAL.md) y las [plantillas](../deploy/README.md). DTIC debe definir el dominio real y configurar `APP_ORIGIN`, `OFE_PUBLIC_ENABLED=1` y `OFE_PUBLIC_FRAME_ORIGINS` en el entorno del proceso, cargándolo expresamente. Al cambiar variables, reiniciar el servicio.

Los orígenes del iframe se separan con espacios, sin rutas ni comodines; por ejemplo `https://www.uninorte.edu.co`. Para desactivar el acceso anónimo usar `OFE_PUBLIC_ENABLED=0`. Para permitir solo iframe del propio origen, dejar vacía `OFE_PUBLIC_FRAME_ORIGINS`.

En una ventana privada, `<APP_ORIGIN>/apps/public/` debe abrir sin login y `<APP_ORIGIN>/apps/ofe/` debe exigir acceso. `<APP_ORIGIN>` representa el dominio real, no texto que deba pegarse literalmente.

## Enlace e iframe institucionales

Página de destino aportada: `https://www.uninorte.edu.co/web/apoyo-financiero/credito-uninorte`.

Desde Configuración → Acceso público e integración se obtiene el enlace y código del servidor desplegado. La [plantilla HTML](../examples/uninorte-embed.html) usa `https://simulador.ejemplo.invalid` para evitar publicar por error el servicio anterior de Render. Sustituir ese origen por `APP_ORIGIN` antes de copiar al portal.

El responsable de la web debe usar un componente que admita iframe. Si el portal limita `frame-src`, debe autorizar el origen institucional del simulador. La autorización `frame-ancestors` del simulador se aplica al origen completo del portal, no a una sola ruta. Ambas configuraciones requieren validación en destino.

La página pública no necesita cookies ni cuenta; login y área interna conservan `frame-ancestors 'none'` y `X-Frame-Options: DENY`. No insertar el acceso interno por iframe.

## Ambiente anterior de referencia

Render se utilizó para pruebas de login y actualización en línea. Sus instrucciones se conservan en [Render Free](RENDER_FREE_DEMO.md). No se requiere ese proveedor para el servidor institucional ni deben trasladarse sus variables de demostración o credenciales. El historial de un despliegue anterior no certifica la instalación institucional.

## Módulos visibles para el público

El administrador puede activar u ocultar módulos completos desde Configuración → Acceso público e integración. Los cambios se aplican al abrir o recargar la pantalla pública, con auditoría y sin alterar las opciones internas. Ver [módulos públicos v18](MODULOS_PUBLICOS_Y_PLANES_V18.md). La versión estática no consulta esa configuración.

## Contrato de API pública

Misma dirección que la pantalla, sin CORS ni configuración de origen adicional en el navegador:

| Ruta | Respuesta | Métodos |
| --- | --- | --- |
| `/api/public/modules` | `{values:{...}}`; estados booleanos de los siete módulos, sin autor ni versión de edición | GET, HEAD |
| `/api/public/programs` | `{programs:[...]}`; solo activos | GET, HEAD |
| `/api/public/programs/{id}` | Un programa activo; 404 si no existe o está inactivo | GET, HEAD |
| `/api/public/simulation-settings` | `{values:{default_interest_rate,default_installments,garantisa_cp_percent,garantisa_lp_percent}}` | GET, HEAD |

Cada programa contiene exclusivamente `id`, `codigo` si existe, `nombre`, `nivel`, `subnivel`, `valorMatricula`, `valorIdiomas`, `semestres` y `activo`. No se inventan códigos institucionales. No se publican usuarios, autor de actualización, auditoría, sesiones, versiones de edición ni índices internos del catálogo. La API no permite escribir ni modificar programas. Las respuestas usan `Cache-Control: no-store`.

La pantalla utiliza un adaptador de catálogo de solo lectura. Ante un error al consultar, muestra el fallo y bloquea el inicio: no sustituye silenciosamente la API por valores embebidos antiguos. Los importes y parámetros de resultados ya calculados no cambian al actualizar la configuración.

## Traspaso a DTIC

1. Desplegar el mismo código con Node 24, almacenamiento persistente y HTTPS, utilizando el arranque normal; no trasladar credenciales ni base descartable de pruebas.
2. Establecer `APP_ORIGIN` con la dirección institucional del servicio y activar las dos variables públicas. Cambiar los orígenes de iframe si la página institucional utiliza otros dominios.
3. Sustituir el dominio de Render por el institucional en el enlace/iframe. La pantalla y su API pueden permanecer bajo el mismo origen, sin cambiar el motor financiero ni el contrato de lectura.
4. Incorporar Entra ID a la aplicación interna cuando DTIC disponga de su configuración. El acceso anónimo público funciona por separado y no necesita SSO.
5. Validar acceso anónimo y PDF/Excel, consulta de programas y parámetros, exclusión de inactivos, edición administrativa auditada, acceso interno protegido y página institucional en escritorio/móvil.

La instalación en DTIC y la edición de la página de Uninorte requieren aplicar y validar estas configuraciones en sus servidores. Las pruebas locales no certifican la publicación institucional.

Fuentes oficiales consultadas el 16-10-2026: [despliegues de Render](https://render.com/docs/deploys), [limitaciones de Render Free](https://render.com/docs/free) y [MDN — frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
