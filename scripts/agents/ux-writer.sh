#!/bin/bash
# UXライター兼コンテンツエディターエージェント
# SEOコンテンツ生成・UI文言改善提案

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 512,
    \"system\": \"あなたはfreelance-contract-checkerのUXライター兼コンテンツエディターです。フリーランサーが契約書チェックサービスを使いたくなるUI文言またはSEOキーワードを1つ提案してください。50文字以内で。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"今週（$TODAY）のコンテンツ改善提案を1つ出してください。\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)
echo "$CONTENT"

SUMMARY=$(echo "$CONTENT" | grep -m1 "." | cut -c1-200 | tr -d '\r\n"')
echo "report=${SUMMARY}" >> "$GITHUB_OUTPUT"

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"✍️ 【UXライターエージェント】$TODAY\n$CONTENT\"}"
fi
