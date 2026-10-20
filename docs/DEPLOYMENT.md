# Publicación y alojamiento

Este ZIP contiene el proyecto ejecutable; no necesita completar un scaffold ni generar carpetas `dist/`. Las rutas de dominio institucional deben acordarse con DTIC.

La guía operativa vigente para DTIC es [Despliegue institucional](DESPLIEGUE_INSTITUCIONAL.md), con [plantillas](../deploy/README.md).

## Servicio con autenticación y administración

Seguir [operación y traslado](AUTONOMOUS_DEPLOYMENT.md). Se ejecuta el servidor Node.js de `server/`, con SQLite persistente y un proxy HTTPS institucional. La pantalla pública y el área interna comparten el servidor actual, con rutas y permisos separados. El despliegue como dos proyectos o dominios institucionales sigue pendiente de diseño y validación con DTIC; no se entrega como implementado.

Consultar [guía de infraestructura](../deploy/README.md) para evitar publicar la carpeta de código como raíz estática del área interna.

## GitHub Pages

El sitio de referencia es `https://edgarchavez939-creator.github.io/simulador-ofe/`, desde `main` y la carpeta raíz. La entrada raíz conduce a `apps/public/`. Publicar toda la estructura de recursos necesaria, incluida `shared/`; un HTML aislado no contiene la aplicación.

Pages sirve la variante pública estática, con catálogo embebido. No ejecuta sesiones, API, administración ni auditoría, y no recibe automáticamente los cambios guardados en Render.

## Demostración gratuita

La [guía de Render Free](RENDER_FREE_DEMO.md) describe la prueba con almacenamiento efímero. `render.yaml` corresponde a la alternativa de pago con disco persistente; no usar ese Blueprint para una prueba sin presupuesto. Ningún recurso se crea al descomprimir este ZIP.
