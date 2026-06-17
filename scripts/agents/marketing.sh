#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerのマーケティング担当です。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール

以下を実行せよ：
1. 今日投稿するXの投稿文3本（各140字以内、ハッシュタグ付き）
2. ターゲット: フリーランサー・副業ワーカー
3. 各投稿末尾に診断ツールへの誘導を含める
フォーマット: [投稿1]〜[投稿3]で出力\"\"\"

payload = json.dumps({
  'model': 'claude-opus-4-8',
  'max_tokens': 1000,
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
