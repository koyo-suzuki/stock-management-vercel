# Vercel デプロイガイド

StockYard Manager を Vercel にデプロイする手順を説明します。

## 📋 準備

- GitHubアカウント（✅ 既に作成済み）
- GitHubリポジトリにプッシュ済み（✅ 完了）
- Vercelアカウント（これから作成）

## ステップ1️⃣: Vercelアカウント作成

1. **Vercelにアクセス**: https://vercel.com/signup
2. **「Continue with GitHub」をクリック**
3. GitHubアカウントで認証
4. Vercelが初めての場合、簡単なセットアップを行う

## ステップ2️⃣: プロジェクトをインポート

1. **Vercelダッシュボード**: https://vercel.com/dashboard
2. **「Add New...」→「Project」をクリック**
3. **「Import Git Repository」セクション**で、`koyo-suzuki/stock-management-vercel` を検索
4. **「Import」をクリック**

## ステップ3️⃣: プロジェクト設定

### Configure Project画面で以下を設定:

#### Framework Preset
- **自動検出**: Next.js が選択されているはず（そのままでOK）

#### Root Directory
- **そのまま**: `./`（変更不要）

#### Build and Output Settings
- **そのまま**（デフォルトでOK）
  - Build Command: `next build`
  - Output Directory: `.next`

#### Environment Variables（重要！）
**「Environment Variables」セクションを開く**

以下の環境変数を追加:

1. **NEXTAUTH_SECRET**
   - Key: `NEXTAUTH_SECRET`
   - Value: ランダムな文字列（下記参照）

   ```bash
   # ローカルで生成してコピー
   openssl rand -base64 32
   ```

   または、以下のようなランダム文字列:
   ```
   your-random-secret-key-here-32-characters-long
   ```

2. **NEXTAUTH_URL** (オプション)
   - Key: `NEXTAUTH_URL`
   - Value: `https://your-project-name.vercel.app`

   ⚠️ **注意**: NextAuth v5 では `trustHost: true` が設定されているため、この環境変数は省略可能です。設定する場合は、デプロイ後に実際のURLに更新してください。

**重要**: データベース接続情報（POSTGRES_*）は、次のステップでデータベースを作成した後に自動追加されます。

3. **「Deploy」ボタンをクリック**

## ステップ4️⃣: データベースを作成

デプロイが完了したら、データベースをセットアップします。

1. **プロジェクトダッシュボード**に移動
2. **「Storage」タブ**をクリック
3. **「Create Database」をクリック**
4. **「Postgres」を選択**
5. データベース名を入力（例: `stockyard-db`）
6. **Region**: 東京に近いリージョンを選択（例: `Singapore (sin1)`）
7. **「Create」をクリック**

### データベース接続

1. **「Connect」または「.env.local」タブ**をクリック
2. **環境変数が自動的にプロジェクトに追加されます**:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

3. これらの変数は自動的にプロジェクトに紐付けられます（手動設定不要）

## ステップ5️⃣: データベーススキーマをセットアップ

デプロイ後、データベースにテーブルを作成する必要があります。

### 方法A: Vercel CLI を使用（推奨）

ローカルで以下を実行:

```bash
# Vercel CLIをインストール（初回のみ）
npm i -g vercel

# Vercelにログイン
vercel login

# プロジェクトにリンク
vercel link

# 環境変数を取得
vercel env pull .env.local

# Prismaでデータベーススキーマを適用
npx prisma db push

# サンプルデータを投入（オプション）
npm run seed
```

### 方法B: Vercel Postgresダッシュボードで直接実行

1. **Storage → Postgres → Query**タブ
2. 以下のSQLを実行:

```sql
-- User テーブル
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL
);

-- Product テーブル
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ProductVariant テーブル
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "stockTokyo" INTEGER NOT NULL DEFAULT 0,
    "stockOsaka" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE,
    CONSTRAINT "ProductVariant_productId_color_key" UNIQUE ("productId", "color")
);

-- 初期ユーザーを作成（パスワード: password123）
INSERT INTO "User" ("id", "username", "password")
VALUES ('default-user', 'admin', '$2b$10$YourBcryptHashHere');
```

⚠️ **パスワードハッシュの生成**:
ローカルで以下を実行してハッシュを生成:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password123', 10).then(console.log)"
```

## ステップ6️⃣: NEXTAUTH_URLを更新（必要な場合）

1. デプロイ完了後、プロジェクトのURLが確定します（例: `https://stock-management-vercel.vercel.app`）
2. **Settings → Environment Variables**
3. `NEXTAUTH_URL` を編集し、実際のURLに更新
4. **「Save」→ 再デプロイ**

## ステップ7️⃣: アクセスして確認

1. **デプロイされたURL**にアクセス（例: `https://stock-management-vercel.vercel.app`）
2. ログインページが表示される
3. 以下の認証情報でログイン:
   - Username: `admin`
   - Password: `password123`

## 🎉 完了！

これで、Vercelでアプリケーションが動作しています。

## 📝 今後の更新方法

### コードを更新してデプロイ

1. ローカルで変更を加える
2. Git にコミット:
   ```bash
   git add .
   git commit -m "Update: ..."
   git push
   ```
3. **自動デプロイ**: GitHubにプッシュすると、Vercelが自動的に再デプロイします

### 環境変数の追加・変更

1. **Vercel Dashboard → プロジェクト → Settings → Environment Variables**
2. 変更後、再デプロイが必要

## 🔧 トラブルシューティング

### ビルドエラーが発生する場合

1. **Vercel Dashboard → Deployments → 失敗したデプロイをクリック**
2. ログを確認
3. よくある原因:
   - 環境変数の設定忘れ
   - TypeScriptエラー
   - 依存関係の問題

### データベース接続エラー

1. **Storage → Postgres**で接続情報を確認
2. 環境変数が正しく設定されているか確認
3. Prismaスキーマがプッシュされているか確認

### ログインできない

1. データベースにユーザーが作成されているか確認
2. `NEXTAUTH_SECRET` が設定されているか確認
3. `NEXTAUTH_URL` が正しいURLに設定されているか確認

## 💡 便利な機能

### プレビューデプロイ

- **Pull Request** を作成すると、自動的にプレビュー環境が作成されます
- 本番環境に影響を与えずにテストできます

### ドメイン設定

1. **Settings → Domains**
2. カスタムドメインを追加可能（例: `stockyard.your-domain.com`）

### Analytics

1. **Analytics**タブで、アクセス状況を確認できます

## 📚 参考リンク

- Vercel公式ドキュメント: https://vercel.com/docs
- Next.jsデプロイガイド: https://nextjs.org/docs/deployment
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
