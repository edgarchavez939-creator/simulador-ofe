# Configuración de textos del simulador y PDF — v22

Revisión: 27 de octubre de 2026. Base: `c6319a6`. Se conserva un proyecto y servicio con área pública e interna.

## Dónde está y qué permite

Ingresar con un administrador del sistema y abrir **Configuración → Textos**. El acceso directo es `/apps/ofe/?admin=settings&section=texts`.

Hay 42 campos definidos: títulos y descripciones de ocho módulos, secciones y ayudas seleccionadas de los formularios, encabezado institucional, título del aviso legal, títulos de las once modalidades del PDF y dos avisos legales independientes: institucional y Banco Aliado.

La edición es texto plano, sin HTML. Cada campo muestra su límite, contador y restauración individual al original. El formulario permite descartar cambios, recargar, revisar y guardar y generar un PDF de muestra por modalidad con datos ficticios. La muestra no guarda la configuración.

No convierte en editables importes, nombres del catálogo, fórmulas, porcentajes, identificadores ni etiquetas financieras estructurales. No es un editor libre de todo el contenido de la aplicación. Los textos actuales son los valores iniciales; no se sustituye de oficio el aviso enviado a Jurídica.

## Protección del diseño del PDF

| Campo | Máximo de caracteres | Espacio | Tamaño permitido |
| --- | ---: | --- | --- |
| Encabezado institucional | 70 | Una línea, 491,28 puntos | 15 a 11 pt |
| Modalidad | 90 | Una línea, 360 puntos; reserva para escenario/continuación | 10 a 8,5 pt |
| Título del aviso | 70 | Una línea, 491,28 puntos | 8 a 7,5 pt |
| Aviso legal | 800 | Hasta tres líneas, 491,28 puntos | 8,1 a 7,2 pt |

El límite de caracteres es un máximo de entrada, no una promesa de que cualquier combinación de esa longitud quepa. La validación utiliza las métricas reales de Public Sans, tanto en el editor como en el servidor. Letras anchas pueden requerir un texto más corto.

El ajuste reduce el tamaño dentro del rango autorizado, sin mover las coordenadas, márgenes, tablas, logotipos, enlaces ni firma. No añade páginas para acomodar estos campos. La frase **«Este documento no constituye aprobación del crédito.»** permanece fija y se cuenta al medir el aviso.

Un texto que excede el espacio, contiene caracteres no representables en la fuente, HTML o controles inválidos no se guarda. Si un pegado excede la longitud máxima, se informa y no se inserta ni recorta. El aviso legal se imprime completo; no se omiten palabras ni se usan puntos suspensivos para hacerlo caber.

Como defensa adicional, el renderizador comprueba cada campo antes de dibujarlo: ante datos fuera de límites, utiliza el texto original válido para ese espacio. Esto también protege exportaciones de instantáneas antiguas o alteradas fuera del formulario. El límite corresponde a los campos configurables; los datos financieros y planes mantienen sus reglas y paginación anteriores.

Banco Aliado conserva presentación neutra. Su título y aviso son independientes; no hereda el encabezado institucional ni el aviso de Uninorte. Se rechaza la marca institucional en sus dos campos editables.

## Aplicación y versiones

Los cambios de interfaz aparecen al guardar en la sesión administrativa y al cargar o volver a calcular en las demás pantallas conectadas. Una simulación guarda una copia de su versión de textos. PDF y aviso de Excel de ese resultado conservan esa versión, aunque un administrador la cambie después. Una nueva simulación adopta la nueva configuración. Idiomas hereda la versión de textos del resultado que le dio origen.

Los archivos ya descargados no cambian. El historial sigue siendo local al navegador. La configuración global se guarda en el servidor, no en el historial ni en los archivos del catálogo.

GitHub Pages sin API usa los textos originales incluidos en el código. Para que la edición administrativa se refleje globalmente se necesita la aplicación conectada al servicio de datos, como Render o el servidor institucional. GitHub Pages no sincroniza automáticamente la configuración de otra base de datos.

## Despliegue y permisos

La migración automática **007-text-settings.sql** crea una tabla independiente, sin reconstruir ni sustituir las configuraciones anteriores. No hay nuevas variables de entorno, paquetes ni servicios. Al actualizar una instalación existente, respaldar la base como indica la guía institucional y reiniciar el servicio; se agregan los textos originales si aún no existen.

- `GET /api/admin/text-settings`: requiere `settings.read`; devuelve valores, versión y metadatos administrativos.
- `PUT /api/admin/text-settings`: requiere `settings.update`, sesión vigente, origen y CSRF. Recibe `{version, changes}` y valida longitud, tipografía y espacio antes de guardar.
- `GET /api/text-settings`: requiere `simulator.use`; devuelve valores y versión.
- `GET /api/public/text-settings`: consulta anónima, solo si el acceso público está activo y sin mantenimiento. Devuelve únicamente valores y versión.

Los cambios usan control de versión optimista (409 ante conflictos). Cada campo modificado registra `CONFIG_UPDATE` con entidad `texts`, actor, valor anterior y nuevo. La auditoría y el guardado son atómicos: un fallo revierte ambos. Restaurar originales también requiere revisar y guardar para persistirlo.

Los avisos jurídicos deben coordinarse con la Oficina Jurídica. El sistema no registra ni supone su aprobación por permitir editar un texto.

## Validación

167 pruebas aprobadas: controles previos más diez pruebas de textos, con permisos, CSRF, conflictos, transacciones, migración, persistencia, ancho real, caracteres no representables, instantáneas y geometría de los PDF de todas las modalidades.

Se revisó la sección en navegador con una cuenta ficticia, el rechazo de un aviso de 500 letras anchas, el guardado y su efecto en la pantalla pública. Se generaron y renderizaron documentos con texto al límite de 7,2 pt y presentación neutra de Banco Aliado. Se comprobó que títulos y avisos configurados no cambian posiciones, figuras, tablas, páginas ni cifras financieras.

No se modifican las seis copias de `03-finance-core.js` y `07-financing-engine.js`, ni los bloques de 29 pregrados y 144 posgrados o sus matrículas.
