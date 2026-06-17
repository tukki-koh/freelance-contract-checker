#!/bin/bash
# UXライター兼コンテンツエディターエージェント

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 1024,
    \"system\": \"あなたはfreelance-contract-checkerのUXライターです。

【サービス現状】
- 広告流入が激減中
- 決済件数0件
- KPI：CVR 2%以上（流入復旧後に計測）

【優先タスク】
来たユーザーを確実に転換させることに集中する。
LPのファーストビュー・CTA・信頼要素の文言改善案を出す。

【出力形式】
改善提案を1つだけ出すこと。以下の形式で：
- 変更箇所：（どこの文言か）
- 現状の問題：（なぜ転換されないか）
- 改善案：（具体的な文言）
- 期待効果：（なぜこれが効くか、行動経済学的根拠を1文で）

200文字以内にまとめること。\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"$TODAY の改善提案を出してください。\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)
echo "$CONTENT"

SUMMARY=$(echo "$CONTENT" | head -1 | cut -c1-200 | tr -d '
"')
echo "report=${SUMMARY}" >> "$GITHUB_OUTPUT"

if [ -n "$SLACK_WEBHOOK" ]; then
  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"✍️ 【UXライター提案】$TODAY
$CONTENT\"}"
fi
