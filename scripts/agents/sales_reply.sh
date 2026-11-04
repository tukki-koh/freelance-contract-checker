#!/bin/bash
set -e

# 営業メールへの返信を自動で処理する。
# 平日9時以降の最初の起動で1日1回（手動実行は常に実行）。
source "$(dirname "$0")/lib_gate.sh"
if ! daily_gate sales_reply 9 1; then
  echo "$GATE_REASON"
  echo "report=skipped (once-daily)" >> $GITHUB_OUTPUT
  exit 0
fi

RESPONSE=$(python3 << 'PYEOF'
import email, imaplib, json, os, re, smtplib, ssl, urllib.request
from email.header import decode_header, make_header
from email.mime.text import MIMEText
from email.utils import parseaddr

GMAIL = os.environ.get("GMAIL_ADDRESS", "")
GMAIL_PW = os.environ.get("GMAIL_APP_PASSWORD", "")
SUPA_URL = os.environ.get("AGENT_SUPABASE_URL", "").rstrip("/")
SUPA_ANON = os.environ.get("AGENT_SUPABASE_ANON_KEY", "")
LOG_TOKEN = os.environ.get("AGENT_LOG_TOKEN", "")
SLACK = os.environ.get("SLACK_WEBHOOK", "")
HDRS = {"apikey": SUPA_ANON, "Authorization": f"Bearer {SUPA_ANON}", "Content-Type": "application/json"}

if not (GMAIL and GMAIL_PW and SUPA_URL and SUPA_ANON):
    print("認証情報が不足しているため終了")
    raise SystemExit(0)


def rpc(name, payload):
    req = urllib.request.Request(f"{SUPA_URL}/rest/v1/rpc/{name}",
                                 data=json.dumps(payload).encode(), headers=HDRS)
    return json.loads(urllib.request.urlopen(req, timeout=20).read())


def notify(text):
    if not SLACK:
        return
    try:
        urllib.request.urlopen(urllib.request.Request(
            SLACK, data=json.dumps({"text": text}).encode(),
            headers={"Content-Type": "application/json"}), timeout=10)
    except Exception:
        pass


# --- こちらから営業した相手の一覧（返信かどうかの判定に使う）---
# anonキーでの直接SELECTはRLSで0件になるため、トークン付きRPCで取得する。
contacted = {r["email"].lower(): (r.get("org") or "")
             for r in (rpc("contacted_emails", {"p_token": LOG_TOKEN}) or [])}
if not contacted:
    print("営業済みの宛先を取得できませんでした（トークンまたはRPCを確認）")
    raise SystemExit(0)
contacted_domains = {e.split("@")[-1] for e in contacted}
processed = set(rpc("processed_reply_ids", {"p_token": LOG_TOKEN}) or [])
print(f"営業済み {len(contacted)}件 / 処理済みの返信 {len(processed)}件")


def decode(s):
    try:
        return str(make_header(decode_header(s or "")))
    except Exception:
        return s or ""


def body_of(msg):
    if msg.is_multipart():
        for p in msg.walk():
            if p.get_content_type() == "text/plain":
                try:
                    return p.get_payload(decode=True).decode(p.get_content_charset() or "utf-8", "ignore")
                except Exception:
                    continue
        return ""
    try:
        return msg.get_payload(decode=True).decode(msg.get_content_charset() or "utf-8", "ignore")
    except Exception:
        return ""


# --- 受信トレイから、営業先からの新着メールだけを拾う ---
imap = imaplib.IMAP4_SSL("imap.gmail.com")
imap.login(GMAIL, GMAIL_PW)
imap.select("INBOX")
_, data = imap.search(None, '(SINCE "01-Jan-2026")')
ids = data[0].split()[-300:]

candidates = []
for num in ids:
    _, d = imap.fetch(num, "(RFC822)")
    if not d or not isinstance(d[0], tuple):
        continue
    msg = email.message_from_bytes(d[0][1])
    mid = msg.get("Message-ID", "").strip()
    sender = parseaddr(msg.get("From", ""))[1].lower()
    if not mid or mid in processed:
        continue
    # 営業した本人、または同じ会社のドメインからの返信だけを対象にする
    if sender == GMAIL.lower():
        continue  # 自分宛・自分発のメールは対象外
    if sender not in contacted and sender.split("@")[-1] not in contacted_domains:
        continue
    candidates.append({
        "mid": mid, "from": sender, "org": contacted.get(sender, ""),
        "subject": decode(msg.get("Subject")), "body": body_of(msg)[:3000],
    })
imap.logout()

print(f"新しい返信: {len(candidates)}件")
if not candidates:
    print("返信はありませんでした")
    raise SystemExit(0)


# --- Claudeに分類と返信文の作成をさせる ---
def classify(c):
    prompt = f"""あなたはワークシールド（フリーランス向け契約書AI診断。無料診断 https://freelance-contract-checker.vercel.app/try ）の営業担当です。
こちらから「会員の方へ無料診断を紹介してもらえないか」という依頼メールを送り、相手から返信が来ました。

差出人: {c['from']}（{c['org']}）
件名: {c['subject']}
本文:
{c['body']}

この返信を次のいずれかに分類せよ。
- unsubscribe : 配信停止・今後送るなという意思表示
- decline     : 断り（興味がない、対応できない）
- interested  : 前向き。紹介を検討する、詳細を知りたい、資料がほしい等
- question    : 質問（料金、仕組み、安全性、提携条件など）
- auto        : 自動返信（不在通知、受付完了の自動メール）
- other       : 上記のいずれでもない

そのうえで、interested と question の場合のみ、相手にそのまま送れる返信本文を書け。
- 200字以内。敬体。宛名から始める。
- 相手の質問には具体的に答える。分からないことは推測せず「確認してご連絡します」と書く。
- 無料診断のURLを入れる。費用は一切かからないことを明記する。
- 署名は「ワークシールド　月足 昂誠 / https://freelance-contract-checker.vercel.app」
- 誇張・断定（必ず防げる、法的に保証される等）は書かない。

出力は次の形式のみ。説明は不要。
CATEGORY: <分類>
SUMMARY: <返信内容の要約を40字以内で>
REPLY:
<返信本文。interested/question以外のときは空にする>
"""
    payload = json.dumps({
        "model": "claude-sonnet-5", "max_tokens": 4000,
        "output_config": {"effort": "low"},
        "messages": [{"role": "user", "content": prompt}],
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages", data=payload,
        headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"],
                 "anthropic-version": "2023-06-01", "content-type": "application/json"})
    res = json.loads(urllib.request.urlopen(req, timeout=180).read())
    out = "".join(b.get("text", "") for b in res.get("content", []) if b.get("type") == "text")
    cat = (re.search(r"CATEGORY:\s*(\w+)", out) or [None, "other"])[1]
    summ = (re.search(r"SUMMARY:\s*(.+)", out) or [None, ""])[1].strip()
    reply = out.split("REPLY:", 1)[1].strip() if "REPLY:" in out else ""
    return cat, summ, reply


def send(to, subject, body):
    msg = MIMEText(body, "plain", "utf-8")
    msg["From"] = GMAIL
    msg["To"] = to
    msg["Subject"] = subject
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ssl.create_default_context()) as s:
        s.login(GMAIL, GMAIL_PW)
        s.send_message(msg)


UNSUB_REPLY = """お世話になっております。ワークシールドの月足です。

ご連絡ありがとうございます。配信を停止いたしました。
今後こちらからご連絡することはございません。
お手数をおかけし申し訳ありませんでした。

ワークシールド　月足 昂誠
https://freelance-contract-checker.vercel.app
"""

lines = []
for c in candidates:
    try:
        cat, summ, reply = classify(c)
    except Exception as e:
        print(f"[分類失敗] {c['from']}: {str(e)[:60]}")
        continue

    replied = False
    # 自動で返信してよいのは、内容が定型になるものだけ。
    # 断り・自動返信・その他は、こちらから何も送らずSlackに流して人が判断する。
    if cat == "unsubscribe":
        try:
            send(c["from"], "Re: " + c["subject"], UNSUB_REPLY)
            replied = True
        except Exception as e:
            print(f"[送信失敗] {str(e)[:60]}")
    elif cat in ("interested", "question") and reply:
        try:
            send(c["from"], "Re: " + c["subject"], reply)
            replied = True
        except Exception as e:
            print(f"[送信失敗] {str(e)[:60]}")

    try:
        rpc("record_sales_reply", {
            "p_token": LOG_TOKEN, "p_message_id": c["mid"], "p_from_email": c["from"],
            "p_subject": c["subject"][:200], "p_category": cat,
            "p_replied": replied, "p_summary": summ[:200]})
    except Exception as e:
        print(f"[記録失敗] {str(e)[:60]}")

    mark = "返信済み" if replied else "返信なし"
    line = f"[{cat}/{mark}] {c['org'] or c['from']} … {summ}"
    print(line)
    lines.append(line)
    if cat in ("interested", "question"):
        notify(f"営業に前向きな返信がありました\n{c['org'] or c['from']}（{c['from']}）\n{summ}\n→ 自動で返信済み" if replied
               else f"営業への返信（要対応）\n{c['org'] or c['from']}（{c['from']}）\n{summ}")
    elif cat not in ("auto",):
        notify(f"営業への返信 [{cat}] {c['org'] or c['from']} … {summ}")

print(f"\n処理した返信: {len(lines)}件")
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
