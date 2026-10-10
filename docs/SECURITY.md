# Seguridad

- No almacenar secretos en frontend.
- El build público no debe incluir módulos administrativos.
- El build OFE debe quedar preparado para protección con Microsoft Entra por DTIC.
- Dependencias de producción deben servirse localmente.
- CSP, HSTS, `nosniff`, `frame-ancestors` y demás headers deben configurarse en servidor.
- No publicar source maps salvo decisión expresa de DTIC.
