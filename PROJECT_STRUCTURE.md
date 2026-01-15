# Project Structure

StockYard Manager v3.1 のプロジェクト構成について説明します。

## ディレクトリ構造

```
stockyard-manager/
├── app/                        # Next.js App Router
│   ├── dashboard/              # ダッシュボード
│   │   ├── layout.tsx          # ダッシュボードレイアウト
│   │   └── page.tsx            # ダッシュボードページ
│   ├── login/                  # ログイン
│   │   └── page.tsx            # ログインページ
│   ├── globals.css             # グローバルスタイル
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # ホームページ（ダッシュボードへリダイレクト）
│
├── components/                 # Reactコンポーネント
│   ├── CreateProductModal.tsx  # 商品作成モーダル
│   ├── DashboardContent.tsx    # ダッシュボードメインコンテンツ
│   ├── ProductList.tsx         # 商品一覧
│   ├── ProductRow.tsx          # 商品行
│   └── VariantRow.tsx          # バリエーション行（在庫編集）
│
├── lib/                        # ユーティリティ & サーバーアクション
│   ├── actions.ts              # Server Actions（認証、CRUD、CSV）
│   └── prisma.ts               # Prisma Clientシングルトン
│
├── prisma/                     # Prismaスキーマ
│   └── schema.prisma           # データベーススキーマ定義
│
├── public/                     # 静的ファイル
│   └── no-image.png            # フォールバック画像
│
├── scripts/                    # ユーティリティスクリプト
│   └── seed.ts                 # データベースシードスクリプト
│
├── auth.ts                     # NextAuth設定
├── auth.config.ts              # NextAuth設定（分離）
├── middleware.ts               # 認証ミドルウェア
├── next.config.mjs             # Next.js設定
├── tailwind.config.ts          # Tailwind CSS設定
├── tsconfig.json               # TypeScript設定
└── package.json                # 依存関係とスクリプト
```

## 主要ファイルの役割

### App Router

#### `app/layout.tsx`
- ルートレイアウト
- グローバルCSS読み込み
- Toasterコンポーネント配置

#### `app/dashboard/layout.tsx`
- ダッシュボード専用レイアウト
- ヘッダー（ロゴ、ユーザー名、ログアウトボタン）
- 認証チェック

#### `app/dashboard/page.tsx`
- ダッシュボードのメインページ
- DashboardContentコンポーネントをレンダリング
- URLパラメータ（検索、フィルタ）を受け取る

#### `app/login/page.tsx`
- ログインフォーム
- NextAuthのCredentialsプロバイダーと連携

### Components

#### `DashboardContent.tsx` (Client Component)
- ダッシュボードのメインUI
- 検索バー
- 拠点フィルタータブ（All/Tokyo/Osaka）
- 商品追加ボタン
- CSVエクスポートボタン
- CreateProductModalの制御

#### `ProductList.tsx` (Client Component)
- 商品一覧の表示
- データ取得（useEffect）
- 検索フィルタリング
- ローディング状態
- 空状態の表示

#### `ProductRow.tsx` (Client Component)
- 商品カード
- 商品画像、名前、バリエーション数
- 展開/折りたたみ機能
- 削除ボタン
- VariantRowのコンテナ

#### `VariantRow.tsx` (Client Component)
- バリエーション（色）の行
- 在庫数の編集（Tokyo/Osaka）
- **Optimistic UI**: 即座にUI更新
- **Auto-Save**: onBlurでServer Action実行
- 在庫アラート表示

#### `CreateProductModal.tsx` (Client Component)
- 商品作成モーダル
- 商品情報入力（名前、画像URL）
- バリエーション動的追加
- フォーム送信とバリデーション

### Server Actions (`lib/actions.ts`)

すべてのデータ操作は Server Actions で実装:

- `authenticate()` - ログイン処理
- `handleSignOut()` - ログアウト処理
- `createProduct()` - 商品作成（ネストされたバリエーション含む）
- `deleteProduct()` - 商品削除（カスケード）
- `updateStock()` - 在庫更新（Optimistic UI用）
- `exportToCSV()` - CSV出力
- `getProducts()` - 商品一覧取得

### 認証

#### `auth.ts`
- NextAuth設定
- Credentialsプロバイダー
- bcryptによるパスワード検証

#### `auth.config.ts`
- 認証コールバック
- ページリダイレクト設定

#### `middleware.ts`
- 全ルートで認証チェック
- 未認証ユーザーを `/login` へリダイレクト

### データベース

#### `prisma/schema.prisma`
3つのモデル:

1. **User** - 認証用ユーザー
2. **Product** - 商品（親）
3. **ProductVariant** - バリエーション（子、1対多リレーション）

#### `lib/prisma.ts`
- Prisma Clientのシングルトンインスタンス
- 開発時のホットリロード対応

## データフロー

### 在庫更新フロー（Optimistic UI）

```
1. ユーザーが在庫数を変更
   ↓
2. VariantRow: ローカル状態を即座に更新（Optimistic）
   ↓
3. onBlur時に updateStock() Server Action を実行
   ↓
4. Server Actionがデータベースを更新
   ↓
5. 成功: そのまま
   失敗: ローカル状態を元に戻し、トースト表示
```

### 商品作成フロー

```
1. CreateProductModal: フォーム入力
   ↓
2. バリデーション（Zod）
   ↓
3. createProduct() Server Action
   ↓
4. Prisma: Product + ProductVariant を1トランザクションで作成
   ↓
5. revalidatePath('/dashboard') でページ再取得
   ↓
6. ProductList が自動的に更新される
```

## 技術的特徴

### Server Components vs Client Components

- **Server Components**: データ取得が必要な部分（最小限）
- **Client Components**: インタラクティブなUI（ほとんど）

この設計により、Server Actions を使いながらリッチなUIを実現。

### Auto-Save実装

```typescript
// VariantRow.tsx
<input
  onBlur={(e) => handleStockUpdate('stockTokyo', parseInt(e.target.value))}
/>
```

`onBlur` イベントで自動保存。保存ボタン不要。

### Optimistic UI実装

```typescript
// 1. 即座にローカル状態を更新
setTokyoStock(value);

// 2. Server Actionを実行
const result = await updateStock(...);

// 3. エラー時のみ元に戻す
if (!result.success) {
  setTokyoStock(variant.stockTokyo);
}
```

### 型安全性

- TypeScript 完全対応
- Prisma による型生成
- Zod によるランタイムバリデーション

## スタイリング

- **Tailwind CSS** のみ使用
- カスタムコンポーネントライブラリなし
- レスポンシブデザイン対応

## セキュリティ

- NextAuth.js による認証
- bcrypt によるパスワードハッシュ化
- Middleware による全ルート保護
- SQL Injection 対策（Prisma ORM）

## パフォーマンス

- Server Components でサーバーサイドレンダリング
- 画像の遅延読み込み（next/image）
- Optimistic UI でユーザー体験向上

## 拡張性

このアーキテクチャは以下の拡張が容易:

- 新しい拠点の追加（モデルフィールド追加）
- バリエーション属性の追加（サイズなど）
- 在庫移動機能
- 在庫履歴追跡
- ユーザーロール管理
- API エンドポイント追加
