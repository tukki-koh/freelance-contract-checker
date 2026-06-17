#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os

prompt = \"\"\"あなたはfreelance-contract-checkerのUXライター兼コンテンツエディターです。
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
