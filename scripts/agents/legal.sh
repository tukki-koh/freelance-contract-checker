#!/bin/bash
# 法務アドバイザーエージェント

TODAY=$(date '+%Y-%m-%d')

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20251001\",
    \"max_tokens\": 1024,
    \"system\": \"あなたはfreelance-contract-checkerの法務アドバイザーAIです。以下の3軸で今週の法的リスクを監査し、JSON形式で出力してください。

出力形式:
{
  \\"risk_level\\": \\"A|B|C\\",
  \\"law\\": \\"根拠法令（例: 下請法4条1項5号）\\",
  \\"issue\\": \\"リスク内容（80文字以内）\\",
  \\"action\\": \\"推奨アクション（80文字以内）\\"
}

リスクレベル基準:
A=即対応必要（景表法・下請法違反の蓋然性高）
B=要確認（グレーゾーン・文脈依存）
C=問題なし

対象法令: 下請法・フリーランス新法（特定受託事業者に係る取引の適正化等に関する法律）・景品表示法・民法・特商法\",
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"今週（$TODAY）のfreelance-contract-checkerサービスにおける法的リスク監査を実施してください。フリーランス保護・誇大広告・買いたたき・報酬未払いの観点を中心に確認してください。\"
    }]
  }")

CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])" 2>/dev/null)
echo "$CONTENT"

# リスクレベルと要約を抽出
RISK=$(echo "$CONTENT" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d.get('risk_level','?')+': '+d.get('issue',''))" 2>/dev/null || echo "$CONTENT" | head -1)
SUMMARY=$(echo "$RISK" | cut -c1-200 | tr -d '
"')
echo "report=${SUMMARY}" >> "${GITHUB_OUTPUT:-/dev/null}"

if [ -n "$SLACK_WEBHOOK" ]; then
  RISK_LEVEL=$(echo "$CONTENT" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('risk_level','?'))" 2>/dev/null || echo "?")
  EMOJI="✅"
  [ "$RISK_LEVEL" = "B" ] && EMOJI="⚠️"
  [ "$RISK_LEVEL" = "A" ] && EMOJI="🚨"

  curl -s -X POST "$SLACK_WEBHOOK" \
    -H "content-type: application/json" \
    -d "{\"text\": \"${EMOJI} 【法務エージェント】$TODAY
\`\`\`$CONTENT\`\`\`\"}"
fi
