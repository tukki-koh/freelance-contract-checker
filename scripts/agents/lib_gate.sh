#!/bin/bash
# 1日1回ゲート（各エージェントスクリプトから source して使う）
#
# GitHub Actions の「毎時」cron は実際には1日5〜7回しか起動せず、起動時刻も不定。
# 「JST NN時ちょうど」に一致したときだけ動かす方式だと、CEO(08時)やCS(12時)などは
# 何日も一度も実行されなかった。そこで
#   「稼働時刻以降の最初の起動で、本日まだ実稼働していなければ実行する」
# に変更する。本日の実稼働の有無は Supabase agent_events（スキップ以外の done / error）で判定する。
#
# 使い方: daily_gate <agent_key> <稼働開始時(JST)> [平日のみ=1] [曜日指定 1=月〜7=日]
#   例) daily_gate sales 9 1       … 平日の9時以降に1日1回
#       daily_gate legal 14 0 3    … 毎週水曜の14時以降に1回
#   戻り値 0 = 実行する / 1 = スキップ（理由は $GATE_REASON。必ず「スキップ」を含める：
#   ダッシュボードと本判定が message の「スキップ」で実稼働かどうかを見分けているため）
daily_gate() {
  local key="$1" start="$2" weekday_only="${3:-0}" only_dow="${4:-}"
  GATE_REASON=""
  if [ "${GITHUB_EVENT_NAME:-}" = "workflow_dispatch" ] || [ "${FORCE_REPORT:-}" = "true" ]; then
    return 0
  fi

  local dow hour
  dow=$(TZ=Asia/Tokyo date '+%u')              # 1=月, 7=日
  hour=$((10#$(TZ=Asia/Tokyo date '+%H')))
  if [ "$weekday_only" = "1" ] && [ "$dow" -ge 6 ]; then
    GATE_REASON="週末のためスキップ (DOW=$dow)"
    return 1
  fi
  if [ -n "$only_dow" ] && [ "$dow" != "$only_dow" ]; then
    GATE_REASON="担当曜日ではないためスキップ (DOW=$dow、担当は$only_dow)"
    return 1
  fi
  if [ "$hour" -lt "$start" ]; then
    GATE_REASON="稼働時刻前のためスキップ (JST ${hour}時、稼働は${start}時以降の最初の起動)"
    return 1
  fi

  local ran
  ran=$(python3 - "$key" <<'PY'
import json, os, sys, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

key = sys.argv[1]
url = os.environ.get("AGENT_SUPABASE_URL", "").rstrip("/")
anon = os.environ.get("AGENT_SUPABASE_ANON_KEY", "")
if not (url and anon):
    print("unknown")
    sys.exit()
jst = timezone(timedelta(hours=9))
day_start = datetime.now(jst).replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
q = (f"{url}/rest/v1/agent_events?select=status,message&agent_key=eq.{urllib.parse.quote(key)}"
     f"&status=in.(done,error)&created_at=gte.{day_start.strftime('%Y-%m-%dT%H:%M:%SZ')}")
try:
    req = urllib.request.Request(q, headers={"apikey": anon, "Authorization": f"Bearer {anon}"})
    rows = json.loads(urllib.request.urlopen(req, timeout=15).read())
    real = [r for r in rows if not any(w in (r.get("message") or "") for w in ("スキップ", "skipped"))]
    print("yes" if real else "no")
except Exception:
    print("unknown")
PY
)
  if [ "$ran" = "yes" ]; then
    GATE_REASON="本日は実行済みのためスキップ"
    return 1
  fi
  # 履歴を確認できないときは、二重実行でクレジットを浪費しないよう稼働時刻ちょうどの起動だけ実行する
  if [ "$ran" != "no" ] && [ "$hour" -ne "$start" ]; then
    GATE_REASON="実行履歴を確認できないため重複防止でスキップ (JST ${hour}時)"
    return 1
  fi
  return 0
}
