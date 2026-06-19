#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerのマーケティング担当です。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール
ターゲット: フリーランサー・副業ワーカー

毎回必ず以下をすべて実行せよ：

【1. トレンド分析】
- フリーランス・副業・契約トラブルに関する今週の注目トピック2件
- それぞれの集客への活用方法を1行で添える

【2. データ収集・競合分析】
- 類似サービスや関連キーワードの動向で気づいた点1件
- 当サービスの差別化ポイントを1行で再確認

【3. 集客施策】
- 今日投稿するXの投稿文3本（各140字以内、ハッシュタグ付き、診断ツールへの誘導含む）
- 今週試すべき新規集客アクション1件（具体的な方法まで）

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
