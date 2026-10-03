# StockYard Manager v3.2

在庫管理システム - 複数拠点（東京・大阪）の在庫をリアルタイムで管理するモダンなWebアプリケーション

A modern, real-time inventory management system for managing stock across multiple locations (Tokyo and Osaka).

## 主な機能 / Features

### 在庫管理

- リアルタイム在庫更新: モーダル確認による安全な在庫変更
- 複数拠点対応: 東京・大阪の倉庫在庫を一元管理
- カラーバリエーション: 商品ごとに複数の色バリエーションを管理
- 変更履歴: すべての在庫変更履歴を記録・閲覧可能

### ユーザー管理

- 管理者アカウント: すべての機能にアクセス可能
- ゲストアカウント: 閲覧専用（検索・在庫閲覧・拠点フィルター・一覧の再取得）
- HTTP Basic認証: middleware.tsで認証し、Server Actionsでも権限を確認
- ログアウト機能: いつでもログアウト可能

### 検索・フィルタリング

- 商品検索: 商品名で素早く検索
- 拠点フィルター: 全体・東京・大阪でフィルタリング
- CSV出力: 在庫データをCSV形式でエクスポート（管理者のみ）

## 技術スタック / Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Vercel Postgres (PostgreSQL)
- ORM: Prisma
- Authentication: HTTP Basic Authentication
- Icons: Lucide React
- Validation: Zod
- UI Feedback: React Hot Toast

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
3. `.env`ファイルを作成。

```env
# Database
PRISMA_DATABASE_URL="your-prisma-postgres-url"
DATABASE_URL="your-postgres-url"

# Basic Authentication - Admin (full access)
BASIC_AUTH_USER="your-admin-username"
BASIC_AUTH_PASSWORD="your-secure-password"

# Basic Authentication - Guest (optional, read-only)
GUEST_AUTH_USER="your-guest-username"
GUEST_AUTH_PASSWORD="your-secure-guest-password"
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

ブラウザのBasic認証ダイアログで、環境変数に設定したユーザー名とパスワードを入力してください。管理者の認証情報は必ず設定し、推測されにくい値にしてください。デフォルト値はありません。

`BASIC_AUTH_USER`または`BASIC_AUTH_PASSWORD`が未設定の場合、アプリはHTTP 500を返して起動しません。ゲストログインは`GUEST_AUTH_USER`と`GUEST_AUTH_PASSWORD`の両方を設定した場合だけ有効です。

### サンプルデータ / Sample Data

開発用の商品サンプルが必要な場合だけ、次のコマンドを実行してください。

```bash
npm run seed
```

商品とバリエーションのみを作成し、認証用ユーザーは作成しません。再実行すると商品が追加されるため、本番データベースには不用意に実行しないでください。

### その他のコマンド / Other Commands

```bash
npm run db:studio  # データベースGUI
npm run build     # ビルド
npm start         # 本番サーバー起動
```

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

既存バリエーションを更新しても在庫変更履歴は保持されます。編集画面で在庫数を変更した場合も履歴に記録されます。

#### 在庫の変更

1. 在庫数のプルダウンをクリック
2. 新しい数量を選択
3. 確認モーダルで「確定」をクリック
4. 変更が自動的に保存され、履歴に記録される

在庫変更には楽観ロックを使います。他の人が先に変更していた場合は「他のユーザーが先に更新しました」と表示し、画面の在庫数を最新値に戻します。最新値を確認してから変更し直してください。

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

| 機能 | guestの権限 |
|------|-------------|
| 商品検索・在庫閲覧・拠点フィルター・一覧の再取得 | 利用可能 |
| 商品追加・編集・削除 | 利用不可 |
| 在庫数の変更 | 利用不可 |
| 履歴閲覧・CSV出力 | 利用不可 |

### 共通機能 (Common Features)

#### 検索

- ヘッダーの検索バーで商品名を検索
- リアルタイムでフィルタリング

#### フィルタリング

- 「全体」「東京」「大阪」タブで拠点別にフィルター
- 各拠点の在庫状況を個別に確認

#### ログアウト

- ヘッダーの「ログアウト」ボタンをクリック
- ログアウトページに遷移。ブラウザが認証情報を保持する場合があります
- 「再ログイン」で再度認証画面へ

## データベーススキーマ / Database Schema

スキーマの正は`prisma/schema.prisma`です。テーブル作成・同期には`npx prisma db push`を使ってください。

`User`テーブルはアプリでは未使用・将来削除予定です。本番DBへの影響を避けるため、今回はスキーマに残しています。認証のためにユーザーを登録する必要はありません。以下はアプリが使用するモデルです。

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
4. Settings → Environment Variablesで下表の必須変数を設定。ゲストを利用する場合は任意変数も両方設定
5. 接続先DBを確認し、`npx prisma db push`でスキーマを適用。本番DBでは変更内容を確認してから実行
6. `npm run build`でビルドし、デプロイ後に管理者・ゲストの権限を確認

環境変数は利用するProduction・Preview・Development環境ごとに設定し、変更後はRedeployしてください。ビルド設定はFramework PresetがNext.js、Build Commandが`npm run build`、Output Directoryが`.next`です。`postinstall`でPrisma Clientを生成します。

```bash
# Vercel CLIを使用
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで以下を設定。

| 変数名 | 必須 / Required | 説明 |
|--------|-----------------|------|
| `PRISMA_DATABASE_URL` | 必須 | Vercel PostgresのPrisma接続URL |
| `DATABASE_URL` | 必須 | Vercel Postgresの直接接続URL |
| `BASIC_AUTH_USER` | 必須 | 管理者ユーザー名。環境変数で必ず設定、デフォルト値なし |
| `BASIC_AUTH_PASSWORD` | 必須 | 管理者パスワード。環境変数で必ず設定、デフォルト値なし |
| `GUEST_AUTH_USER` | 任意 | ゲストユーザー名。パスワードと両方設定した場合のみ有効 |
| `GUEST_AUTH_PASSWORD` | 任意 | ゲストパスワード。未設定ならゲストログインは無効 |

Vercelの接続情報を取得した後、上記の変数名で設定されていることを確認してください。旧名の`POSTGRES_PRISMA_URL`・`POSTGRES_URL_NON_POOLING`だけでは動作しません。

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
│   ├── auth.ts            # ロール取得・権限確認
│   ├── basic-auth.ts      # Basic認証の判定ロジック
│   └── prisma.ts          # Prisma クライアント
├── prisma/
│   └── schema.prisma      # データベーススキーマ
├── scripts/
│   └── seed.ts            # 商品サンプル投入
└── middleware.ts          # 認証ミドルウェア
```

## セキュリティに関する注意 / Security Notes

### 認証情報の管理

このリポジトリはpublicです。実際のパスワードや接続文字列をREADME・コード・コミットに含めないでください。例示する値はプレースホルダーのみとし、環境変数には推測されにくいユーザー名・パスワードを設定してください。管理者とゲストには別の認証情報を使ってください。

Basic認証は認証情報を暗号化しないため、本番ではHTTPSを使ってください。権限は画面の表示制御だけでなくServer Actionsでも確認します。

月替わりでパスワードを変更する手順は以下のとおりです。

1. Vercelダッシュボードで環境変数を更新
2. `BASIC_AUTH_PASSWORD`と`GUEST_AUTH_PASSWORD`を新しい値に変更
3. 再デプロイ後は新しい認証情報でアクセスしてください。ブラウザが古い認証情報を保持している場合は再入力が必要です

### Basic認証の制限

- Basic認証はブラウザがクライアント側で認証情報を保存
- サーバー側でのセッション管理なし
- 強制ログアウトは技術的に困難
- より高度なセキュリティが必要な場合は、JWT/セッションベースの認証への移行を検討

## 主要機能の詳細 / Features in Detail

### モーダル確認フロー

在庫変更時の安全性を確保。

1. ユーザーがプルダウンで数量を選択
2. 確認モーダルが表示（変更前 → 変更後）
3. 「確定」をクリックで変更を適用
4. 「キャンセル」で変更を破棄
5. 変更内容は自動的に履歴に記録

### 変更履歴機能

すべての在庫変更を追跡。

- 商品名とバリエーション
- 拠点（東京/大阪）
- 変更前の値 → 変更後の値
- 増減量（+5、-3など）を色分け表示
- 変更日時（年月日 時分秒）
- 最新100件を表示

### ユーザーロール管理

2つのロールで権限を管理。

- 管理者（admin）: すべての機能にアクセス可能
- ゲスト（guest）: 検索・在庫閲覧・拠点フィルター・一覧の再取得のみ。在庫変更・商品追加編集削除・履歴閲覧・CSV出力は不可

ヘッダーに現在のロールを表示（管理者/ゲスト）。Server Actionsでも権限を確認し、ゲストによる管理者向け操作を拒否します。

## トラブルシューティング / Troubleshooting

### HTTP 500で起動しない

`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が両方設定されているか確認してください。未設定時のデフォルト値はありません。Vercelでは対象環境の設定を確認し、変更後にRedeployしてください。

### ログインできない

ブラウザに入力した認証情報が環境変数の値と一致しているか確認してください。ゲストは`GUEST_AUTH_USER`と`GUEST_AUTH_PASSWORD`の両方が必要です。DBの`User`テーブルへの登録は不要です。ブラウザが古い認証情報を保持している場合は、プライベートウィンドウで再確認してください。

### データベース接続・Prismaエラー

`PRISMA_DATABASE_URL`と`DATABASE_URL`の接続先・値、データベースが利用可能かを確認してください。Prisma Clientの生成エラーには`npx prisma generate`を実行します。テーブル不足の場合は、接続先とスキーマの変更内容を確認してから`npx prisma db push`を実行してください。

### 環境変数やUIの変更が反映されない

VercelのSettings → Environment Variablesで対象環境を確認し、DeploymentsからRedeployしてください。ビルド失敗時はデプロイログで環境変数・型エラー・依存関係の問題を確認します。

`Environment Variable references Secret, which does not exist`が表示される場合は、`vercel.json`の`@secret_name`形式の参照を確認してください。環境変数はVercelダッシュボードで直接設定します。

### 商品画像が表示されない

画像URLが有効か、`next.config.mjs`のリモート画像設定で対象ドメインが許可されているか、フォールバック画像が存在するかを確認してください。

## 動作確認 / Verification

以下は確認項目です。実施済みの結果を示すものではありません。

- [ ] 必須環境変数を設定し、DB接続とビルドを確認
- [ ] 管理者で商品追加・編集・削除、在庫変更、履歴閲覧、CSV出力を確認
- [ ] ゲストで検索・在庫閲覧・拠点フィルター・一覧の再取得を確認
- [ ] ゲストの管理者向け操作がServer Actionsでも拒否されることを確認
- [ ] 商品編集後も既存バリエーションの履歴が残り、編集による在庫変更が記録されることを確認
- [ ] 同じ在庫を複数人で変更し、競合時にメッセージと最新値が表示されることを確認
- [ ] 認証失敗・ログアウト、画像表示・在庫不足表示を確認

## ライセンス / License

MIT

## バージョン履歴 / Version History

### v3.3（未リリース / Unreleased）

- Basic認証のロール判定を修正
- Server Actionsでサーバー側の権限チェックを追加
- デフォルトパスワードを廃止。管理者の認証情報が未設定ならHTTP 500を返す
- 商品編集時に既存バリエーションの在庫変更履歴を保持し、編集による在庫変更も記録
- 楽観ロックで同時更新を検知し、最新値に戻す

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
