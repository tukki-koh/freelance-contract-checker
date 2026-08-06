#!/bin/bash
set -e

# JST時間確認（UTC+9）、5時以外はSlack送信スキップ
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "05" ] && [ "${FORCE_REPORT:-}" != "true" ]; then
  echo "Slack report skipped (JST $JST_HOUR:00, runs only at 05:00)"
  echo "report=skipped" >> $GITHUB_OUTPUT
  exit 0
fi

SUMMARY=$(python3 -c "
import json, urllib.request, os

def _urlopen_with_retry(req, tries=4, base_delay=3):
    import time, urllib.error
    for i in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=60)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 529) and i < tries - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise
        except urllib.error.URLError:
            if i < tries - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise

engineer = os.environ.get('ENGINEER_REPORT', '報告なし')
marketing = os.environ.get('MARKETING_REPORT', '報告なし')
sales = os.environ.get('SALES_REPORT', '報告なし')
sales_webform = os.environ.get('SALES_WEBFORM_REPORT', '報告なし')
ceo = os.environ.get('CEO_REPORT', '報告なし')
legal = os.environ.get('LEGAL_REPORT', '報告なし')
ux = os.environ.get('UX_REPORT', '報告なし')
seo = os.environ.get('SEO_REPORT', '報告なし')
cs = os.environ.get('CS_REPORT', '報告なし')
analyst = os.environ.get('ANALYST_REPORT', '報告なし')
pm = os.environ.get('PM_REPORT', '報告なし')
finance = os.environ.get('FINANCE_REPORT', '報告なし')
pr = os.environ.get('PR_REPORT', '報告なし')
competitor = os.environ.get('COMPETITOR_REPORT', '報告なし')
googleads = os.environ.get('GOOGLEADS_REPORT', '報告なし')

prompt = f'''あなたは専属秘書です。以下の各部門の昨日の活動を朝5時の日次報告としてまとめてください。

エンジニア: {engineer}
マーケティング: {marketing}
営業: {sales}
営業(Webフォーム): {sales_webform}
CEO: {ceo}
法務: {legal}
UX: {ux}
SEO・GEO: {seo}
カスタマーサクセス: {cs}
データアナリスト: {analyst}
プロダクトマネージャー: {pm}
財務・経理: {finance}
広報・PR: {pr}
競合リサーチ: {competitor}
Google広告最適化: {googleads}

以下のルールで出力せよ：
- 記号（*、#、【】、---等）は一切使わない
- 箇条書きは「・」のみ使用
- 各部門は1行以内
- 最後に「オーナーへ」として今日中にやるべきことを3件以内で端的に記載
- 重要な部門を優先し、全体320字以内に収める（動きのない部門は省略可）
- 余計な挨拶・前置き・締めの言葉は不要'''

payload = json.dumps({
  'model': 'claude-sonnet-5',
  'max_tokens': 600,
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
res = json.loads(_urlopen_with_retry(req).read())
print(res['content'][0]['text'])
")

DATE=$(TZ=Asia/Tokyo date '+%Y/%m/%d 朝5時レポート')
python3 -c "
import json, urllib.request, os, sys

def _urlopen_with_retry(req, tries=4, base_delay=3):
    import time, urllib.error
    for i in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=60)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 529) and i < tries - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise
        except urllib.error.URLError:
            if i < tries - 1:
                time.sleep(base_delay * (2 ** i))
                continue
            raise

summary = sys.stdin.read()
text = f'$DATE\n\n{summary}'
payload = json.dumps({'text': text}).encode()

req = urllib.request.Request(
  os.environ['SLACK_WEBHOOK'],
  data=payload,
  headers={'content-type': 'application/json'}
)
_urlopen_with_retry(req)
" <<< "$SUMMARY"

echo "$SUMMARY"
