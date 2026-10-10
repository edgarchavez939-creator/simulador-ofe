#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
cd "$ROOT"
required=(
  apps/public apps/ofe shared/financial-core shared/design-system
  shared/program-catalog/adapters shared/auth shared/pdf shared/utilities
  shared/vendor data deploy docs scripts
)
failed=0
for p in "${required[@]}"; do
  if [[ ! -e "$p" ]]; then echo "FALTA: $p"; failed=1; fi
done
if [[ $failed -eq 0 ]]; then echo "OK: estructura DTIC mínima presente"; fi
exit $failed
