# StockYard Manager v3.2

在庫管理システム - 複数拠点（東京・大阪）の在庫をリアルタイムで管理するモダンなWebアプリケーション

A modern, real-time inventory management system for managing stock across multiple locations (Tokyo and Osaka).

## 主な機能 / Features

### 📦 在庫管理
- **リアルタイム在庫更新**: モーダル確認による安全な在庫変更
- **複数拠点対応**: 東京・大阪の倉庫在庫を一元管理
- **カラーバリエーション**: 商品ごとに複数の色バリエーションを管理
- **変更履歴**: すべての在庫変更履歴を記録・閲覧可能

### 👥 ユーザー管理
- **管理者アカウント**: すべての機能にアクセス可能
- **ゲストアカウント**: 閲覧専用（検索・在庫確認・更新のみ）
- **HTTP Basic認証**: シンプルで安全な認証システム
- **ログアウト機能**: いつでもログアウト可能

### 🔍 検索・フィルタリング
- **商品検索**: 商品名で素早く検索
- **拠点フィルター**: 全体・東京・大阪でフィルタリング
- **CSV出力**: 在庫データをCSV形式でエクスポート（管理者のみ）

## 技術スタック / Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres (PostgreSQL)
- **ORM**: Prisma
- **Authentication**: HTTP Basic Authentication
- **Icons**: Lucide React
- **Validation**: Zod
- **UI Feedback**: React Hot Toast

## セットアップ / Getting Started

### 前提条件 / Prerequisites

- Node.js 18以上
- Vercelアカウント（Postgresデータベース用）

### 1. 依存関係のインストール / Install Dependencies

```bash
npm install
```

### 2. データベースのセットアップ / Setup Database

1. [vercel.com/storage](https://vercel.com/storage)でVercel Postgresデータベースを作成
2. Vercelダッシュボードから接続文字列をコピー
3. `.env`ファイルを作成:

```env
# Database
PRISMA_DATABASE_URL="your-prisma-postgres-url"
DATABASE_URL="your-postgres-url"

# Basic Authentication - Admin (full access)
BASIC_AUTH_USER="admin"
BASIC_AUTH_PASSWORD="password"

# Basic Authentication - Guest (read-only)
GUEST_AUTH_USER="guest"
GUEST_AUTH_PASSWORD="guest123"
```

### 3. Prismaのセットアップ / Setup Prisma

```bash
# Prisma Clientを生成
npx prisma generate

# スキーマをデータベースにプッシュ
npx prisma db push
```

### 4. 開発サーバーの起動 / Run Development Server

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### 5. ログイン / Login

デフォルトの認証情報:

**管理者アカウント（フルアクセス）:**
- ユーザー名: `admin`
- パスワード: `password`

**ゲストアカウント（閲覧のみ）:**
- ユーザー名: `guest`
- パスワード: `guest123`

## 使い方 / Usage

### 管理者機能 (Admin Features)

#### 商品の追加
1. 「商品を追加」ボタンをクリック
2. 商品名と画像URL（任意）を入力
3. カラーバリエーションと初期在庫を追加
4. 最小在庫数を設定
5. 「商品を作成」をクリック

#### 商品の編集
1. 商品カードの編集ボタン（鉛筆アイコン）をクリック
2. 商品情報を編集
3. バリエーションの追加・削除が可能
4. 「商品を更新」をクリック

#### 在庫の変更
1. 在庫数のプルダウンをクリック
2. 新しい数量を選択
3. 確認モーダルで「確定」をクリック
4. 変更が自動的に保存され、履歴に記録される

#### 変更履歴の確認
1. 「履歴」ボタンをクリック
2. すべての在庫変更履歴を時系列で表示
3. 商品名・バリエーション・拠点・変更量・日時を確認

#### CSV出力
1. 「CSV出力」ボタンをクリック
2. 現在の在庫データがCSV形式でダウンロード

#### 商品の削除
1. 商品カードのゴミ箱アイコンをクリック
2. 確認ダイアログで削除を承認

### ゲスト機能 (Guest Features)

ゲストアカウントでは以下の機能のみ利用可能:
- ✅ 商品検索
- ✅ 在庫状況の閲覧
- ✅ 拠点フィルター（全体・東京・大阪）
- ✅ リストの更新（最新の在庫状況を取得）
- ❌ 商品の追加・編集・削除（非表示）
- ❌ 在庫数の変更（グレーアウト）
- ❌ 履歴閲覧（非表示）
- ❌ CSV出力（非表示）

### 共通機能 (Common Features)

#### 検索
- ヘッダーの検索バーで商品名を検索
- リアルタイムでフィルタリング

#### フィルタリング
- 「全体」「東京」「大阪」タブで拠点別にフィルター
- 各拠点の在庫状況を個別に確認

#### ログアウト
- ヘッダーの「ログアウト」ボタンをクリック
- 認証情報がクリアされ、ログアウトページに遷移
- 「再ログイン」で再度認証画面へ

## データベーススキーマ / Database Schema

```prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  imageUrl  String?
  variants  ProductVariant[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ProductVariant {
  id          String  @id @default(cuid())
  productId   String
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  color       String
  stockTokyo  Int     @default(0)
  stockOsaka  Int     @default(0)
  minStock    Int     @default(0)
  stockHistory StockHistory[]

  @@unique([productId, color])
}

model StockHistory {
  id          String   @id @default(cuid())
  variantId   String
  variant     ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  field       String   // 'stockTokyo' or 'stockOsaka'
  oldValue    Int
  newValue    Int
  createdAt   DateTime @default(now())

  @@index([variantId])
  @@index([createdAt])
}
```

## デプロイ / Deployment

### Vercelへのデプロイ

1. コードをGitHubにプッシュ
2. Vercelでプロジェクトをインポート
3. Vercel Postgresデータベースを接続
4. 環境変数を追加:
   - `PRISMA_DATABASE_URL`
   - `DATABASE_URL`
   - `BASIC_AUTH_USER`
   - `BASIC_AUTH_PASSWORD`
   - `GUEST_AUTH_USER`
   - `GUEST_AUTH_PASSWORD`
5. デプロイ

```bash
# Vercel CLIを使用
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで以下を設定:

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `PRISMA_DATABASE_URL` | Prisma接続URL | Vercelが自動生成 |
| `DATABASE_URL` | 直接接続URL | Vercelが自動生成 |
| `BASIC_AUTH_USER` | 管理者ユーザー名 | `admin` |
| `BASIC_AUTH_PASSWORD` | 管理者パスワード | `your-secure-password` |
| `GUEST_AUTH_USER` | ゲストユーザー名 | `guest` |
| `GUEST_AUTH_PASSWORD` | ゲストパスワード | `guest-password` |

## プロジェクト構成 / Project Structure

```
stockyard-manager/
├── app/
│   ├── dashboard/          # ダッシュボードページ
│   │   ├── layout.tsx     # レイアウト
│   │   └── page.tsx       # メインページ
│   ├── logout/            # ログアウトページ
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホーム（/dashboardへリダイレクト）
├── components/
│   ├── CreateProductModal.tsx   # 商品作成モーダル
│   ├── EditProductModal.tsx     # 商品編集モーダル
│   ├── StockHistoryModal.tsx    # 履歴表示モーダル
│   ├── DashboardHeader.tsx      # ヘッダー（ログアウトボタン含む）
│   ├── DashboardContent.tsx     # メインコンテンツ
│   ├── ProductList.tsx          # 商品リスト
│   ├── ProductRow.tsx           # 商品行
│   └── VariantRow.tsx           # バリエーション行
├── lib/
│   ├── actions.ts         # Server Actions（在庫更新、履歴取得など）
│   ├── auth.ts            # 認証ユーティリティ
│   └── prisma.ts          # Prisma クライアント
├── prisma/
│   └── schema.prisma      # データベーススキーマ
└── middleware.ts          # 認証ミドルウェア
```

## セキュリティに関する注意 / Security Notes

### パスワードの変更

月替わりでパスワードを変更する場合:
1. Vercelダッシュボードで環境変数を更新
2. `BASIC_AUTH_PASSWORD`と`GUEST_AUTH_PASSWORD`を新しい値に変更
3. デプロイ後、すべてのユーザーが自動的に再認証を求められます

### Basic認証の制限

- Basic認証はブラウザがクライアント側で認証情報を保存
- サーバー側でのセッション管理なし
- 強制ログアウトは技術的に困難
- より高度なセキュリティが必要な場合は、JWT/セッションベースの認証への移行を検討

## 主要機能の詳細 / Features in Detail

### モーダル確認フロー

在庫変更時の安全性を確保:
1. ユーザーがプルダウンで数量を選択
2. 確認モーダルが表示（変更前 → 変更後）
3. 「確定」をクリックで変更を適用
4. 「キャンセル」で変更を破棄
5. 変更内容は自動的に履歴に記録

### 変更履歴機能

すべての在庫変更を追跡:
- 商品名とバリエーション
- 拠点（東京/大阪）
- 変更前の値 → 変更後の値
- 増減量（+5、-3など）を色分け表示
- 変更日時（年月日 時分秒）
- 最新100件を表示

### ユーザーロール管理

2つのロールで権限を管理:
- **管理者**: すべての機能にアクセス可能
- **ゲスト**: 閲覧と更新のみ（編集・削除・履歴は不可）

ヘッダーに現在のロールを表示（管理者/ゲスト）

## ライセンス / License

MIT

## バージョン履歴 / Version History

### v3.2 (2026-01)
- ログアウト機能の追加
- ユーザーロール表示（管理者/ゲスト）
- ヘッダーの改善

### v3.1 (2026-01)
- ゲストアカウント機能（読み取り専用）
- 在庫変更履歴の記録・表示
- モーダル確認フローの実装

### v3.0 (2026-01)
- Next.js 14へのアップグレード
- HTTP Basic認証への移行
- 複数拠点対応（東京・大阪）
- カラーバリエーション管理
