#!/bin/bash
set -e

SUMMARY=$(python3 -c "
import json, urllib.request, os
from datetime import datetime

engineer = os.environ.get('ENGINEER_REPORT', '報告なし')
marketing = os.environ.get('MARKETING_REPORT', '報告なし')
sales = os.environ.get('SALES_REPORT', '報告なし')
ceo = os.environ.get('CEO_REPORT', '報告なし')
legal = os.environ.get('LEGAL_REPORT', '報告なし')
ux = os.environ.get('UX_REPORT', '報告なし')
seo = os.environ.get('SEO_REPORT', '報告なし')
cs = os.environ.get('CS_REPORT', '報告なし')
analyst = os.environ.get('ANALYST_REPORT', '報告なし')

prompt = f'''あなたは専属秘書です。以下の各部門報告をまとめてください。

【エンジニア】{engineer}
【マーケティング】{marketing}
【営業】{sales}
【CEO】{ceo}
【法務】{legal}
【UX】{ux}
【SEO・GEO】{seo}
【カスタマーサクセス】{cs}
【データアナリスト】{analyst}

Slack用デイリーサマリーを以下形式で作成：
- 今日の最重要アクション3件
- 各部門ステータス（1行ずつ）
- オーナーへの確認事項（あれば）'''

payload = json.dumps({
  'model': 'claude-opus-4-8',
  'max_tokens': 800,
  'messages': [{'role': 'user', 'content': prompt}]
}).encode()

req = urllib.request.Request(
  'https://api.anthropic.com/v1/messages',
  data=payload,
  headers={
    'x-api-key': os.environ['ANTHROPIC_API_KEY'],
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  }
)
res = json.loads(urllib.request.urlopen(req).read())
print(res['content'][0]['text'])
")

DATE=$(date '+%Y/%m/%d %H:%M JST')
python3 -c "
import json, urllib.request, os, sys

summary = sys.stdin.read()
text = f'*📊 freelance-contract-checker デイリーレポート*\n$DATE\n\n{summary}'
payload = json.dumps({'text': text}).encode()

req = urllib.request.Request(
  os.environ['SLACK_WEBHOOK'],
  data=payload,
  headers={'content-type': 'application/json'}
)
urllib.request.urlopen(req)
" <<< "$SUMMARY"

echo "$SUMMARY"
