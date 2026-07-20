#!/bin/bash
set -e

# 1日1回だけ実行（JST 16時）。手動実行(workflow_dispatch)時は常に実行してAPIコストを節約しつつ動作確認できるようにする。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "16" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は16時)"
  echo "report=skipped (once-daily)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 << 'PYEOF'
import json, urllib.request, os

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
from datetime import date

# --- Stripe から実データ取得（あれば）---
def stripe_get(path):
    key = os.environ.get("STRIPE_SECRET_KEY", "")
    if not key: return {}
    req = urllib.request.Request(f"https://api.stripe.com/v1/{path}",
        headers={"Authorization": f"Bearer {key}"})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=15).read())
    except Exception:
        return {}

charges = stripe_get("charges?limit=100")
paid = [c for c in charges.get("data", []) if c.get("paid")]
revenue = sum(c.get("amount", 0) for c in paid) // 100
subs = stripe_get("subscriptions?status=active&limit=100")
active_subs = len(subs.get("data", []))
customers = stripe_get("customers?limit=1").get("total_count", "不明")

data_ctx = f"""【Stripe実データ】
直近チャージ総額(直近100件): ¥{revenue}
アクティブサブスク: {active_subs}
顧客数: {customers}
月額プラン: ¥980 / 単発: ¥300"""

prompt = f"""あなたはfreelance-contract-checkerの財務・経理担当（CFO補佐）です。
あなたは世界で最も成功している企業の同職種トップ人材、具体的には一流SaaSのCFO（Rule of 40と効率的成長を追求）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {date.today()}
{data_ctx}

黒字化の観点から、毎回以下を実行せよ：

【1. 財務ヘルスの一言診断】
- MRR/売上の現状と最大の問題を数値根拠で1行

【2. コスト最適化】
- 今かかっている主コスト（Anthropic API・各種ホスティング）の使いすぎ懸念1点と対策

【3. CEOへの数値提言】
- 黒字化に最も効く意思決定1件（価格・支出・投資のいずれか）

200〜350字、要点のみ。【1】【2】【3】で区切る。"""

payload = json.dumps({
  "model": "claude-opus-4-8", "max_tokens": 1000,
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())
print(res["content"][0]["text"])
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
