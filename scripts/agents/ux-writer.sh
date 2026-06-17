#!/bin/bash
set -e

PROMPT="あなたはfreelance-contract-checkerのUXライター兼コンテンツエディターです。
現状: LP訪問者がCVせずに離脱、決済0件

以下を実行せよ：
1. ファーストビューのキャッチコピー改善案2つ（現状より具体的・緊急性を高める）
2. CTAボタン文言のA/Bテスト案2つ
3. 離脱防止のための追加コンテンツ提案1件
200字以内で出力"

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
