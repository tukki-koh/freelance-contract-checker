#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerの営業担当です。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール（月額課金）
現状: 売上¥0、認知度低い

長期収益最大化の観点から、毎回以下をすべて実行せよ：

【1. リード獲得】
- フリーランサーが集まるコミュニティ・掲示板・Slack等で今週アプローチすべき場所2件
- 各場所への具体的なアプローチ文案（スパムにならない自然な導線）

【2. パートナー開拓】
- 提携すると集客・収益に直結するパートナー候補1件（例：税理士、労務士、フリーランス支援団体）
- アプローチメール文案（件名＋本文200字以内）

【3. 法人営業】
- フリーランスを多く抱える企業・エージェンシーへのアプローチ提案1件
- 提案するバリュープロポジション（1行）

フォーマット: 各セクションを【1】【2】【3】で区切って出力\"\"\"

payload = json.dumps({
  'model': 'claude-opus-4-8',
  'max_tokens': 1500,
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
