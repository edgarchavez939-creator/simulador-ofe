# Integración DTIC

## Actualización v2

La nueva instrucción del usuario habilita operación autónoma desde esta fase. Existe autenticación local, autorización servidor y auditoría transaccional sin esperar a DTIC. La decisión v1E al final de este documento queda como antecedente histórico. Consultar [servicio y traspaso a DTIC](AUTONOMOUS_DEPLOYMENT.md) y [esquema, permisos y pruebas](PHASE_V2.md). El proveedor local puede complementarse mediante un vínculo institucional al mismo usuario interno.


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
