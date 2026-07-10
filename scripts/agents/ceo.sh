#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerのCEOです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはAmazonのジェフ・ベゾス（顧客起点・長期思考・Day1精神）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
対象週: {date.today().strftime('%Y年第%W週')}
サービス状況: Google広告クリック激減、売上¥0継続中

以下を実行せよ：
1. 今週の最優先戦略1つを決定（理由付き）
2. 各部門への具体的KPI指示（エンジニア/マーケ/UX/法務）
3. 収益回復のタイムライン（3週間計画）
300字以内で出力\"\"\"

payload = json.dumps({
  'model': 'claude-opus-4-8',
  'max_tokens': 800,
  'messages': [{'role': 'user', 'content': prompt}]
}).encode()

req = urllib.request.Request(
  'https://api.anthropic.com/v1/messages',
  data=payload,
  headers={
    'x-api-key': os.environ['ANTHROPIC_API_KEY'],
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  }
)
res = json.loads(urllib.request.urlopen(req).read())
print(res['content'][0]['text'])
")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
