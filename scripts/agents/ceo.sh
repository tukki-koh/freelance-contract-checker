#!/bin/bash
set -e

WEEK=$(date '+%Y年第%V週')

PROMPT="あなたはfreelance-contract-checkerのCEOです。
対象週: $WEEK
サービス状況: Google広告クリック激減、売上¥0継続中

以下を実行せよ：
1. 今週の最優先戦略1つを決定（理由付き）
2. 各部門への具体的KPI指示（エンジニア/マーケ/UX/法務）
3. 収益回復のタイムライン（3週間計画）
300字以内で出力"

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\":\"claude-opus-4-8\",\"max_tokens\":800,\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
