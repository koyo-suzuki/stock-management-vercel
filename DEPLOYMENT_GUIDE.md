# Vercel Next.js デプロイガイド

## 概要
Next.jsアプリケーションをVercelにデプロイする際の重要なポイントと、よくある問題の解決方法をまとめたドキュメント。

## 重要なポイント

### 1. 環境変数の命名規則に注意

**問題**: Vercelが自動設定する環境変数名とコード内で参照する環境変数名が一致しない場合、デプロイが失敗する。

**解決策**: コード側の環境変数名を、Vercelで既に設定されている環境変数名に合わせる。

#### Vercel Postgresの場合
Vercelは以下の環境変数を自動設定します：
- `DATABASE_URL`
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`

Prisma schemaで参照する環境変数名をこれに合わせる：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("PRISMA_DATABASE_URL")
  directUrl = env("DATABASE_URL")
}
```

### 2. vercel.jsonでの環境変数参照は避ける

**問題**: vercel.jsonで`"@secret_name"`形式で環境変数を参照すると、Secret設定が必要になり複雑化する。

```json
// ❌ 避けるべき
{
  "env": {
    "BASIC_AUTH_USER": "@basic_auth_user",
    "BASIC_AUTH_PASSWORD": "@basic_auth_password"
  }
}
```

**解決策**: 環境変数はVercelダッシュボードで直接設定し、vercel.jsonには記載しない。

```json
// ✅ 推奨
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 3. 環境変数の設定場所

**Settings** → **Environment Variables** で設定：

1. Production、Preview、Developmentの全環境に設定
2. 設定後は必ず **Redeploy** を実行
3. 機密情報（パスワード、APIキー）は必ず強力なものを使用

### 4. Basic認証の実装（middleware.ts）

Next.jsのmiddleware.tsで実装する場合：

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // api/authは除外する（無限ループ防止）
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const validUsername = process.env.BASIC_AUTH_USER || 'admin';
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      if (authValue) {
        const [user, pwd] = atob(authValue).split(':');
        if (user === validUsername && pwd === validPassword) {
          return NextResponse.next();
        }
      }
    } catch (error) {
      // Invalid auth header format
    }
  }

  // 直接401を返す（rewriteではなく）
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
```

**ポイント**:
- `NextResponse.rewrite()`ではなく、直接401レスポンスを返す
- matcherで`api/auth`を除外して無限ループを防ぐ
- エラーハンドリングを追加（不正な認証ヘッダー対策）

### 5. Prisma設定

package.jsonに必須のスクリプト：

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

これによりVercelビルド時に自動的にPrisma Clientが生成される。

### 6. 日本語UI対応

日本語化した後、Vercelで反映されない場合：
1. バージョン番号を更新してコミット（キャッシュクリア目的）
2. Vercelで明示的にRedeployを実行

## デプロイチェックリスト

- [ ] 環境変数名がVercelの設定と一致しているか確認
- [ ] vercel.jsonに不要なenv設定がないか確認
- [ ] middleware.tsのmatcherが正しく設定されているか確認
- [ ] package.jsonに`postinstall: prisma generate`があるか確認
- [ ] .env.exampleに必要な環境変数が全て記載されているか確認
- [ ] VERCEL_SETUP.mdなどのドキュメントが最新か確認

## トラブルシューティング

### エラー: "Environment Variable references Secret, which does not exist"
**原因**: vercel.jsonで`@secret_name`形式で環境変数を参照している
**解決**: vercel.jsonからenv設定を削除し、Vercelダッシュボードで直接設定

### エラー: データベース接続エラー
**原因**: 環境変数名の不一致
**解決**: Prisma schemaの環境変数名をVercelの設定に合わせる

### エラー: Basic認証が無限ループ
**原因**: middleware.tsのmatcherが`/api/auth`を除外していない
**解決**: matcherパターンを修正

### UIが日本語化されない
**原因**: Vercelのキャッシュ
**解決**: バージョン番号を更新してプッシュ、またはRedeployを実行

## このプロジェクトで実施した対応

### 環境変数の統一
- `POSTGRES_PRISMA_URL` → `PRISMA_DATABASE_URL`
- `POSTGRES_URL_NON_POOLING` → `DATABASE_URL`

これによりVercelが自動設定する環境変数をそのまま使用可能になりました。

### Basic認証の改善
- `/api/auth`へのrewriteから直接401レスポンスに変更
- エラーハンドリングを追加して安定性を向上

### UI日本語化
全てのコンポーネントを日本語化：
- 検索バー、ボタン、タブ
- モーダル内の全ラベル
- エラーメッセージ、ステータス表示
- 入力フィールドのテキスト視認性改善

## 参考資料

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 更新履歴

- 2026-01-16: 初版作成（Vercel環境変数の命名規則、Basic認証実装など）
