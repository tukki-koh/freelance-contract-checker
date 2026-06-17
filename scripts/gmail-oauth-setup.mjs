#!/usr/bin/env node
/**
 * Gmail API OAuth セットアップスクリプト（一回だけ実行）
 * 実行後、表示されるリフレッシュトークンを .env.local の
 * GMAIL_REFRESH_TOKEN に設定してください。
 */

import { google } from 'googleapis'
import * as readline from 'readline'

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GOOGLE_OAUTH_CLIENT_ID と GOOGLE_OAUTH_CLIENT_SECRET を設定してください')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'  // デスクトップアプリ用リダイレクト
)

// Gmail下書き作成スコープ
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
]

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
})

console.log('')
console.log('========================================')
console.log('  以下のURLをブラウザで開いてください')
console.log('========================================')
console.log('')
console.log(authUrl)
console.log('')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question('ブラウザに表示された認証コードを入力してください: ', async (code) => {
  rl.close()
  try {
    const { tokens } = await oauth2Client.getToken(code.trim())
    console.log('')
    console.log('✅ 認証成功！')
    console.log('')
    console.log('以下を .env.local に追加してください:')
    console.log('')
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log(`GMAIL_FROM_EMAIL=yuezuangcheng@gmail.com`)
    console.log('')
  } catch (err) {
    console.error('❌ エラー:', err.message)
  }
})
