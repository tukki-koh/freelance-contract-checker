#!/bin/bash
set -e

# 平日のみ実行（JST）
JST_DOW=$(TZ=Asia/Tokyo date '+%u')  # 1=月, 7=日
if [ "$JST_DOW" -ge 6 ]; then
  echo "週末のためスキップ (DOW=$JST_DOW)"
  echo "report=skipped (weekend)" >> $GITHUB_OUTPUT
  exit 0
fi

# JST 9〜12時の枠で実行（cron遅延で10時ちょうどに起動できない日があるため幅を持たせる）。
# 実際の重複防止・1日上限はDB側(claim_sales_email)で原子的に担保しているので多重起動しても安全。
JST_HOUR=$(TZ=Asia/Tokyo date '+%H')
case "$JST_HOUR" in
  09|10|11|12) : ;;
  *)
    if [ "${GITHUB_EVENT_NAME:-}" != "workflow_dispatch" ]; then
      echo "本日の実行枠外のためスキップ (JST ${JST_HOUR}時、稼働枠は9〜12時)"
      echo "report=skipped (out of window)" >> $GITHUB_OUTPUT
      exit 0
    fi
    ;;
esac

pip install --quiet --disable-pip-version-check dnspython >/dev/null 2>&1 || true

RESPONSE=$(python3 << 'PYEOF'
import json, urllib.request, urllib.parse, os, smtplib, re

def _urlopen_with_retry(req, tries=4, base_delay=3, timeout=180):
    import time, urllib.error
    for i in range(tries):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
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
from datetime import date, datetime, timezone, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_ADDRESS = os.environ.get("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
SUPA_URL = os.environ.get("AGENT_SUPABASE_URL", "").rstrip("/")
SUPA_ANON = os.environ.get("AGENT_SUPABASE_ANON_KEY", "")
LOG_TOKEN = os.environ.get("AGENT_LOG_TOKEN", "")
DAILY_CAP = 5           # 1日の送信上限（平日）
CANDIDATES = 8          # Claudeに出させる候補数（検証で落ちる分の余裕）
today = date.today()
JST = timezone(timedelta(hours=9))

HDRS = {"apikey": SUPA_ANON, "Authorization": f"Bearer {SUPA_ANON}", "Content-Type": "application/json"}

# --- 本日すでに上限到達なら、Claude APIを呼ぶ前に終了（重複起動時のコスト削減）---
def sent_today_count():
    if not (SUPA_URL and SUPA_ANON):
        return 0
    since = datetime.now(JST).replace(hour=0, minute=0, second=0, microsecond=0)
    q = urllib.parse.quote(since.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"))
    req = urllib.request.Request(
        f"{SUPA_URL}/rest/v1/sent_sales_emails?select=email&sent_at=gte.{q}", headers=HDRS)
    try:
        return len(json.loads(urllib.request.urlopen(req, timeout=10).read()))
    except Exception as e:
        print(f"[本日件数の取得失敗（続行）] {e}")
        return 0

already = sent_today_count()
if already >= DAILY_CAP:
    print(f"本日はすでに上限 {already}/{DAILY_CAP} 件に到達しているため終了")
    raise SystemExit(0)

# --- 送信権を原子的に取得（未送信 かつ 本日上限未満なら true）---
def claim_email(email, org, subject):
    if not (SUPA_URL and SUPA_ANON and LOG_TOKEN):
        return False
    payload = json.dumps({
        "p_token": LOG_TOKEN, "p_email": email,
        "p_org": org, "p_subject": subject, "p_daily_cap": DAILY_CAP,
    }).encode()
    req = urllib.request.Request(
        f"{SUPA_URL}/rest/v1/rpc/claim_sales_email", data=payload, headers=HDRS)
    try:
        return json.loads(urllib.request.urlopen(req, timeout=10).read()) is True
    except Exception as e:
        print(f"[claim失敗] {e}")
        return False

# --- 宛先の実在性チェック（バウンス防止の要）---
# 1) 形式  2) 使い捨て/プレースホルダ語の排除  3) DNSのMX(なければA)レコード確認
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
BANNED_LOCAL = {"sample", "example", "test", "mail", "your", "dummy", "noreply", "no-reply"}
BANNED_DOMAIN = {"example.com", "example.co.jp", "mail.com", "sample.com", "test.com"}

try:
    import dns.resolver
    _resolver = dns.resolver.Resolver()
    _resolver.lifetime = 8.0
except Exception:
    _resolver = None
    print("[警告] dnspythonが使えないためMX検証をスキップします（バウンスの恐れ）")

def domain_receives_mail(domain):
    """MXレコード（無ければAレコード）が引けるドメインだけ許可する。"""
    if _resolver is None:
        return True
    try:
        answers = _resolver.resolve(domain, "MX")
        return len(answers) > 0
    except Exception:
        pass
    try:
        _resolver.resolve(domain, "A")
        return True
    except Exception:
        return False

def validate_recipient(email):
    """(ok, 理由) を返す。"""
    email = email.strip().lower()
    if not EMAIL_RE.match(email):
        return False, "形式不正"
    local, _, domain = email.partition("@")
    if local in BANNED_LOCAL:
        return False, f"プレースホルダ的なローカル部({local})"
    if domain in BANNED_DOMAIN:
        return False, f"サンプルドメイン({domain})"
    if not domain_receives_mail(domain):
        return False, f"DNSにMX/Aレコードが無い（存在しないドメイン）: {domain}"
    return True, "ok"

# --- Claude に Web検索で「実在確認済み」の宛先を調べさせる ---
# 記憶からアドレスを書かせると存在しないドメイン/アカウントを創作してしまい、
# 実際にほぼ全件がバウンスしていたため、必ず検索で見つけた実ページを根拠にさせる。
prompt = f"""あなたはfreelance-contract-checkerの営業担当です。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはSalesforceのトップセールス（価値提案と関係構築の達人）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {today}
サービス: フリーランスの契約書リスク診断ツール（フリーランス新法・下請法の違反をAI診断。単発300円/月額980円）
現状: 認知拡大フェーズ

Web検索ツールを使い、フリーランス支援に関わる実在の団体・企業・エージェンシー・士業事務所のうち、
「公式サイト上に一般問い合わせ用メールアドレスが実際に記載されている」組織を最大{CANDIDATES}件見つけ、
それぞれに送る営業メールを作成せよ。

【最重要・厳守】メールアドレスの捏造は絶対に禁止する。
- 必ずWeb検索で公式サイトの該当ページを開き、そこに「実際に文字として記載されている」アドレスだけを使う。
- 「info@ + ドメイン」のような推測での組み立ては禁止。記載を確認できない組織は候補から外す。
- SOURCE 行に、そのアドレスが記載されていた実在ページのURLを必ず書く。確認できないならその組織は出力しない。
- 候補が{CANDIDATES}件に満たなくてよい。0件でもよい。捏造するくらいなら少なく出せ。

その他の条件：
- 一般問い合わせ先（info@ / contact@ 等）のみ。個人アドレスは不可。
- 各社バラバラの相手にする（重複させない）。
- 本文は200字以内、フリーランス支援の文脈で自然に紹介。押しつけがましくしない。
- 特定電子メール法に配慮し、末尾に「不要の場合は本メールへの返信で配信停止できます」を入れる。
- 署名: ワークシールド営業部 / https://freelance-contract-checker.vercel.app

最終回答は以下の形式のみで出力（前置き・説明は不要）：
===
ORG: 組織名
EMAIL: 公式サイトに記載されていた実際のアドレス
SOURCE: そのアドレスが記載されていたページのURL
SUBJECT: 件名（40字以内）
BODY:
本文（複数行可）
END
"""

payload = json.dumps({
  "model": "claude-sonnet-5",
  "max_tokens": 4000,
  "tools": [{"type": "web_search_20250305", "name": "web_search", "max_uses": 12}],
  "messages": [{"role": "user", "content": prompt}]
}).encode()
req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages", data=payload,
  headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01", "content-type": "application/json"},
)
res = json.loads(_urlopen_with_retry(req).read())
_text_blocks = [b.get("text","") for b in res.get("content",[]) if b.get("type") == "text"]
output = "".join(_text_blocks)

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
        elif s.startswith("SOURCE:"): cur["source"] = s[7:].strip()
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
print(f"候補: {len(targets)}件")

# --- 検証を通ったものだけ送信 ---
sent, rejected = [], []
for t in targets:
    email = (t.get("email") or "").strip()
    subject = (t.get("subject") or "").strip()
    body = (t.get("body") or "").strip()
    org = (t.get("org") or "").strip()
    source = (t.get("source") or "").strip()
    if not (email and subject and body):
        continue
    if not source.startswith("http"):
        rejected.append(f"{org} <{email}>: 出典URLが無い（捏造の疑い）")
        continue
    ok, reason = validate_recipient(email)
    if not ok:
        rejected.append(f"{org} <{email}>: {reason}")
        continue
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
        sent.append(f"{org or email} <{email}> (出典: {source})")
        print(f"[送信完了] {org} <{email}> / {subject}")
    except Exception as e:
        print(f"[送信エラー] {email}: {e}")

print(f"\n本日この実行での送信: {len(sent)}件 / 1日上限{DAILY_CAP}件")
for s in sent: print(" -", s)
if rejected:
    print(f"\n宛先検証で除外: {len(rejected)}件（バウンス防止）")
    for r in rejected: print(" x", r)
if not sent:
    print("（本日の上限到達、新規ターゲットなし、または全件が宛先検証で除外）")
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
