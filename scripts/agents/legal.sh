#!/bin/bash
set -e

# 1日1回だけ実行（JST 14時）。手動実行(workflow_dispatch)時は常に実行してAPIコストを節約しつつ動作確認できるようにする。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "14" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は14時)"
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

prompt = \"\"\"あなたはfreelance-contract-checkerの法務アドバイザーです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的には一流企業のインハウス法務（先回りのリスク管理）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
サービス: フリーランス契約書のAIリスク診断ツール

以下を実行せよ：
1. 今週注目すべきフリーランス関連法改正・判例トレンド1件
2. 診断ロジックに追加すべき新リスク条項の提案1件（具体的な条文パターン付き）
3. 200字以内で報告\"\"\"

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
_text_blocks = [b.get(\"text\",\"\") for b in res.get(\"content\",[]) if b.get(\"type\") == \"text\"]
print(\"\".join(_text_blocks))
")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
