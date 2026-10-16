# Acceso público e integración con Uninorte — v10

## Qué queda implementado

El mismo servicio dispone de dos entradas independientes:

- Pública: `/simulador/` conduce a `/apps/public/`. Permite calcular sin crear cuenta ni iniciar sesión.
- Interna: `/apps/ofe/` y `/login`. Administración, usuarios y auditoría conservan sesión y permisos.

El acceso público está desactivado por defecto. Se activa expresamente con `OFE_PUBLIC_ENABLED=1`. La activación no cambia permisos internos ni publica datos de usuarios o auditoría.

La pantalla pública consulta el catálogo y los parámetros del servidor, sin depender de una copia manual de los programas. Al abrir o recargar se obtienen los programas activos, matrícula e Idiomas vigentes. Las nuevas simulaciones y el reinicio consultan los parámetros; los resultados existentes conservan los valores con que se calcularon. Los cálculos y exportaciones se ejecutan en el navegador usando los motores actuales.

## Activar en el Render de pruebas existente

Servicio indicado por el propietario: `https://simulador-ofe-pruebas.onrender.com`.

1. En Render, abrir el servicio existente y comprobar que su rama sea `feat/dtic-readiness`.
2. En Environment, agregar estas variables sin modificar las credenciales existentes:

   | Variable | Valor |
   | --- | --- |
   | `OFE_PUBLIC_ENABLED` | `1` |
   | `OFE_PUBLIC_FRAME_ORIGINS` | `https://www.uninorte.edu.co https://uninorte.edu.co` |

   La segunda variable contiene orígenes, separados por un espacio: no escribir la ruta completa de la página. Solo admite HTTPS y orígenes exactos, sin comodines.
3. Guardar los cambios y usar **Manual Deploy → Deploy latest commit**. Si guardar las variables inicia un despliegue, comprobar que despliega la revisión más reciente y esperar a que termine. No basta con Restart service, porque puede reiniciar el código anterior.
4. Esperar estado Live. Abrir una ventana privada con `https://simulador-ofe-pruebas.onrender.com/simulador/`: debe mostrar el simulador sin login y sin opciones administrativas.
5. Comprobar que `https://simulador-ofe-pruebas.onrender.com/apps/ofe/` sigue pidiendo acceso en esa ventana privada.

No se requiere otro alojamiento, una cuenta de pago ni una base adicional para habilitar esta prueba. Render Free suspende servicios inactivos y utiliza almacenamiento efímero; los cambios de la demo pueden perderse con un reinicio o despliegue. El enlace de prueba no sustituye el alojamiento institucional persistente. Ver [demostración gratuita](RENDER_FREE_DEMO.md).

Para desactivar el acceso anónimo, cambiar `OFE_PUBLIC_ENABLED` a `0` y volver a desplegar. Para permitir únicamente el enlace y bloquear iframe desde otros sitios, dejar vacía `OFE_PUBLIC_FRAME_ORIGINS`.

## Enlace listo para la página institucional

Página de destino aportada: `https://www.uninorte.edu.co/web/apoyo-financiero/credito-uninorte`.

```html
<a href="https://simulador-ofe-pruebas.onrender.com/simulador/"
   target="_blank" rel="noopener">
  Simula tu crédito Uninorte
</a>
```

## Iframe listo para incorporar a esa página

```html
<iframe
  src="https://simulador-ofe-pruebas.onrender.com/apps/public/"
  title="Simulador de crédito de la Universidad del Norte"
  width="100%"
  height="1100"
  style="display:block;border:0;max-width:100%;"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin">
</iframe>
```

El responsable de la web debe pegar este bloque en un componente que admita HTML/iframe y publicar la página. Si la política de seguridad del portal limita `frame-src`, debe autorizar el origen `https://simulador-ofe-pruebas.onrender.com`. No podemos aplicar esos cambios desde el repositorio del simulador.

La política del simulador permite incrustación de su documento público desde los dos orígenes institucionales configurados y desde su propio origen. Login y área interna conservan `frame-ancestors 'none'` y `X-Frame-Options: DENY`. Las rutas públicas no necesitan cookies ni cuenta, por lo que el cálculo no depende de que el navegador acepte cookies de terceros.

La [página de ejemplo completa](../examples/uninorte-embed.html) contiene el enlace y el iframe con la dirección actual de pruebas. La autorización del servidor se aplica por origen completo, no por la ruta de una página concreta.

## Contrato de API pública

Misma dirección que la pantalla, sin CORS ni configuración de origen adicional en el navegador:

| Ruta | Respuesta | Métodos |
| --- | --- | --- |
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

La publicación real en Render y la edición de la página de Uninorte requieren aplicar los pasos anteriores en sus respectivos paneles. La verificación local no demuestra que esos despliegues externos se hayan realizado.

Fuentes oficiales consultadas el 16-10-2026: [despliegues de Render](https://render.com/docs/deploys), [limitaciones de Render Free](https://render.com/docs/free) y [MDN — frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
