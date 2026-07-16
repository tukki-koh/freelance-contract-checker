#!/bin/bash
set -e

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

prompt = f\"\"\"あなたはfreelance-contract-checkerのマーケティング担当です。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはHubSpotのインバウンドマーケティングの第一人者のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {date.today()}
サービス: フリーランスの契約書リスク診断ツール
ターゲット: フリーランサー・副業ワーカー

毎回必ず以下をすべて実行せよ：

【1. トレンド分析】
- フリーランス・副業・契約トラブルに関する今週の注目トピック2件
- それぞれの集客への活用方法を1行で添える

【2. データ収集・競合分析】
- 類似サービスや関連キーワードの動向で気づいた点1件
- 当サービスの差別化ポイントを1行で再確認

【3. 集客施策】
- 今週試すべき新規集客アクション1件（X以外、具体的な方法まで）

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
res = json.loads(_urlopen_with_retry(req).read())
print(res['content'][0]['text'])
")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
