#!/bin/bash
set -e

# 1日1回だけ実行（JST 10時）。手動実行(workflow_dispatch)時は常に実行してAPIコストを節約しつつ動作確認できるようにする。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "10" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は10時)"
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
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerのSEO・GEOスペシャリストです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはAhrefsやBacklinkoのSEO権威（良質コンテンツと被リンク設計）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール
ターゲットキーワード: フリーランス 契約書、業務委託 リスク、契約トラブル 防ぐ 等

365日24時間、常に以下をすべて実行せよ：

【1. SEO施策】
- 今週狙うべき検索キーワード2件（検索ボリューム・競合度の観点から）
- 各キーワードで上位表示するためのコンテンツ提案（タイトル・構成・内部リンク）
- 現在のLPで改善すべきSEO技術要素1件（メタ・構造化データ・スピード等）

【2. GEO施策（生成AIへの最適化）】
- ChatGPT・Perplexity・Gemini等で「フリーランス 契約書 診断」と検索されたとき上位に出るための対策1件
- サービスが引用されやすくなるコンテンツ・FAQ追加案1件

【3. コンテンツSEO】
- 今週作成すべきブログ・記事のタイトルと概要1件（ロングテールキーワード狙い）
- 被リンク獲得のためのアプローチ先1件（メディア・ブログ等）

フォーマット: 各セクションを【1】【2】【3】で区切って出力\"\"\"

payload = json.dumps({
  'model': 'claude-sonnet-5',
  'max_tokens': 1500,
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
