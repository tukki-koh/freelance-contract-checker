#!/bin/bash
set -e

# 1日1回だけ実行（JST 18時）。手動実行(workflow_dispatch)時は常に実行してAPIコストを節約しつつ動作確認できるようにする。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "18" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は18時)"
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

prompt = f"""あなたはfreelance-contract-checkerの競合リサーチャーです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはトップ戦略ファームの競合インテリジェンスアナリストのように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {date.today()}
自社: フリーランス新法・下請法の契約書リスクをAI診断するSaaS（単発300円/月額980円、特化型）
競合カテゴリ: 汎用AI（ChatGP, Claude等）、契約書レビューAI、リーガルテック、弁護士相談サービス

長期的な差別化の観点から、毎回以下を実行せよ：

【1. 競合ウォッチ】
- 注目すべき競合1件と、その強み/弱み（価格・機能・ターゲットの観点）

【2. 自社が勝てる差別化ポイント】
- 上記競合に対し自社が優位に立てる点1つと、LP/訴求への反映案

【3. 脅威と対応】
- 自社にとっての最大の脅威1件と、今取るべき先手1つ

200〜350字、要点のみ。【1】【2】【3】で区切る。推測を断定で書かず、確度が低い点は「推定」と明示。"""

payload = json.dumps({
  "model": "claude-sonnet-4-8", "max_tokens": 1000,
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
