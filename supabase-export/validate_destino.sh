#!/usr/bin/env bash
# ============================================================
# validate_destino.sh — roda VALIDATE_DESTINO.sql no banco destino
#
# Uso:
#   DESTINO_URL="postgresql://user:pass@host:5432/db" \
#     bash supabase-export/validate_destino.sh
#
# Ou:
#   bash supabase-export/validate_destino.sh "postgresql://..."
#
# Exit codes:
#   0 = tudo OK
#   1 = falha de validação (FAIL ou tabela sem PK/RLS)
#   2 = erro de conexão / arquivo
# ============================================================
set -u

DIR="$(cd "$(dirname "$0")" && pwd)"
SQL="$DIR/VALIDATE_DESTINO.sql"

URL="${1:-${DESTINO_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "❌ Forneça a URL do destino: \$DESTINO_URL ou \$1"
  exit 2
fi
if [[ ! -f "$SQL" ]]; then
  echo "❌ Arquivo não encontrado: $SQL"
  exit 2
fi

OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

echo "▶  Validando destino..."
if ! psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL" 2>&1 | tee "$OUT"; then
  echo "❌ psql falhou."
  exit 2
fi

FAIL_COUNT=$(grep -c '❌ FAIL' "$OUT" || true)
EXTRA_COUNT=$(grep -c '⚠️  EXTRA' "$OUT" || true)

echo
echo "──────────────────────────────────────────────"
echo " Resumo: $FAIL_COUNT FAIL  |  $EXTRA_COUNT EXTRA"
echo "──────────────────────────────────────────────"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo "❌ Validação FALHOU — reaplique os blocos faltantes."
  exit 1
fi

echo "✅ Destino validado com sucesso."
exit 0