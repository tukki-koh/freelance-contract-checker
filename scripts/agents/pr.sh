#!/bin/bash
set -e

RESPONSE=$(python3 << 'PYEOF'
import json, urllib.request, os
from datetime import date

prompt = f"""あなたはfreelance-contract-checkerの広報・PR担当です。
今日: {date.today()}
サービス: フリーランス新法・下請法の契約書リスクをAI診断するSaaS（単発300円/月額980円）
制約: X（旧Twitter）はオーナーが直接運用するため対象外。X以外の認知拡大に集中。

長期的な認知最大化の観点から、毎回以下を実行せよ：

【1. メディア掲載狙い】
- 今アプローチすべきフリーランス系メディア/ニュースサイト/ポータル1件と、刺さる切り口

【2. プレスリリース案】
- 配信するなら今出すべきネタ1件（見出し＋一言要旨）。フリーランス新法の時事性を絡める

【3. 露出チャネル提案】
- X以外で今月試すべき露出施策1件（例: プレスリリース配信、寄稿、ポッドキャスト、コミュニティ登壇）

200〜350字、要点のみ。【1】【2】【3】で区切る。"""

payload = json.dumps({
  "model": "claude-opus-4-8", "max_tokens": 1000,
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(urllib.request.urlopen(req).read())
print(res["content"][0]["text"])
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
