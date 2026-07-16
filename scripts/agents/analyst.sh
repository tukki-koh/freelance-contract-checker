#!/bin/bash
set -e

REPORT=$(python3 << 'PYEOF'
import json, urllib.request, os, datetime, base64 as _b64

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

# --- Stripe データ取得 ---
def stripe_get(path):
    req = urllib.request.Request(
        f"https://api.stripe.com/v1/{path}",
        headers={"Authorization": f"Bearer {os.environ['STRIPE_SECRET_KEY']}"}
    )
    try:
        return json.loads(_urlopen_with_retry(req).read(), strict=False)
    except:
        return {}

charges = stripe_get("charges?limit=10")
total_revenue = sum(c.get("amount", 0) for c in charges.get("data", []) if c.get("paid")) // 100
customer_count = stripe_get("customers?limit=1").get("total_count", 0)
sub_data = stripe_get("subscriptions?limit=1")
active_subs = sub_data.get("total_count", 0)

# --- GA4 データ取得 ---
sa_json = json.loads(_b64.b64decode(os.environ["GOOGLE_SERVICE_ACCOUNT_B64"]).decode())
property_id = os.environ["GA4_PROPERTY_ID"]

import urllib.parse, time, hmac, hashlib, base64, struct

def get_google_token(sa):
    import json as _json
    now = int(time.time())
    header = base64.urlsafe_b64encode(_json.dumps({"alg":"RS256","typ":"JWT"}).encode()).rstrip(b"=")
    payload = base64.urlsafe_b64encode(_json.dumps({
        "iss": sa["client_email"],
        "scope": "https://www.googleapis.com/auth/analytics.readonly",
        "aud": "https://oauth2.googleapis.com/token",
        "exp": now + 3600,
        "iat": now
    }).encode()).rstrip(b"=")
    
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    from cryptography.hazmat.backends import default_backend
    
    private_key = serialization.load_pem_private_key(
        sa["private_key"].encode(), password=None, backend=default_backend()
    )
    sign_input = header + b"." + payload
    signature = private_key.sign(sign_input, padding.PKCS1v15(), hashes.SHA256())
    sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=")
    jwt = (sign_input + b"." + sig_b64).decode()
    
    token_req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    resp = json.loads(_urlopen_with_retry(token_req).read(), strict=False)
    return resp.get("access_token", "")

try:
    token = get_google_token(sa_json)
    ga_req = urllib.request.Request(
        f"https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport",
        data=json.dumps({
            "dateRanges": [{"startDate": "7daysAgo", "endDate": "today"}],
            "metrics": [{"name": "sessions"}, {"name": "activeUsers"}, {"name": "bounceRate"}]
        }).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    )
    ga_data = json.loads(_urlopen_with_retry(ga_req).read(), strict=False)
    rows = ga_data.get("rows", [{}])
    sessions = rows[0].get("metricValues", [{}, {}, {}])[0].get("value", "0") if rows else "0"
    users = rows[0].get("metricValues", [{}, {}, {}])[1].get("value", "0") if rows else "0"
    bounce = rows[0].get("metricValues", [{}, {}, {}])[2].get("value", "0") if rows else "0"
    ga_summary = f"セッション数:{sessions} / ユーザー数:{users} / 直帰率:{float(bounce)*100:.1f}%"
except Exception as e:
    ga_summary = f"GA4取得エラー: {e}"

# --- Claude分析 ---
data_context = f"""
【Stripeデータ（直近10件）】
総売上: ¥{total_revenue}
顧客数: {customer_count}
アクティブサブスク: {active_subs}

【GA4データ（過去7日間）】
{ga_summary}
"""

prompt = f"""あなたはfreelance-contract-checkerのデータアナリストです。
あなたは世界で最も成功している企業の同職種トップ人材、具体的にはNetflixのデータ分析チーム（徹底した指標ドリブン）のように考え行動する。常に世界最高水準のベストプラクティスを学んで取り入れ、前回までの自分を超え、同じ提案の焼き直しを避けて毎回新しい価値を生み出し、成長し続けよ。
今日: {datetime.date.today()}

以下の実データを分析せよ：
{data_context}

【1. ボトルネック分析】
- 最も深刻な問題を数値根拠とともに特定
- 各部門が今週計測すべきKPI1件ずつ

【2. 施策効果予測】
- 最もROIが高い施策1件（理由付き）
- 即刻見直すべき点1件

【3. CEOへの意思決定データ】
- 今週最重要の経営判断1件と推奨アクション
- 来週の売上予測（3シナリオ）

フォーマット: 各セクションを【1】【2】【3】で区切って出力"""

api_req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=json.dumps({
        "model": "claude-opus-4-8",
        "max_tokens": 1500,
        "messages": [{"role": "user", "content": prompt}]
    }).encode(),
    headers={
        "x-api-key": os.environ["ANTHROPIC_API_KEY"],
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
)
res = json.loads(_urlopen_with_retry(api_req).read(), strict=False)
print(res["content"][0]["text"])
PYEOF
)

echo "report<<EOF" >> $GITHUB_OUTPUT
echo "$REPORT" >> $GITHUB_OUTPUT
echo "EOF" >> $GITHUB_OUTPUT
echo "$REPORT"
