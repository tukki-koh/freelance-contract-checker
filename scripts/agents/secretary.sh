#!/bin/bash
set -e

# 稼働時刻（JST 5時）以降の最初の起動で、本日まだ実稼働していなければ実行（手動実行は常に実行）
source "$(dirname "$0")/lib_gate.sh"
if ! daily_gate secretary 5; then
  echo "$GATE_REASON"
  echo "report=skipped (once-daily)" >> $GITHUB_OUTPUT
  exit 0
fi

# 各部門の報告は「同じワークフロー実行の出力」ではなく、Supabase の稼働ログ（過去24時間の実稼働）から集める。
# 社員は1日1回・各自の時刻にしか実作業しないため、秘書が動く朝の実行では他部門はすべてスキップしており、
# 以前は毎日「活動報告なし」になっていた。
SUMMARY=$(python3 << 'PYEOF'
import json, os, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

def _urlopen_with_retry(req, tries=4, base_delay=3):
    import time, urllib.error
    for i in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=60)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 529) and i < tries - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise
        except urllib.error.URLError:
            if i < tries - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise

SUPA = os.environ.get("AGENT_SUPABASE_URL", "").rstrip("/")
ANON = os.environ.get("AGENT_SUPABASE_ANON_KEY", "")
H = {"apikey": ANON, "Authorization": f"Bearer {ANON}"}

def supa(path):
    return json.loads(_urlopen_with_retry(urllib.request.Request(f"{SUPA}/rest/v1/{path}", headers=H)).read())

since = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
names = {a["agent_key"]: a["name"] for a in supa("agents?select=agent_key,name&role_type=eq.agent")}
events = supa("agent_events?select=agent_key,status,message,created_at"
              f"&status=in.(done,error)&created_at=gte.{since}&order=created_at.desc&limit=500")

latest = {}
for ev in events:
    msg = (ev.get("message") or "").strip()
    if not msg or "スキップ" in msg or "skipped" in msg:
        continue
    if ev["agent_key"] == "secretary":
        continue
    latest.setdefault(ev["agent_key"], ev)

if not latest:
    print("過去24時間に実稼働した部門はありませんでした。")
    raise SystemExit(0)

lines = []
for key, ev in latest.items():
    status = "（エラー）" if ev["status"] == "error" else ""
    lines.append(f"{names.get(key, key)}{status}: {ev['message'][:400]}")

prompt = f"""あなたは専属秘書です。以下は過去24時間に各部門が実際に行った作業の記録です。朝の日次報告としてまとめてください。

{chr(10).join(lines)}

以下のルールで出力せよ：
- 記号（*、#、【】、---等）は一切使わない
- 箇条書きは「・」のみ使用
- 各部門は1行以内
- エラーの部門は必ず含める
- 最後に「オーナーへ」として今日中にやるべきことを3件以内で端的に記載
- 全体320字以内
- 余計な挨拶・前置き・締めの言葉は不要"""

payload = json.dumps({
    "model": "claude-sonnet-5",
    "max_tokens": 16000,
    "output_config": {"effort": "low"},
    "messages": [{"role": "user", "content": prompt}],
}).encode()
req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages", data=payload,
    headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())
text = "".join(b.get("text", "") for b in res.get("content", []) if b.get("type") == "text").strip()
print(text or f"（日報生成失敗: stop_reason={res.get('stop_reason')} / content types={[b.get('type') for b in res.get('content', [])]}）")
PYEOF
)

DATE=$(TZ=Asia/Tokyo date '+%Y/%m/%d 朝の日次レポート')
SLACK_TEXT="$DATE

$SUMMARY" python3 << 'PYEOF'
import json, os, urllib.request
req = urllib.request.Request(os.environ["SLACK_WEBHOOK"], data=json.dumps({"text": os.environ["SLACK_TEXT"]}).encode(),
                             headers={"content-type": "application/json"})
urllib.request.urlopen(req, timeout=30)
PYEOF

echo "$SUMMARY"
