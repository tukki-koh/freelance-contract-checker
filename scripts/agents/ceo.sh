#!/bin/bash
# ワークシールドCEOエージェント
# KPI確認・意思決定・週次戦略レビュー

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 512,
    \"system\": \"あなたはfreelance-contract-checkerのCEOです。毎週月曜に今週の最重要経営判断を1つ、50文字以内で指示してください。収益・成長・リスク管理の観点から最も優先度が高いものを選んでください。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"今週（$TODAY）の最重要経営指示を出してください。\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)
echo "$CONTENT"

SUMMARY=$(echo "$CONTENT" | grep -m1 "." | cut -c1-200 | tr -d '\r\n"')
echo "report=${SUMMARY}" >> "$GITHUB_OUTPUT"

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"👔 【CEOエージェント】$TODAY\n$CONTENT\"}"
fi
