#!/bin/bash
# エージェント実行ラッパー：稼働ログ(running→done/error)を送りつつ本体スクリプトを実行する。
# 使い方: bash scripts/agents/run.sh <agent_key> <script_path> [開始タスク名]
set -uo pipefail

KEY="$1"
SCRIPT="$2"
TASK="${3:-}"

DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/lib_log.sh"

agent_log "$KEY" running "稼働開始" "$TASK"

OUT_LOG="$(mktemp)"
bash "$SCRIPT" 2>&1 | tee "$OUT_LOG"
CODE="${PIPESTATUS[0]}"

# 出力の末尾を要約として送る（行単位で抽出。文字数制限はlib_log側でUTF-8安全に実施）
# ※ tail -c（バイト単位）は日本語を途中で切りJSON化を壊すため使わない
SUMMARY="$(tr -d '\r' < "$OUT_LOG" | grep -v '^[[:space:]]*$' | tail -n 6)"

if [ "$CODE" -eq 0 ]; then
  agent_log "$KEY" done "$SUMMARY" "$TASK"
else
  agent_log "$KEY" error "エラー終了 (code $CODE): $SUMMARY" "$TASK"
fi

rm -f "$OUT_LOG"
exit "$CODE"
