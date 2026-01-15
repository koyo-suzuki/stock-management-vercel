# Quick Start Guide

最速で StockYard Manager を起動する方法です。

## 1. 依存関係のインストール

```bash
npm install
```

## 2. 環境変数の設定

`.env` ファイルを作成:

```env
# Vercel Postgres (https://vercel.com/storage から取得)
POSTGRES_PRISMA_URL="your-vercel-postgres-url"
POSTGRES_URL_NON_POOLING="your-vercel-postgres-url-non-pooling"

# NextAuth (以下のコマンドで生成: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-here"
```

## 3. データベースのセットアップ

```bash
# Prisma Clientの生成
npx prisma generate

# スキーマをデータベースに適用
npx prisma db push

# サンプルデータの投入（オプション）
npm run seed
```

## 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 5. ログイン

- **ユーザー名**: admin
- **パスワード**: password123

## その他のコマンド

```bash
# Prisma Studio (データベースGUI)
npm run db:studio

# ビルド
npm run build

# 本番サーバー起動
npm start
```

詳細は `SETUP.md` を参照してください。
