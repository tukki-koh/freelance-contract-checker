#!/bin/bash
set -e

# 平日のみ実行（JST）
JST_DOW=$(TZ=Asia/Tokyo date '+%u')  # 1=月, 7=日
if [ "$JST_DOW" -ge 6 ]; then
  echo "週末のためスキップ (DOW=$JST_DOW)"
  echo "report=skipped (weekend)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 << 'PYEOF'
import json, urllib.request, os

def _urlopen_with_retry(req, tries=4, base_delay=3):
    import time, urllib.error
    for i in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=90)
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

SUPA_URL = os.environ.get("AGENT_SUPABASE_URL", "").rstrip("/")
SUPA_ANON = os.environ.get("AGENT_SUPABASE_ANON_KEY", "")
LOG_TOKEN = os.environ.get("AGENT_LOG_TOKEN", "")
DAILY_CAP = 10          # 1日にキューへ積む上限（平日）。送信自体は行わない
today = date.today()

# --- キュー投入を試みる（重複URLはfalse。送信は一切行わない）---
def queue_lead(org, url, subject, body):
    if not (SUPA_URL and SUPA_ANON and LOG_TOKEN):
        return False
    payload = json.dumps({
        "p_token": LOG_TOKEN, "p_org": org, "p_contact_url": url,
        "p_subject": subject, "p_body": body,
    }).encode()
    req = urllib.request.Request(
        f"{SUPA_URL}/rest/v1/rpc/queue_webform_lead", data=payload,
        headers={"apikey": SUPA_ANON, "Authorization": f"Bearer {SUPA_ANON}", "Content-Type": "application/json"},
    )
    try:
        return json.loads(urllib.request.urlopen(req, timeout=10).read()) is True
    except Exception as e:
        print(f"[queue失敗] {e}")
        return False

# --- Claude(Web検索ツール利用)に「実在確認済み」の問い合わせフォームURLを調べさせる ---
# URLを推測させず、必ずWeb検索で実際に見つけたページのみを対象にする。
prompt = f"""あなたはfreelance-contract-checkerの営業担当（Webフォーム経由チャネル）です。
今日: {today}
サービス: フリーランスの契約書リスク診断ツール（フリーランス新法・下請法の違反をAI診断。単発300円/月額980円）

Web検索ツールを使って、フリーランス支援に関わる実在の団体・エージェンシー・士業事務所を探し、
その中から「公開の問い合わせメールアドレスが見当たらず、Webサイト上に問い合わせフォームがある」組織を最大10件見つけよ。

厳守事項：
- 必ずWeb検索で実際にヒットしたページのURLのみを使うこと。URLを推測・創作してはならない。
- 検索で実在を確認できなかった組織は候補に含めない。確信が持てなければスキップする。
- 各社バラバラの相手にする（重複させない）。

見つかった組織ごとに、フォームへ入力する想定の件名・本文を作成せよ。
- 本文は200字以内、フリーランス支援の文脈で自然に紹介。押しつけがましくしない。
- 署名: ワークシールド営業部 / https://freelance-contract-checker.vercel.app

最終回答は、検索で確認できた組織についてのみ、以下の形式で厳密に出力せよ（該当件数分くり返す。前置きや説明文は一切不要）：
===
ORG: 組織名
URL: https://実際に検索で見つけたURL
SUBJECT: 件名（40字以内）
BODY:
本文（複数行可）
END
"""

payload = json.dumps({
  "model": "claude-opus-4-8",
  "max_tokens": 4000,
  "tools": [{"type": "web_search_20250305", "name": "web_search", "max_uses": 10}],
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())

# web_search使用時はcontentに複数ブロック（tool_use/tool_result/text）が混在するため、text型のみ連結
output = "".join(
    block.get("text", "") for block in res.get("content", []) if block.get("type") == "text"
)

# --- パース ---
def parse_blocks(text):
    blocks, cur, body_mode, body = [], {}, False, []
    for line in text.splitlines():
        s = line.strip()
        if s == "===":
            if cur.get("url"):
                cur["body"] = "\n".join(body).strip(); blocks.append(cur)
            cur, body_mode, body = {}, False, []
        elif s.startswith("ORG:"): cur["org"] = s[4:].strip()
        elif s.startswith("URL:"): cur["url"] = s[4:].strip()
        elif s.startswith("SUBJECT:"): cur["subject"] = s[8:].strip()
        elif s == "BODY:": body_mode = True
        elif s == "END":
            cur["body"] = "\n".join(body).strip(); body_mode = False
            if cur.get("url"): blocks.append(cur)
            cur, body = {}, []
        elif body_mode: body.append(line)
    if cur.get("url") and "body" in cur and cur not in blocks: blocks.append(cur)
    return blocks

print("===RAW OUTPUT START===");print(output[:3500]);print("===RAW OUTPUT END===")
targets = parse_blocks(output)

# --- 上限までキュー投入（送信は絶対に行わない。人間がダッシュボードで最終送信する）---
queued = []
for t in targets:
    if len(queued) >= DAILY_CAP:
        break
    org = (t.get("org") or "").strip()
    url = (t.get("url") or "").strip()
    subject = (t.get("subject") or "").strip()
    body = (t.get("body") or "").strip()
    if not (org and url and subject and body):
        continue
    if not url.startswith("http"):
        continue
    if queue_lead(org, url, subject, body):
        queued.append(f"{org} ({url})")
        print(f"[キュー投入] {org} / {url}")

print(f"\n本日この実行でのキュー投入: {len(queued)}件 / 上限{DAILY_CAP}件")
for q in queued: print(" -", q)
if not queued:
    print("（Web検索で条件に合う実在組織が見つからなかった、または全て既存キューと重複）")
print("\n※ 実際の送信は行っていません。ダッシュボードで内容を確認し、手動でフォーム送信してください。")
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
