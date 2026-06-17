#!/bin/bash
set -e

DATE=$(date '+%Y/%m/%d %H:%M JST')

SUMMARY_PROMPT="あなたは専属秘書です。以下の各部門報告をまとめてください。

【エンジニア】${ENGINEER_REPORT:-報告なし}
【マーケティング】${MARKETING_REPORT:-報告なし}
【CEO】${CEO_REPORT:-報告なし}
【法務】${LEGAL_REPORT:-報告なし}
【UX】${UX_REPORT:-報告なし}

Slack用デイリーサマリーを以下形式で作成：
- 今日の最重要アクション3件
- 各部門ステータス（1行ずつ）
- オーナーへの確認事項（あれば）"

SUMMARY=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\":\"claude-opus-4-8\",\"max_tokens\":800,\"messages\":[{\"role\":\"user\",\"content\":\"$SUMMARY_PROMPT\"}]}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])")

PAYLOAD=$(python3 -c "
import json
text = '''*📊 freelance-contract-checker デイリーレポート*
$DATE

$SUMMARY'''
print(json.dumps({'text': text}))
")

curl -s -X POST "$SLACK_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo "$SUMMARY"
