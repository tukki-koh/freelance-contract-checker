#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerのカスタマーサクセス担当です。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール（月額課金）
現状: 新規ユーザー獲得フェーズ、解約防止・LTV最大化が急務

365日24時間、毎回以下をすべて実行せよ：

【1. オンボーディング改善】
- 初回登録〜初回診断完了までの離脱ポイント予測と対策1件
- 初回ユーザーへのウェルカムメール文案（件名＋本文200字以内）

【2. 継続率向上】
- 解約リスクユーザーの行動パターン定義1件
- 継続を促すリテンション施策1件（通知・特典・コンテンツ等）

【3. LTV最大化】
- アップセル・クロスセルの導線提案1件（具体的なタイミングと文案）
- ユーザーの成功事例として発信できるシナリオ1件

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
