#!/bin/bash
set -e

# 週次経営レポート（CEO室）：CEO・PM・競合・広報・UX・エンジニア・アナリストの日次レポートを統合した週1回の担当。
# 毎週月曜 JST 8時以降の最初の起動で実行（手動実行は常に実行）。
source "$(dirname "$0")/lib_gate.sh"
if ! daily_gate weekly_exec 8 0 1; then
  echo "$GATE_REASON"
  echo "report=skipped (weekly)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 << 'PYEOF'
import json, os, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

def _urlopen_with_retry(req, tries=4, base_delay=3, timeout=90):
    import time, urllib.error
    for i in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
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

SUPA = os.environ["AGENT_SUPABASE_URL"].rstrip("/")
ANON = os.environ["AGENT_SUPABASE_ANON_KEY"]
TOKEN = os.environ["AGENT_LOG_TOKEN"]
H = {"apikey": ANON, "Authorization": f"Bearer {ANON}", "Content-Type": "application/json"}
week_ago = datetime.now(timezone.utc) - timedelta(days=7)

def supa(path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    return json.loads(_urlopen_with_retry(urllib.request.Request(f"{SUPA}/rest/v1/{path}", data=data, headers=H)).read())

facts = []

# ① 無料診断 → 登録 → 購入 の実数
try:
    s = supa("rpc/funnel_stats", {"p_token": TOKEN, "p_since": week_ago.isoformat()})
    facts.append(f"ファネル（直近7日）: 無料診断成功{s['trials_7d_ok']}件 / 新規登録{s['signups_7d']}人（累計{s['signups_total']}） / "
                 f"有効プラン{s['subs_active']}件 / 売上¥{s['revenue_7d_jpy']:,}（累計¥{s['revenue_total_jpy']:,}）")
except Exception as e:
    facts.append(f"ファネル: 取得失敗（{e}）")

# ② Stripeの直近7日の決済
key = os.environ.get("STRIPE_SECRET_KEY", "")
if key:
    try:
        q = urllib.parse.urlencode({"limit": 100, "created[gte]": int(week_ago.timestamp())})
        ch = json.loads(_urlopen_with_retry(urllib.request.Request(f"https://api.stripe.com/v1/charges?{q}", headers={"Authorization": f"Bearer {key}"})).read())
        paid = [c for c in ch.get("data", []) if c.get("paid") and not c.get("refunded")]
        facts.append(f"Stripe（直近7日）: 成功した決済{len(paid)}件・合計¥{sum(c['amount'] for c in paid):,}")
    except Exception as e:
        facts.append(f"Stripe: 取得失敗（{e}）")

# ③ 本番デプロイの状態
tok = os.environ.get("VERCEL_TOKEN", "")
if tok:
    try:
        d = json.loads(_urlopen_with_retry(urllib.request.Request(
            "https://api.vercel.com/v6/deployments?projectId=prj_q7MuyvOd5gJd20ymxmM6tLHhvi8r&target=production&limit=1",
            headers={"Authorization": f"Bearer {tok}"})).read())["deployments"][0]
        facts.append(f"本番デプロイ: {d['state']}（{datetime.fromtimestamp(d['created'] / 1000, timezone.utc).astimezone(timezone(timedelta(hours=9))):%m/%d %H:%M}）")
    except Exception as e:
        facts.append(f"本番デプロイ: 取得失敗（{e}）")

# ④ 営業の送信待ちキュー
try:
    req = urllib.request.Request(f"{SUPA}/rest/v1/webform_leads?select=id&status=eq.pending",
                                 headers={**H, "Prefer": "count=exact", "Range": "0-0"})
    with _urlopen_with_retry(req) as r:
        facts.append(f"Webフォーム営業の送信待ち: {r.headers.get('Content-Range', '*/?').split('/')[-1]}件（人が手動で送る）")
except Exception as e:
    facts.append(f"Webフォーム送信待ち: 取得失敗（{e}）")

# ⑤ 直近7日の各社員の実作業（スキップを除く）
events = supa("agent_events?select=agent_key,agent_name,status,message,created_at"
              f"&status=in.(done,error)&created_at=gte.{week_ago.strftime('%Y-%m-%dT%H:%M:%SZ')}&order=id.desc&limit=1000")
per = {}
for ev in events:
    msg = (ev.get("message") or "").strip()
    if not msg or "スキップ" in msg or "skipped" in msg or ev["agent_key"] in ("weekly_exec", "secretary"):
        continue
    per.setdefault(ev["agent_key"], []).append(ev)
work = []
for key_, evs in per.items():
    errors = sum(1 for e in evs if e["status"] == "error")
    work.append(f"- {evs[0].get('agent_name') or key_}: 実稼働{len(evs)}回（エラー{errors}） 最新: {evs[0]['message'][:300]}")

prompt = f"""あなたはフリーランス向け契約書AI診断サービス「ワークシールド」のCEO室です。
最優先目標は「できる限り早く最初の有料顧客を獲得し、収益化すること」。
単発300円・月額980円。登録不要の無料診断ページ（/try）あり。広告は停止中で、集客は無料施策（SEO記事・note・Qiita・営業メール・Webフォーム営業）のみ。

【今週の実データ】
{chr(10).join(facts)}

【各AI社員の今週の実作業】
{chr(10).join(work) if work else '実稼働の記録なし'}

以下の形式で出力せよ（記号 * # 【】 --- は使わない。箇条書きは「・」のみ。全体600字以内）：
1. 今週の数字の読み（2〜3行。数字は上のデータだけを使い、推測で数字を作らない）
2. 収益化のボトルネック（最も詰まっている1か所と、その根拠）
3. 今週やること3つ（担当＝オーナー or AI社員を明記。具体的で、1週間で終わるもの）
4. やめるべきこと（あれば1つ）"""

payload = json.dumps({"model": "claude-sonnet-5", "max_tokens": 16000, "output_config": {"effort": "medium"},
                      "messages": [{"role": "user", "content": prompt}]}).encode()
res = json.loads(_urlopen_with_retry(urllib.request.Request(
    "https://api.anthropic.com/v1/messages", data=payload,
    headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"}),
    timeout=120).read())
report = "".join(b.get("text", "") for b in res.get("content", []) if b.get("type") == "text").strip()
if not report:
    report = f"（レポート生成失敗: stop_reason={res.get('stop_reason')} / content types={[b.get('type') for b in res.get('content', [])]}）"

slack = os.environ.get("SLACK_WEBHOOK", "")
if slack and report:
    title = datetime.now(timezone(timedelta(hours=9))).strftime("%Y/%m/%d 週次経営レポート")
    urllib.request.urlopen(urllib.request.Request(slack, data=json.dumps({"text": f"{title}\n\n{report}"}).encode(),
                                                  headers={"content-type": "application/json"}), timeout=30)
print(report)
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
