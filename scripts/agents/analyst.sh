#!/bin/bash
set -e

RESPONSE=$(python3 -c "
import json, urllib.request, os
from datetime import date

prompt = f\"\"\"あなたはfreelance-contract-checkerのデータアナリストです。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール
現状データ: Google広告クリック激減（5月ピーク比95%減）、売上¥0、CVR不明

365日24時間、毎回以下をすべて実行せよ：

【1. ボトルネック分析】
- 現状の数値から最も深刻なボトルネックを特定し優先順位をつけよ
- 各部門（マーケ・営業・UX・SEO・CS）が今週計測すべきKPI1件ずつ

【2. 施策効果予測】
- 現在実行中の施策のうち最もROIが高いと予測されるもの1件（理由付き）
- 逆に即刻停止・見直すべき施策1件（理由付き）

【3. CEOへの意思決定データ】
- 今週最も重要な経営判断1件と推奨アクション
- 来週の売上予測（現状維持・施策実行・最悪ケースの3シナリオ）

フォーマット: 各セクションを【1】【2】【3】で区切って出力\"\"\"

payload = json.dumps({
  'model': 'claude-opus-4-8',
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
res = json.loads(urllib.request.urlopen(req).read())
print(res['content'][0]['text'])
")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
