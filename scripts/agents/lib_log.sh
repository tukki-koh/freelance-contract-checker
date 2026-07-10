#!/bin/bash
# エージェント稼働ログ用 共通ヘルパー
# Supabase の log_agent_event RPC を叩いて、LIVEダッシュボードに稼働状況を送る。
# 失敗してもエージェント本体は止めない（best-effort）。

agent_log() {
  # 使い方: agent_log <agent_key> <status> [message] [task]
  local key="$1" status="$2" message="${3:-}" task="${4:-}"
  local url="${AGENT_SUPABASE_URL:-}" anon="${AGENT_SUPABASE_ANON_KEY:-}" token="${AGENT_LOG_TOKEN:-}"
  [ -z "$url" ] || [ -z "$anon" ] || [ -z "$token" ] && return 0

  local run_url=""
  if [ -n "${GITHUB_SERVER_URL:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ] && [ -n "${GITHUB_RUN_ID:-}" ]; then
    run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
  fi

  AGENT_KEY="$key" AGENT_STATUS="$status" AGENT_MSG="$message" AGENT_TASK="$task" \
  AGENT_RUN_URL="$run_url" AGENT_URL="$url" AGENT_ANON="$anon" AGENT_TOKEN="$token" \
  python3 - <<'PY' 2>/dev/null || true
import json, os, urllib.request
payload = json.dumps({
    "p_token": os.environ["AGENT_TOKEN"],
    "p_agent_key": os.environ["AGENT_KEY"],
    "p_status": os.environ["AGENT_STATUS"],
    "p_message": (os.environ.get("AGENT_MSG") or "")[:400],
    "p_task": os.environ.get("AGENT_TASK") or None,
    "p_run_url": os.environ.get("AGENT_RUN_URL") or None,
}).encode()
req = urllib.request.Request(
    os.environ["AGENT_URL"].rstrip("/") + "/rest/v1/rpc/log_agent_event",
    data=payload,
    headers={
        "apikey": os.environ["AGENT_ANON"],
        "Authorization": "Bearer " + os.environ["AGENT_ANON"],
        "Content-Type": "application/json",
    },
)
try:
    urllib.request.urlopen(req, timeout=10)
except Exception:
    pass
PY
}
