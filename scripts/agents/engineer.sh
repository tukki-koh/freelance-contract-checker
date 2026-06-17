#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os

prompt = f\"\"\"あなたはfreelance-contract-checkerのシニアWebエンジニアです。
Vercelデプロイ状態: {os.environ.get('DEPLOY_STATUS','不明')}
エラーログ: {os.environ.get('ERROR_LOGS','なし')}

以下を実行せよ：
1. デプロイ状態の評価（READY以外なら原因と対処法）
2. パフォーマンス改善の優先タスク1件を具体的に提案
3. 200字以内で報告\"\"\"

payload = json.dumps({
  'model': 'claude-opus-4-8',
  'max_tokens': 500,
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
