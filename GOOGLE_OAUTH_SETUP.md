# Google OAuth セットアップガイド

StockYard Manager でGoogleログインを使用するための設定方法です。

## 📋 前提条件

- Googleアカウント
- Google Cloud Platform (GCP) へのアクセス

## ステップ1️⃣: Google Cloud Console でプロジェクトを作成

1. **Google Cloud Console にアクセス**: https://console.cloud.google.com/
2. **新しいプロジェクトを作成**:
   - 左上のプロジェクト選択 → **新しいプロジェクト**
   - プロジェクト名: `StockYard Manager`（任意）
   - **作成** をクリック

## ステップ2️⃣: OAuth 同意画面を設定

1. **左側メニュー** → **APIとサービス** → **OAuth 同意画面**
2. **User Type** を選択:
   - **外部** を選択（Googleアカウントを持つ全員がログイン可能）
   - **作成** をクリック
3. **アプリ情報** を入力:
   - **アプリ名**: `StockYard Manager`
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
   - **保存して次へ**
4. **スコープ**:
   - デフォルトのままでOK
   - **保存して次へ**
5. **テストユーザー**（開発中のみ）:
   - **ADD USERS** をクリック
   - ログインを許可したいGoogleアカウントのメールアドレスを追加
   - **保存して次へ**
6. **概要** を確認して **ダッシュボードに戻る**

## ステップ3️⃣: OAuth クライアント ID を作成

1. **左側メニュー** → **認証情報**
2. **認証情報を作成** → **OAuth クライアント ID**
3. **アプリケーションの種類**:
   - **ウェブアプリケーション** を選択
4. **名前**:
   - `StockYard Manager Web Client`（任意）
5. **承認済みの JavaScript 生成元**:
   - ローカル開発用: `http://localhost:3001`
   - 本番環境用: `https://your-app.vercel.app`（Vercel URLに置き換え）
6. **承認済みのリダイレクト URI**:
   - ローカル: `http://localhost:3001/api/auth/callback/google`
   - 本番: `https://your-app.vercel.app/api/auth/callback/google`
7. **作成** をクリック

## ステップ4️⃣: クライアント ID とシークレットをコピー

認証情報が作成されると、ポップアップが表示されます：

- **クライアント ID**: `xxxxx.apps.googleusercontent.com`
- **クライアント シークレット**: `GOCSPX-xxxxx`

これらの値をコピーしてください。

## ステップ5️⃣: 環境変数を設定

### ローカル開発環境

`.env` ファイルに以下を追加:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
```

### Vercel 本番環境

1. **Vercelダッシュボード** → プロジェクトを選択
2. **Settings** → **Environment Variables**
3. 以下の環境変数を追加:
   - Key: `GOOGLE_CLIENT_ID`、Value: コピーしたクライアントID
   - Key: `GOOGLE_CLIENT_SECRET`、Value: コピーしたクライアントシークレット
4. **Save**

⚠️ **重要**: 環境変数を追加したら、Vercelで再デプロイが必要です。

## ステップ6️⃣: 動作確認

### ローカル

1. 開発サーバーを起動:
   ```bash
   npm run dev
   ```
2. http://localhost:3001 にアクセス
3. **Sign in with Google** ボタンをクリック
4. Googleアカウントでログイン

### Vercel

1. Vercel URLにアクセス（例: `https://your-app.vercel.app`）
2. **Sign in with Google** ボタンをクリック
3. Googleアカウントでログイン

## 🔧 トラブルシューティング

### "Error 400: redirect_uri_mismatch"

**原因**: リダイレクトURIが一致していません。

**解決策**:
1. Google Cloud Console → **認証情報**
2. OAuth 2.0 クライアントIDを選択
3. **承認済みのリダイレクト URI** に正しいURLを追加:
   - ローカル: `http://localhost:3001/api/auth/callback/google`
   - Vercel: `https://your-actual-app.vercel.app/api/auth/callback/google`

### "Access blocked: This app's request is invalid"

**原因**: OAuth同意画面の設定が不完足です。

**解決策**:
1. Google Cloud Console → **OAuth 同意画面**
2. すべての必須項目が入力されているか確認
3. **公開ステータス** が「テスト」になっている場合、テストユーザーに自分のメールアドレスを追加

### 本番環境でログインできない

**原因**: 環境変数が設定されていない、または再デプロイが必要。

**解決策**:
1. Vercel → **Settings** → **Environment Variables** で確認
2. 環境変数を追加/変更した場合は、**Deployments** → **Redeploy**

### ローカルでポート番号が異なる場合

もしローカルで `localhost:3000` を使用している場合:

1. `.env` ファイルの `NEXTAUTH_URL` を更新:
   ```env
   NEXTAUTH_URL="http://localhost:3000"
   ```
2. Google Cloud Console のリダイレクトURIも更新:
   - `http://localhost:3000/api/auth/callback/google`

## 📚 参考リンク

- Google Cloud Console: https://console.cloud.google.com/
- NextAuth.js Google Provider: https://next-auth.js.org/providers/google
- OAuth 2.0 Overview: https://developers.google.com/identity/protocols/oauth2

## 🎉 完了！

これでGoogleログインが使用できるようになりました。ユーザー名とパスワードの管理が不要になり、セキュアな認証が実装されました。
