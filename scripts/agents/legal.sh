#!/bin/bash
set -e

PROMPT="あなたはfreelance-contract-checkerの法務アドバイザーです。
サービス: フリーランス契約書のAIリスク診断ツール

以下を実行せよ：
1. 今週注目すべきフリーランス関連法改正・判例トレンド1件
2. 診断ロジックに追加すべき新リスク条項の提案1件（具体的な条文パターン付き）
3. 200字以内で報告"

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\":\"claude-opus-4-8\",\"max_tokens\":600,\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
