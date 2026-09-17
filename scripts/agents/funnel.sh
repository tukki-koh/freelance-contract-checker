#!/bin/bash
set -e

# 無料診断ファネル監視（AIは使わない＝クレジット消費ゼロ）。ワークフローが起動するたびに実行する。
# - サイトと無料診断ページの死活監視
# - 無料診断の失敗の急増（今週、タイムアウトとJSON崩れで2回壊れた）
# - 新しい購入
# 異常や購入があればすぐSlackに通知し、毎回の数字は稼働ログに残す（朝の日報に載る）。
RESPONSE=$(python3 << 'PYEOF'
import json, os, urllib.error, urllib.request
from datetime import datetime, timedelta, timezone

SUPA = os.environ["AGENT_SUPABASE_URL"].rstrip("/")
ANON = os.environ["AGENT_SUPABASE_ANON_KEY"]
TOKEN = os.environ["AGENT_LOG_TOKEN"]
SLACK = os.environ.get("SLACK_WEBHOOK", "")
SITE = "https://freelance-contract-checker.vercel.app"
H = {"apikey": ANON, "Authorization": f"Bearer {ANON}", "Content-Type": "application/json"}

def call(url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    return json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data, headers=H), timeout=20).read())

# 前回の監視時刻（購入を二重に通知しないため、それ以降の購入だけを数える）
prev = call(f"{SUPA}/rest/v1/agent_events?select=created_at&agent_key=eq.funnel&status=eq.done&order=id.desc&limit=1")
since = prev[0]["created_at"] if prev else (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
s = call(f"{SUPA}/rest/v1/rpc/funnel_stats", {"p_token": TOKEN, "p_since": since})

health = {}
for path in ("/", "/try"):
    try:
        with urllib.request.urlopen(urllib.request.Request(SITE + path, headers={"User-Agent": "WorkShield-FunnelMonitor"}), timeout=25) as r:
            health[path] = r.status
    except urllib.error.HTTPError as e:
        health[path] = e.code
    except Exception:
        health[path] = "接続失敗"

alerts = []
for path, code in health.items():
    if code != 200:
        alerts.append(f"🚨 サイト異常: {path} の応答が {code}")
ok, err = s["trials_24h_ok"], s["trials_24h_error"]
if err >= 1 and err >= ok:
    alerts.append(f"🚨 無料診断の失敗が多い: 24時間で成功{ok}件・失敗{err}件")
if s["payments_since"] > 0:
    alerts.append(f"🎉 新しい購入 {s['payments_since']}件（¥{s['revenue_since_jpy']:,}）")

line = (f"無料診断 24h 成功{ok}・失敗{err}／7日 {s['trials_7d_ok']}件 ｜ "
        f"新規登録 24h {s['signups_24h']}・7日 {s['signups_7d']}・累計 {s['signups_total']} ｜ "
        f"有効プラン {s['subs_active']} ｜ 売上 7日 ¥{s['revenue_7d_jpy']:,}・累計 ¥{s['revenue_total_jpy']:,} ｜ "
        f"サイト {'正常' if all(c == 200 for c in health.values()) else '異常'}")

if alerts and SLACK:
    body = json.dumps({"text": "\n".join(alerts) + "\n" + line}).encode()
    urllib.request.urlopen(urllib.request.Request(SLACK, data=body, headers={"content-type": "application/json"}), timeout=20)

print("\n".join(alerts + [line]))
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
