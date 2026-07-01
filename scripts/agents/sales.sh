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
import json, urllib.request, os, smtplib
from datetime import date
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_ADDRESS = os.environ.get("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "")
today = date.today()

# --- Claude にターゲット・メール文案を生成させる ---
prompt = f"""あなたはfreelance-contract-checkerの営業担当です。
今日: {today}
サービス: フリーランスの契約書リスク診断ツール（月額課金）
現状: 売上¥0、認知度低い

以下を出力せよ：

【1. 今日の営業ターゲット】
パートナー候補または法人ターゲット1件
- 組織名（実在する団体・企業）
- 公開されているお問い合わせ先メールアドレス（info@...等の一般公開アドレスのみ）
- ターゲット理由（1行）

【2. 送信メール（日本語）】
件名: （40文字以内）
本文: （200文字以内、フリーランス支援の文脈でサービスを自然に紹介、押しつけがましくない）
署名: ワークシールド営業部 / https://freelance-contract-checker.vercel.app

【出力形式】
TARGET_EMAIL: xxx@example.com
SUBJECT: 件名テキスト
BODY:
本文テキスト（複数行可）
END_BODY"""

payload = json.dumps({
  "model": "claude-opus-4-8",
  "max_tokens": 1000,
  "messages": [{"role": "user", "content": prompt}]
}).encode()

req = urllib.request.Request(
  "https://api.anthropic.com/v1/messages",
  data=payload,
  headers={
    "x-api-key": os.environ["ANTHROPIC_API_KEY"],
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  }
)
res = json.loads(urllib.request.urlopen(req).read())
output = res["content"][0]["text"]
print(output)

# --- メール送信 ---
try:
  lines = output.splitlines()
  target_email = ""
  subject = ""
  body_lines = []
  in_body = False

  for line in lines:
    if line.startswith("TARGET_EMAIL:"):
      target_email = line.replace("TARGET_EMAIL:", "").strip()
    elif line.startswith("SUBJECT:"):
      subject = line.replace("SUBJECT:", "").strip()
    elif line.strip() == "BODY:":
      in_body = True
    elif line.strip() == "END_BODY":
      in_body = False
    elif in_body:
      body_lines.append(line)

  body = "\n".join(body_lines).strip()

  if target_email and subject and body and GMAIL_ADDRESS and GMAIL_APP_PASSWORD:
    msg = MIMEMultipart()
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = target_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
      server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
      server.sendmail(GMAIL_ADDRESS, target_email, msg.as_string())

    print(f"\n[送信完了] To: {target_email} / 件名: {subject}")
  else:
    print(f"\n[送信スキップ] target={target_email}, subject={subject}, body_len={len(body)}")
except Exception as e:
  print(f"\n[メール送信エラー] {e}")

PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$RESPONSE"
