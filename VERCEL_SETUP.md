# Vercelデプロイ手順

## 1. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com)にログイン
2. "Add New" → "Project"を選択
3. GitHubリポジトリをインポート

## 2. 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加してください：

**Settings** → **Environment Variables** で以下を設定：

### データベース接続（Vercel Postgresを使用している場合は自動設定されます）
```
PRISMA_DATABASE_URL=your-prisma-database-url
DATABASE_URL=your-database-url
```

**注意**: Vercel Postgresを既に接続している場合、`DATABASE_URL`、`POSTGRES_URL`、`PRISMA_DATABASE_URL`は自動的に設定されています。追加設定は不要です。

### Basic認証（必須）
以下の2つの環境変数を追加してください：
```
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your-secure-password
```

**重要事項:**
- `BASIC_AUTH_PASSWORD`は必ず強力なパスワードに変更してください
- 環境変数を追加後、**Redeploy**が必要です
- Production、Preview、Developmentの全環境に設定してください

## 3. ビルド設定

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 4. データベースのセットアップ

デプロイ後、初回のみ以下のコマンドを実行してください：

```bash
# Prismaスキーマをデータベースに同期
npx prisma db push

# サンプルデータを投入（オプション）
npm run seed
```

## 5. アクセス方法

1. デプロイが完了したら、VercelのURLにアクセス
2. Basic認証のプロンプトが表示されます
3. 設定した`BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`を入力

## トラブルシューティング

### 環境変数が反映されない
- Vercelの設定で環境変数を追加後、再デプロイが必要です
- "Deployments" → 最新のデプロイ → "Redeploy"

### データベース接続エラー
- `POSTGRES_PRISMA_URL`と`POSTGRES_URL_NON_POOLING`が正しく設定されているか確認
- Vercel Postgresを使用している場合、自動的に環境変数が設定されます

### Basic認証が動作しない
- `BASIC_AUTH_USER`と`BASIC_AUTH_PASSWORD`が設定されているか確認
- ブラウザのキャッシュをクリアしてみてください
