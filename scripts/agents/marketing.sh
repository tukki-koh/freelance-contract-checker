#!/bin/bash
# マーケティング担当エージェント
# 毎朝の施策チェック & SEOコンテンツ提案

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 1024,
    \"system\": \"あなたはfreelance-contract-checkerのマーケティング担当です。フリーランサー向け契約書チェックサービスのCVR向上と集客を担当します。今日実行すべき最重要施策を1つだけ、50文字以内で提案してください。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"今日（$TODAY）のマーケティング施策を提案してください。\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"📣 【マーケティングエージェント】$TODAY\n$CONTENT\"}"
fi
