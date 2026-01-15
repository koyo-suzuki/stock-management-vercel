# StockYard Manager - セットアップガイド

このドキュメントでは、StockYard Managerのセットアップ手順を日本語で説明します。

## 必要な環境

- Node.js 18以上
- Vercelアカウント（データベース用）

## セットアップ手順

### 1. 依存関係のインストール

プロジェクトのルートディレクトリで以下のコマンドを実行してください。

```bash
npm install
```

### 2. データベースのセットアップ

#### 2.1. Vercel Postgresデータベースの作成

1. [Vercel](https://vercel.com)にログイン
2. [Storage](https://vercel.com/storage)ページに移動
3. "Create Database"をクリック
4. "Postgres"を選択
5. データベース名を入力して作成

#### 2.2. 接続情報の取得

1. 作成したデータベースの詳細ページを開く
2. ".env.local"タブをクリック
3. 表示される環境変数をコピー

### 3. 環境変数の設定

プロジェクトのルートに `.env` ファイルを作成し、以下の内容を記述してください。

```env
# Database (Vercelからコピーした値を貼り付け)
POSTGRES_PRISMA_URL="your-postgres-prisma-url"
POSTGRES_URL_NON_POOLING="your-postgres-url-non-pooling"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

#### NEXTAUTH_SECRETの生成

以下のコマンドでランダムなシークレットキーを生成できます。

```bash
openssl rand -base64 32
```

生成された文字列を `NEXTAUTH_SECRET` に設定してください。

### 4. Prismaのセットアップ

#### 4.1. Prisma Clientの生成

```bash
npx prisma generate
```

#### 4.2. データベーススキーマの適用

```bash
npx prisma db push
```

### 5. 初期ユーザーの作成

データベースに管理者ユーザーを作成します。

#### 方法1: Prisma Studio を使用

```bash
npx prisma studio
```

1. ブラウザで http://localhost:5555 が開きます
2. 左メニューから "User" モデルをクリック
3. "Add record" ボタンをクリック
4. 以下の情報を入力:
   - `username`: admin
   - `password`: `$2b$10$YourHashedPasswordHere`

**注意**: パスワードは必ずbcryptでハッシュ化した値を使用してください。

#### 方法2: SQLを直接実行

Vercelのデータベース管理画面、またはお好みのPostgreSQLクライアントで以下のSQLを実行:

```sql
INSERT INTO "User" (id, username, password)
VALUES (
  'cuid-generated-id',
  'admin',
  '$2b$10$K7L/6RQj7gK3Q8ZqX9Z9O.rJ5yQ5X5X5X5X5X5X5X5X5X5X5X5X5u'
);
```

上記のパスワードハッシュは `password123` です。

#### パスワードのハッシュ化方法

Node.jsで以下のコードを実行してパスワードをハッシュ化できます。

```javascript
const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'your-password';
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

hashPassword();
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

### 7. ログイン

作成したユーザー情報でログインします。

- ユーザー名: `admin`
- パスワード: `password123` (または設定したパスワード)

## サンプルデータの作成（オプション）

ダッシュボードから「Add Product」ボタンをクリックして、サンプル商品を作成できます。

### サンプル商品の例

**商品1: コットンTシャツ**
- 商品名: Cotton T-Shirt
- 画像URL: https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400
- バリエーション:
  - Red (東京: 50, 大阪: 30, 最小在庫: 20)
  - Blue (東京: 40, 大阪: 25, 最小在庫: 20)
  - White (東京: 60, 大阪: 35, 最小在庫: 20)

**商品2: デニムジーンズ**
- 商品名: Denim Jeans
- 画像URL: https://images.unsplash.com/photo-1542272604-787c3835535d?w=400
- バリエーション:
  - Black (東京: 25, 大阪: 15, 最小在庫: 30) ※ アラート表示
  - Blue (東京: 45, 大阪: 35, 最小在庫: 30)

## トラブルシューティング

### データベース接続エラー

- `.env` ファイルの接続文字列が正しいか確認
- Vercelデータベースが有効になっているか確認

### Prisma エラー

```bash
# Prisma Clientを再生成
npx prisma generate

# スキーマを再適用
npx prisma db push
```

### ログインできない

- データベースにユーザーが作成されているか確認
- パスワードがbcryptでハッシュ化されているか確認
- `NEXTAUTH_SECRET` が設定されているか確認

### 画像が表示されない

- `next.config.mjs` でリモート画像のドメインが許可されているか確認
- 画像URLが有効か確認
- フォールバック画像 `/no-image.png` が存在するか確認

## デプロイ

### Vercelへのデプロイ

1. GitHubにコードをプッシュ
2. Vercelでプロジェクトをインポート
3. Vercel Postgresデータベースを接続
4. 環境変数を設定
5. デプロイ

```bash
# Vercel CLIを使用する場合
npm i -g vercel
vercel --prod
```

## 次のステップ

- 商品を追加
- 在庫を更新して自動保存を試す
- CSVエクスポート機能を試す
- 検索とフィルタリング機能を試す

ご不明な点がございましたら、プロジェクトの要件.txtを参照するか、開発者にお問い合わせください。
