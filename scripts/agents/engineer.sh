#!/bin/bash
set -e

PROMPT="あなたはfreelance-contract-checkerのシニアWebエンジニアです。
Vercelデプロイ状態: ${DEPLOY_STATUS}
エラーログ: ${ERROR_LOGS}

以下を実行せよ：
1. デプロイ状態の評価（READY以外なら原因と対処法）
2. パフォーマンス改善の優先タスク1件を具体的に提案
3. 200字以内で報告"

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\":\"claude-opus-4-8\",\"max_tokens\":500,\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
