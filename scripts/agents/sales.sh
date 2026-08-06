#!/bin/bash
set -e

# 平日のみ実行（JST）
JST_DOW=$(TZ=Asia/Tokyo date '+%u')  # 1=月, 7=日
if [ "$JST_DOW" -ge 6 ]; then
  echo "週末のためスキップ (DOW=$JST_DOW)"
  echo "report=skipped (weekend)" >> $GITHUB_OUTPUT
  exit 0
fi

# 1日1回だけ実行（JST 10時）。手動実行時は常に実行。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
if [ "$JST_HOUR" != "10" ] && [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
  echo "本日の実行済み枠外のためスキップ (JST ${JST_HOUR}時、稼働は10時)"
  echo "report=skipped (once-daily)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 << 'PYEOF'
import json, urllib.request, os, smtplib

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
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_ADDRESS = os.environ.get("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
SUPA_URL = os.environ.get("AGENT_SUPABASE_URL", "").rstrip("/")
SUPA_ANON = os.environ.get("AGENT_SUPABASE_ANON_KEY", "")
LOG_TOKEN = os.environ.get("AGENT_LOG_TOKEN", "")
DAILY_CAP = 5           # 1日の送信上限（平日）
CANDIDATES = 8          # Claudeに出させる候補数（重複除外の余裕分）
today = date.today()

# --- 送信権を原子的に取得（未送信 かつ 本日上限未満なら true）---
def claim_email(email, org, subject):
    if not (SUPA_URL and SUPA_ANON and LOG_TOKEN):
        return False
    payload = json.dumps({
        "p_token": LOG_TOKEN, "p_email": email,
        "p_org": org, "p_subject": subject, "p_daily_cap": DAILY_CAP,
    }).encode()
    req = urllib.request.Request(
        f"{SUPA_URL}/rest/v1/rpc/claim_sales_email", data=payload,
        headers={"apikey": SUPA_ANON, "Authorization": f"Bearer {SUPA_ANON}", "Content-Type": "application/json"},
    )
    try:
        return json.loads(urllib.request.urlopen(req, timeout=10).read()) is True
    except Exception as e:
        print(f"[claim失敗] {e}")
        return False

# --- Claude に複数の営業ターゲットを生成させる ---
prompt = f"""あなたはfreelance-contract-checkerの営業担当です。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはSalesforceのトップセールス（価値提案と関係構築の達人）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {today}
サービス: フリーランスの契約書リスク診断ツール（フリーランス新法・下請法の違反をAI診断。単発300円/月額980円）
現状: 認知拡大フェーズ

フリーランス支援に関わる実在の団体・企業・エージェンシー・士業事務所を{CANDIDATES}件挙げ、
それぞれに送る営業メールを作成せよ。各社バラバラの相手にする（重複させない）。

条件：
- 公開されている一般問い合わせ先メール（info@ / contact@ 等）のみ。個人アドレスは不可。
- 本文は200字以内、フリーランス支援の文脈で自然に紹介。押しつけがましくしない。
- 特定電子メール法に配慮し、末尾に「不要の場合は本メールへの返信で配信停止できます」を入れる。
- 署名: ワークシールド営業部 / https://freelance-contract-checker.vercel.app

各件を以下の形式で厳密に出力（{CANDIDATES}件分くり返す）：
===
ORG: 組織名
EMAIL: xxx@example.com
SUBJECT: 件名（40字以内）
BODY:
本文（複数行可）
END
"""

payload = json.dumps({
  "model": "claude-sonnet-4-8",
  "max_tokens": 3000,
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())
output = res["content"][0]["text"]

# --- パース ---
def parse_blocks(text):
    blocks, cur, body_mode, body = [], {}, False, []
    for line in text.splitlines():
        s = line.strip()
        if s == "===":
            if cur.get("email"):
                cur["body"] = "\n".join(body).strip(); blocks.append(cur)
            cur, body_mode, body = {}, False, []
        elif s.startswith("ORG:"): cur["org"] = s[4:].strip()
        elif s.startswith("EMAIL:"): cur["email"] = s[6:].strip()
        elif s.startswith("SUBJECT:"): cur["subject"] = s[8:].strip()
        elif s == "BODY:": body_mode = True
        elif s == "END":
            cur["body"] = "\n".join(body).strip(); body_mode = False
            if cur.get("email"): blocks.append(cur)
            cur, body = {}, []
        elif body_mode: body.append(line)
    if cur.get("email") and "body" in cur and cur not in blocks: blocks.append(cur)
    return blocks

targets = parse_blocks(output)

# --- 上限まで送信（重複・上限はDB側で原子的に判定）---
sent = []
for t in targets:
    email = (t.get("email") or "").strip()
    subject = (t.get("subject") or "").strip()
    body = (t.get("body") or "").strip()
    org = (t.get("org") or "").strip()
    if not (email and subject and body): continue
    if not (GMAIL_ADDRESS and GMAIL_APP_PASSWORD):
        print("[Gmail未設定のため送信スキップ]"); break
    if not claim_email(email, org, subject):
        continue  # 送信済み or 本日上限到達
    try:
        msg = MIMEMultipart()
        msg["From"] = GMAIL_ADDRESS; msg["To"] = email; msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_ADDRESS, email, msg.as_string())
        sent.append(f"{org or email} <{email}>")
        print(f"[送信完了] {org} <{email}> / {subject}")
    except Exception as e:
        print(f"[送信エラー] {email}: {e}")

print(f"\n本日この実行での送信: {len(sent)}件 / 1日上限{DAILY_CAP}件")
for s in sent: print(" -", s)
if not sent:
    print("（本日の上限到達、または新規ターゲットなし）")
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
