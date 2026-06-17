#!/bin/bash
set -e

TODAY=$(date '+%Y-%m-%d')

PROMPT="あなたはfreelance-contract-checkerのマーケティング担当です。
今日: $TODAY
サービス: フリーランスの契約書リスク診断ツール

以下を実行せよ：
1. 今日投稿するXの投稿文3本（各140字以内、ハッシュタグ付き）
2. ターゲット: フリーランサー・副業ワーカー
3. 各投稿末尾に診断ツールへの誘導を含める
フォーマット: [投稿1]〜[投稿3]で出力"

RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\":\"claude-opus-4-8\",\"max_tokens\":1000,\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}]}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['text'])")

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
