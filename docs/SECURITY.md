# Seguridad

- No almacenar secretos en frontend.
- El build público no debe incluir módulos administrativos.
- El build OFE debe quedar preparado para protección con Microsoft Entra por DTIC.
- Dependencias de producción deben servirse localmente.
- CSP, HSTS, `nosniff`, `frame-ancestors` y demás headers deben configurarse en servidor.
- No publicar source maps salvo decisión expresa de DTIC.

## Estado v1E

El adaptador institucional sigue sin configurar. `OFEPermissions` centraliza únicamente la visibilidad y navegación de interfaz; no equivale a autorización servidor. El actualizador está cerrado por defecto y su exportación de cambios está deshabilitada. No hay login ni auditoría reales hasta integrar DTIC. No se activa el mock de autenticación. Los PIN históricos no deben presentarse como protección de acceso. Ver [dependencias y contrato de auditoría](FUNCTIONAL_V1E.md).
