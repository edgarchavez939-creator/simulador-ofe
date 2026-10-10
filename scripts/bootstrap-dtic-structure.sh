#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
cd "$ROOT"
mkdir -p apps/public/assets apps/ofe/assets \
  shared/financial-core shared/design-system shared/program-catalog/adapters \
  shared/auth shared/pdf shared/utilities shared/vendor \
  data deploy docs scripts dist
printf 'Estructura DTIC creada en %s\n' "$(pwd)"
