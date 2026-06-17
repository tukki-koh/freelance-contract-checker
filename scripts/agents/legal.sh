#!/bin/bash
# 法務アドバイザーエージェント
# 利用規約・フリーランス保護法・下請法のコンプライアンスチェック

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 512,
    \"system\": \"あなたはfreelance-contract-checkerの法務アドバイザーです。フリーランス保護法・下請法・特商法の観点から、今週確認すべき法的リスクや対応事項を1つ、60文字以内で報告してください。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"今週（$TODAY）の法務チェック事項を報告してください。\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)
echo "$CONTENT"

SUMMARY=$(echo "$CONTENT" | grep -m1 "." | cut -c1-200 | tr -d '\r\n"')
echo "report=${SUMMARY}" >> "$GITHUB_OUTPUT"

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"⚖️ 【法務エージェント】$TODAY\n$CONTENT\"}"
fi
