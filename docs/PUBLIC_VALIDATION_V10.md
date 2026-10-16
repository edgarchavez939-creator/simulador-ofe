# Validación de acceso público — v10

## Resultado

Implementación preparada para activar enlace público e iframe en el servicio existente de Render. El acceso anónimo está desactivado por defecto y se habilita expresamente con una variable de entorno. La aplicación interna conserva sus permisos.

Se incorpora un adaptador público de catálogo de solo lectura, datos activos filtrados por campos autorizados, parámetros sin metadatos administrativos y configuración del iframe por orígenes HTTPS exactos. Se conserva el uso estático previo de la vista pública cuando no se ejecuta con el servicio.

## Verificaciones

- 113 pruebas aprobadas, 0 fallidas: incluye inicio público, desactivación, todos los recursos del documento, métodos de consulta, exclusión de inactivos, actualización de matrícula e Idiomas desde administración, parámetros vigentes, ausencia de datos administrativos y rechazo de escritura anónima/pública.
- La API administrativa y los recursos internos mantienen autenticación; login y documentos internos conservan el bloqueo de iframe.
- Cálculo público real en navegador sin cuenta; selección de programa, aporte y tabla de amortización.
- Cálculo dentro del iframe de la plantilla de ejemplo y revisión móvil a 390 px. Sin errores de consola en el recorrido.
- Indisponibilidad del catálogo bloquea el inicio; indisponibilidad de parámetros no altera resultados existentes ni aplica valores embebidos silenciosamente.
- Los catálogos embebidos, sus 173 identidades y los seis archivos financieros protegidos conservan los hashes originales.

## Entrega y estado externo

[Activación, enlace y código de iframe](PUBLIC_INTEGRATION_PLAN.md). [Plantilla completa de integración](../examples/uninorte-embed.html).

Se comprobó en navegador que `https://simulador-ofe-pruebas.onrender.com/simulador/` aún redirige al login en la versión remota anterior a esta entrega. Para habilitarlo, el propietario debe agregar las variables públicas y desplegar el código nuevo. No se cambió la configuración del servicio de Render ni la página de Uninorte durante esta revisión.

La prueba del iframe se realizó localmente con la plantilla de entrega. La incrustación efectiva en Uninorte requiere que el responsable del portal añada el bloque HTML y, si corresponde, autorice el servicio en su política de seguridad.
