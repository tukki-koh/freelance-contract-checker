#!/bin/bash
set -e

# 1日1回だけ実行（JST 9時）。手動実行(workflow_dispatch)時は常に実行。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "09" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は09時)"
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

prompt = f"""あなたはfreelance-contract-checkerのGoogle広告 最適化担当です。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはGoogle広告の最適化スコアを極める最上位スペシャリストのように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {date.today()}

【アカウント状況】
- サービス: フリーランス新法・下請法の契約書リスクをAI診断するSaaS（単発300円/月額980円）
- ランディングページ: https://freelance-contract-checker.vercel.app （LP刷新・信頼設計済み）
- コンバージョンID: Google Ads AW-18161193215 / GA4 G-F5FHXJB30N
- 既知の課題: 過去にクリック数が約95%激減、売上ほぼ¥0、費用対効果が悪い

目的: Google広告の「最適化スコア」を継続的に引き上げること。
最適化スコアは主に次の要素で決まる: 推奨事項(Recommendations)の適用、キーワード、入札、広告アセット(RSA)、予算、品質スコア(LP関連性)、コンバージョン計測。

毎回、以下を実行せよ（オーナーがGoogle Ads管理画面で即適用できる粒度で）：

【1. 今日適用すべき最優先アクション3件】
- 各アクションについて「対象要素 / 具体的な変更内容 / 期待効果(スコアやCV)」を1行で
- 推奨事項の自動適用候補があれば明示

【2. キーワード＆除外キーワード】
- 追加すべき高意図キーワード3語（例: 「フリーランス 契約書 チェック」等）
- 無駄クリックを防ぐ除外キーワード2語

【3. 広告文(RSA)改善】
- 見出し案2つ・説明文案1つ（LP刷新後の訴求「300円/30秒/条文番号付き」を反映）

【4. 品質スコア/LP関連性】
- 品質スコアを上げるためのLPとの一致改善1点

【5. 今週の最重要判断】
- 最適化スコアを最も押し上げる意思決定1件

出力は簡潔に。各セクション【1】〜【5】で区切り、実行可能な具体策のみ。抽象論は不要。"""

payload = json.dumps({
  "model": "claude-sonnet-4-8", "max_tokens": 1500,
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())
print(res["content"][0]["text"])
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
