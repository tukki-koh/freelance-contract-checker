#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os

prompt = \"\"\"あなたはfreelance-contract-checkerのUXライター兼コンテンツエディターです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはAppleのコピーライター（簡潔で人間味あるUX文章）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
現状: LP訪問者がCVせずに離脱、決済0件

以下を実行せよ：
1. ファーストビューのキャッチコピー改善案2つ（現状より具体的・緊急性を高める）
2. CTAボタン文言のA/Bテスト案2つ
3. 離脱防止のための追加コンテンツ提案1件
200字以内で出力\"\"\"

payload = json.dumps({
  'model': 'claude-opus-4-8',
  'max_tokens': 600,
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
