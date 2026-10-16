# Configuración de acceso público y colores — v11

## Uso

Ingresar como administrador del sistema y abrir Configuración. La pantalla organiza tres pestañas:

1. Parámetros: mantiene las condiciones de simulación y Garantisa existentes.
2. Colores de la interfaz: permite calibrar rojo principal, dorado, amarillo de detalle y arena de apoyo mediante un selector o código hexadecimal. Las muestras muestran modos claro y oscuro antes de guardar. Los cambios se revisan en confirmación, se registran por campo y se aplican a la interfaz interna, al acceso y a la pantalla pública. Los blancos, negros, fondos y estados semánticos de cada modo conservan sus definiciones.
3. Acceso público e integración: muestra el estado real configurado en el servicio, enlace público, botones de copiar y abrir, código del iframe, orígenes externos autorizados, comprobación de catálogo/parámetros sin cookies de sesión y vista previa en escritorio o a 390 px.

El enlace y el código se generan con el origen del despliegue. En el servicio del propietario corresponden a `https://simulador-ofe-pruebas.onrender.com/apps/public/`; no hay que reescribir el código al trasladar el alojamiento a DTIC si se configura el nuevo `APP_ORIGIN`.

Mostrar vista previa carga el simulador dentro de Configuración. El indicador termina al recibir la señal de inicio del documento público del mismo origen y de ese iframe concreto; también informa del fallo o del tiempo de espera. La comprobación de conexión verifica las respuestas públicas de programas y parámetros sin enviar la sesión administrativa.

Restaurar paleta original prepara los valores iniciales en la muestra. Es necesario revisar y guardar para aplicarlos. Descartar cambios recupera la última paleta cargada. Recargar colores consulta la versión vigente del servidor. Una edición concurrente requiere recargar antes de volver a guardar.

## Persistencia y permisos

- Migración automática `003-appearance.sql`: tabla independiente `appearance_settings`, sin modificar catálogo ni condiciones financieras.
- Lectura administrativa: `GET /api/admin/appearance` y `GET /api/admin/public-access`, con `settings.read`.
- Escritura: `PUT /api/admin/appearance`, con sesión vigente, `settings.update`, protección de origen/CSRF y versión optimista.
- Solo se aceptan los cuatro campos de marca y colores `#RRGGBB`. No se admite CSS libre ni claves para modificar fondos o texto de cada modo.
- Cada campo cambiado genera `CONFIG_UPDATE`, módulo `settings`, entidad `appearance`, dentro de la misma transacción. Un fallo de auditoría revierte la escritura.
- La hoja `/shared/ui/brand.css` publica exclusivamente reglas de presentación calculadas; no contiene usuarios, autorías, auditoría o versiones de edición. La carga del login usa `/auth-assets/brand.css`. Ambas respuestas evitan caché.
- Las superficies y el texto de cada modo permanecen definidos por los estilos originales. El color de texto de los botones y los tonos de énfasis se derivan para mantener contraste.
- Al guardar se aplica la paleta al documento actual; nuevas cargas o actualizaciones de la pantalla pública reciben la paleta guardada. Restaurar la paleta también funciona después de haber recargado una página con una paleta personalizada.

El almacenamiento tiene la misma persistencia que la base de datos del servicio. En la demostración efímera de Render, una reconstrucción de la base recupera la paleta original. DTIC debe conservar su base en almacenamiento persistente.

## Verificación

119 pruebas del proyecto: permisos, validación, contraste, exclusión de neutrales, consulta y escritura, control de concurrencia, auditoría por campo y reversión, actualización desde una base anterior, persistencia al reiniciar, señales de carga de iframe y regresiones existentes.

Revisión local en navegador: copiar enlace y código; conexión anónima; cargar y cambiar el tamaño de la vista previa; aplicar colores en la interfaz y comprobarlos dentro del iframe; recargar y restaurar la paleta; comparar las variables de fondos/texto en ambos modos antes y después; revisión a 390 px sin desbordamiento horizontal; consola sin errores. Los datos de estas pruebas pertenecen a una base temporal.

Los 173 IDs del catálogo embebido y los seis archivos `03-finance-core.js` / `07-financing-engine.js` conservan sus hashes. Las condiciones financieras mantienen su versión y valores al guardar colores.

Se verificó en navegador el acceso público del servicio de Render sin iniciar sesión. La nueva Configuración necesita desplegar esta revisión en Render; no se accedió a la cuenta administrativa remota ni se cambiaron allí colores o variables de entorno.

## Despliegue

En el servicio existente, usar Manual Deploy → Deploy latest commit de `feat/dtic-readiness`. No hay variables nuevas que agregar para estas pestañas. La base se actualiza automáticamente al iniciar el servicio. Después, entrar como administrador y abrir Configuración. El acceso público y los orígenes de iframe ya configurados se conservan.
