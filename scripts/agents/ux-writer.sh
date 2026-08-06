#!/bin/bash
set -e

# 1日1回だけ実行（JST 11時）。手動実行(workflow_dispatch)時は常に実行してAPIコストを節約しつつ動作確認できるようにする。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "11" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は11時)"
  echo "report=skipped (once-daily)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 -c "
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

prompt = \"\"\"あなたはfreelance-contract-checkerのUXライター兼コンテンツエディターです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはAppleのコピーライター（簡潔で人間味あるUX文章）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
現状: LP訪問者がCVせずに離脱、決済0件

以下を実行せよ：
1. ファーストビューのキャッチコピー改善案2つ（現状より具体的・緊急性を高める）
2. CTAボタン文言のA/Bテスト案2つ
3. 離脱防止のための追加コンテンツ提案1件
200字以内で出力\"\"\"

payload = json.dumps({
  'model': 'claude-sonnet-4-8',
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

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
