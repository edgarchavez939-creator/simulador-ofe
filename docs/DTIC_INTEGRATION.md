# Integración DTIC

## Alcance preparado por el proyecto
- Aplicación pública separada de la aplicación OFE.
- Contrato de catálogo dinámico de programas.
- Adaptador API desacoplado con validación de lectura, tiempo de espera y arranque asíncrono (Program Catalog v1C).
- Proveedor embedded activo: 29 pregrados y 144 posgrados; API/mock probados con transporte simulado.
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

## Iteración funcional v1E — decisión del usuario

Integración exclusiva con DTIC; se avanza con funcionalidades mientras la conexión institucional queda pendiente. Ver [informe y contratos](FUNCTIONAL_V1E.md) para matriz de permisos, sesiones, auditoría por campo, transacción, concurrencia y pruebas de aceptación institucionales. El cliente no habilita publicación ni sustituye el control de acceso del servidor.
