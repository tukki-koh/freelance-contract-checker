#!/bin/bash
set -e

# 1日1回だけ実行（JST 15時）。手動実行(workflow_dispatch)時は常に実行してAPIコストを節約しつつ動作確認できるようにする。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "15" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は15時)"
  echo "report=skipped (once-daily)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 << 'PYEOF'
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

prompt = f"""あなたはfreelance-contract-checkerのプロダクトマネージャーです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはStripeやLinearのプロダクトマネージャー（規律ある優先順位付け）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {date.today()}
サービス: フリーランス新法・下請法の契約書リスクをAI診断するSaaS（単発300円/月額980円）
現状: 認知拡大フェーズ、売上小規模

長期的なプロダクト価値最大化の観点から、毎回以下を実行せよ：

【1. 次に作るべき機能の優先順位】
- ユーザー価値×実装容易性で最も優先すべき機能1件（理由付き）
- その機能がリテンション/CVRのどちらにどう効くか

【2. エンジニアへの開発指示】
- 上記機能をエンジニアが着手できる粒度に分解（1〜3タスク）

【3. ロードマップ視点】
- 今月・来月・再来月で狙う山を各1行

200〜400字程度、要点のみ。フォーマットは【1】【2】【3】で区切る。"""

payload = json.dumps({
  "model": "claude-sonnet-5", "max_tokens": 1200,
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())
_text_blocks = [b.get("text","") for b in res.get("content",[]) if b.get("type") == "text"]
print("".join(_text_blocks))
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
