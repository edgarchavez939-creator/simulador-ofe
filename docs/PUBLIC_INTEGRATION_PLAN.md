# Pantalla pública e integración con Uninorte

## Estado actual — revisión v9, octubre de 2026

Existe el código de la vista pública en `apps/public/`, con catálogo embebido. El servidor autónomo actual redirige `/apps/public/` a la aplicación interna y exige sesión para leer `/api/programs` y `/api/simulation-settings`. Por tanto, todavía no hay un servicio público conectado al catálogo administrado.

La aplicación interna, los usuarios y la auditoría mantienen su autenticación. Esta revisión no publica nuevos servicios ni cambia permisos o restricciones de incrustación.

## Cómo aparecerá en uninorte.edu.co

La integración visual puede realizarse mediante un enlace a una dirección pública del simulador, una ruta alojada por DTIC dentro del sitio institucional o un iframe que muestre esa dirección dentro de una página de Uninorte. La API se utiliza para obtener los datos vigentes; no es el mecanismo que coloca la pantalla dentro de la página.

Se propone para el traspaso a DTIC una dirección pública con el simulador y una API de consulta bajo el mismo origen, usando un proxy institucional si los servicios se alojan por separado. Esto permite empezar con un enlace desde la web y, si el gestor de contenidos lo permite, incorporar después el simulador a la página.

## Separación propuesta

| Parte | Acceso | Función |
| --- | --- | --- |
| Simulador público | Sin cuenta | Elegir programa, introducir valores y calcular en el navegador |
| API pública de lectura, por implementar | Sin cuenta | Entregar programas activos y parámetros publicados |
| Aplicación interna OFE | Con cuenta y permisos | Gestionar programas, Idiomas, parámetros, usuarios y auditoría |
| API administrativa existente | Sesión, permisos y protección de escritura | Validar cambios y registrar su autoría |

La API pública debe devolver una proyección explícita de los datos necesarios: identificador técnico, nombre, nivel/subnivel, matrícula, Idiomas y semestres cuando correspondan; tasas y porcentajes publicados. No debe devolver usuarios, auditoría, nombres de quien actualizó los valores, ni información de acceso. Los cambios administrativos deben reflejarse en nuevas consultas públicas; los resultados ya calculados deben conservar sus valores originales.

No se debe quitar la autenticación de las rutas internas para conseguir acceso público. Se crearán rutas públicas específicas y pruebas de que sus respuestas contienen únicamente los campos permitidos. El cálculo seguirá utilizando el motor financiero existente.

## Lo que DTIC debe concretar antes de conectarlo

1. Dominio o ruta pública definitiva, alojamiento y HTTPS.
2. Modalidad inicial: enlace o incorporación a una página institucional.
3. Dirección y contrato de la API de lectura; política de actualización y tratamiento de indisponibilidad.
4. Si se utiliza iframe, orígenes institucionales autorizados en `Content-Security-Policy: frame-ancestors` para la ruta pública y permiso de incrustación en el gestor de contenidos. Actualmente el servidor bloquea la incrustación con `frame-ancestors 'none'` y `X-Frame-Options: DENY`; la aplicación interna debe conservar esa protección.
5. Si la pantalla y la API se sirven desde orígenes diferentes, configurar CORS para los orígenes públicos acordados. Bajo el mismo origen no se necesita CORS.
6. Validar acceso anónimo al simulador y a los datos públicos; rechazo del acceso anónimo a administración; sincronización de matrícula e Idiomas; navegación móvil; ausencia de datos internos en respuestas públicas.

Referencias: [MDN — frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors) y [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).
