# Publicación actual en GitHub Pages

- Sitio: https://edgarchavez939-creator.github.io/simulador-ofe/
- Fuente de Pages: rama `main`, carpeta raíz `/`.
- `index.html` redirige a `./apps/public/`; el enlace habitual abre la aplicación pública actualizada.
- Publicar toda la estructura: `apps/public`, sus recursos y `shared/program-catalog`. No publicar un HTML aislado.
- La publicación OFE con usuarios y auditoría reales usa el nuevo servidor autónomo. Seguir [AUTONOMOUS_DEPLOYMENT](AUTONOMOUS_DEPLOYMENT.md); Pages conserva la variante estática y no ejecuta el backend.
- Enviar cambios a otra rama no actualiza Pages; la revisión validada debe llegar a `main` mediante avance directo o el flujo de revisión del repositorio.

## Despliegue institucional previsto

- `dist/public/` -> `simulador.uninorte.edu.co`
- `dist/ofe/` -> `simulador-ofe.uninorte.edu.co`

Los builds institucionales deben generarse desde una única fuente compartida y no mantener copias independientes del motor financiero. Estas rutas son el destino previsto y aún dependen de DTIC.
