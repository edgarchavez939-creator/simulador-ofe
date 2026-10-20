# Seguridad del servicio autónomo

La entrega v2 sustituye la decisión histórica v1E de esperar a DTIC: existe autenticación local real en `server/`, con autorización y auditoría en el servidor. GitHub Pages continúa siendo estático y no puede activar estas capacidades por sí solo.

- Contraseñas con scrypt, sal aleatoria por usuario, `N=131072`, `r=8`, `p=1`, comparación de tiempo constante. Política de 12 a 128 caracteres. No se devuelven contraseñas ni hashes al cliente ni a auditoría.
- Sesiones opacas de 256 bits; solo SHA-256 del token en SQLite. Cookie HttpOnly, SameSite=Strict, Path=/ y, en HTTPS, Secure y prefijo `__Host-`. Vencimiento absoluto de 8 horas e inactividad de 30 minutos. El chequeo periódico de sesión no renueva la inactividad.
- Validación del origen exacto y token CSRF en mutaciones autenticadas. Sin CORS. Login genérico, límite persistente por cuenta (10/15 minutos) y dirección directa (60/15 minutos), con un máximo de dos verificaciones costosas simultáneas. Detrás de un proxy, el límite por dirección es compartido; no se confía en encabezados de cliente falsificables.
- La sesión se vuelve a validar después de operaciones asíncronas. Desactivación, cambio de rol o restablecimiento de contraseña revocan sesiones del usuario. No puede desactivarse ni degradarse el último administrador activo.
- Roles y permisos centrales, comprobados en cada API; 401 sin sesión y 403 sin permiso. Ocultar una opción de navegación solo mejora la interfaz y nunca reemplaza esa comprobación.
- Mutaciones de usuarios y programas con auditoría en la misma transacción. Un error al auditar revierte la escritura. Actualizaciones con versión optimista y conflicto 409; lotes completos o ninguno.
- Rutas y recursos OFE protegidos por sesión; base, migraciones y código del servidor fuera de la lista estática permitida. CSP, nosniff, X-Frame-Options, no-store y HSTS en HTTPS. Se sirven exclusivamente los recursos necesarios.
- Base y respaldos fuera de Git, con permisos restringidos. No hay alta pública, cuenta predeterminada, setup por HTTP ni recuperación que omita la autenticación.

El historial de simulaciones conserva su almacenamiento local y se separa por ID de usuario en el servidor autónomo. No es un repositorio central de expedientes ni una auditoría de cada cálculo. No se reasigna automáticamente el historial previo sin dueño a una nueva cuenta.

El esquema de auditoría no puede modificarse desde la API ni desde el rol system_admin. Un operador con acceso al sistema de archivos sí puede alterar SQLite: no se afirma inmutabilidad criptográfica. Los respaldos contienen datos de acceso y trazabilidad y deben conservarse con acceso restringido.

No se incluyen secretos de DTIC. La futura identidad institucional se vinculará al usuario interno sin sustituir la autorización. Véase [operación y traspaso](AUTONOMOUS_DEPLOYMENT.md) y [matriz, eventos y pruebas](PHASE_V2.md).

El frontend sirve jsPDF 4.2.1, SheetJS CE 0.20.3, Chart.js 4.5.1 y ExcelJS 4.4.0 desde `shared/vendor/`, con integridad SRI, licencias y manifiesto de procedencia. Las fuentes también son locales. La CSP HTTP limita scripts al propio origen; mantiene estilos en línea por compatibilidad con la interfaz actual. Véase [dependencias y evaluación de las alertas de SheetJS](DEPENDENCIES.md). La administración continúa requiriendo su servicio de datos.

## Instalación institucional

El arranque normal es `server/start.cjs`, con `NODE_ENV=production`, `APP_ORIGIN` institucional y `OFE_DATABASE` persistente. Las variables se suministran al proceso o mediante `node --env-file=...`; no existe carga automática de `.env`. El responsable confirmó mantener un solo proyecto y servicio, con rutas públicas e internas y controles de acceso en el servidor. Entra ID continúa pendiente de integración. Véase [guía institucional](DESPLIEGUE_INSTITUCIONAL.md).

## Modo de demostración gratuito

`server/start-demo.cjs` es una entrada opcional que exige `OFE_EPHEMERAL_DEMO=1` y credenciales privadas configuradas por el propietario. Solo inicializa la primera cuenta si no hay usuarios y utiliza el mismo bootstrap transaccional, hash, API, sesiones y permisos reales. No abre setup por HTTP ni incluye cuentas o contraseñas predeterminadas. La contraseña inicial se consume y elimina del entorno del proceso; Render conserva la variable privada para reconstruir la demo después de perder el disco efímero. Por eso se usan credenciales exclusivas de prueba y no se activa esta entrada en el entorno persistente o institucional. Véase [guía gratuita](RENDER_FREE_DEMO.md).
