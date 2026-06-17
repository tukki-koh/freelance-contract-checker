#!/bin/bash
# 専属秘書 兼 進行管理エージェント
# 各エージェントの結果を集約してデイリーサマリーを作成

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 1024,
    \"system\": \"あなたはfreelance-contract-checkerの専属秘書です。各エージェントの報告を受け取り、CEOが朝一番に読むべき優先事項を3点以内にまとめてください。箇条書きで簡潔に。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"デイリーサマリー作成。エンジニア報告: $ENGINEER_REPORT。マーケ報告: $MARKETING_REPORT。日付: $TODAY\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"📋 【秘書エージェント・デイリーサマリー】$TODAY\n$CONTENT\"}"
fi
