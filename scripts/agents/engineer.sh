#!/bin/bash
# シニアWebエンジニア エージェント
# Vercelのエラー監視 & 修正提案

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-sonnet-4-6\",
    \"max_tokens\": 2048,
    \"system\": \"あなたはfreelance-contract-checker（Next.js/Vercel/Supabase/Stripe）のシニアWebエンジニアです。報告された情報をもとに、売上に直結するバグや障害を最優先で特定し、修正方針を簡潔に出力してください。問題がなければ '異常なし' とだけ出力してください。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"定期ヘルスチェック実行。Vercelデプロイ状況: $DEPLOY_STATUS。直近エラーログ: $ERROR_LOGS\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)
echo "$CONTENT"

# GitHub Actionsのoutput（1行サマリーのみ）
SUMMARY=$(echo "$CONTENT" | grep -m1 "." | cut -c1-200 | tr -d '\r\n"')
echo "report=${SUMMARY}" >> "$GITHUB_OUTPUT"

# 異常があればSlack通知
if [ "$CONTENT" != "異常なし" ] && [ -n "$SLACK_WEBHOOK" ]; then
  SLACK_TEXT=$(echo "$CONTENT" | head -5)
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"🔴 【エンジニアエージェント】\n$SLACK_TEXT\"}"
fi
