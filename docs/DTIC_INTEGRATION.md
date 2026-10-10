# Integración DTIC

## Alcance preparado por el proyecto
- Aplicación pública separada de la aplicación OFE.
- Contrato de catálogo dinámico de programas.
- Adaptador API desacoplado.
- Adaptador de autenticación desacoplado.
- Plantillas de headers de seguridad.

## Pendiente de DTIC
- Microsoft Entra ID.
- API y base de datos institucional.
- Repositorio institucional y CI/CD.
- DNS, TLS/HTTPS y headers definitivos del servidor.
- Restricciones de red y grupos/roles.

## Principio
La aplicación OFE debe asumir que autenticación/autorización se resuelve en infraestructura o en el adaptador definido por DTIC. No se deben incluir secretos en frontend.
