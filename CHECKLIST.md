# Implementation Checklist

StockYard Manager v3.1 の実装チェックリスト

## ✅ 完了項目

### 技術スタック
- [x] Next.js 14+ (App Router)
- [x] TypeScript
- [x] Tailwind CSS
- [x] Vercel Postgres (PostgreSQL) 対応
- [x] Prisma ORM
- [x] NextAuth.js v5 (Credentials Provider)
- [x] Lucide React (アイコン)
- [x] Zod (バリデーション)
- [x] React Hot Toast (通知)

### データモデル
- [x] User モデル（認証）
- [x] Product モデル（商品親データ）
- [x] ProductVariant モデル（バリエーション・在庫）
- [x] 1対多リレーション（Product → ProductVariant）
- [x] Cascade Delete 設定
- [x] @@unique 制約（productId, color）

### 認証機能
- [x] ログインページ
- [x] ユーザー名・パスワード認証
- [x] bcrypt によるパスワードハッシュ化
- [x] Middleware による認証保護
- [x] ログアウト機能
- [x] 未認証時のリダイレクト

### ダッシュボード
- [x] レイアウト（ヘッダー、メインコンテンツ）
- [x] 商品一覧表示
- [x] 商品ごとにバリエーションをネスト表示
- [x] 商品画像表示
- [x] 画像フォールバック機能

### フィルタリング & 検索
- [x] テキスト検索（商品名）
- [x] 拠点タブ切り替え（All / Tokyo / Osaka）
- [x] URLパラメータによる状態管理

### 在庫編集（コア機能）
- [x] 数値入力による直接編集
- [x] Auto-Save（onBlur イベント）
- [x] Optimistic UI 実装
- [x] エラー時のロールバック
- [x] トースト通知

### アラート機能
- [x] 在庫不足検出（totalStock < minStock）
- [x] 赤色背景で強調表示
- [x] アラートアイコン表示

### 商品管理（CRUD）
- [x] 商品作成モーダル
- [x] 商品名・画像URL入力
- [x] バリエーション動的追加
- [x] ネストされた作成（Product + Variants）
- [x] 商品削除（Cascade Delete）
- [x] バリデーション（Zod）

### ユーティリティ
- [x] CSV エクスポート機能
- [x] Server Action による実装

### 開発ガイドライン
- [x] Server Actions のみ使用（API Routes なし）
- [x] Suspense & Skeleton 対応
- [x] Server/Client Components の適切な分離
  - [x] ProductList (Client)
  - [x] ProductRow (Client)
  - [x] VariantRow (Client)
  - [x] DashboardContent (Client)
  - [x] CreateProductModal (Client)

### UI/UX
- [x] レスポンシブデザイン
- [x] ローディング状態表示
- [x] 空状態の表示
- [x] エラーハンドリング
- [x] トースト通知

### セットアップ & ドキュメント
- [x] README.md
- [x] SETUP.md（詳細セットアップガイド）
- [x] QUICKSTART.md（クイックスタート）
- [x] PROJECT_STRUCTURE.md（プロジェクト構造）
- [x] .env.example
- [x] Database Seed Script
- [x] package.json スクリプト

### 設定ファイル
- [x] tsconfig.json
- [x] tailwind.config.ts
- [x] next.config.mjs（画像設定含む）
- [x] postcss.config.mjs
- [x] .gitignore
- [x] .eslintrc.json

## 🎯 主要機能の動作確認

### 認証
- [ ] ログイン成功
- [ ] ログイン失敗時のエラー表示
- [ ] ログアウト
- [ ] 未認証時のリダイレクト

### 商品管理
- [ ] 商品作成（複数バリエーション）
- [ ] 商品削除
- [ ] 画像表示（正常・フォールバック）

### 在庫管理
- [ ] 在庫数変更（Auto-Save）
- [ ] Optimistic UI の動作
- [ ] エラー時のロールバック

### フィルタリング
- [ ] テキスト検索
- [ ] 拠点フィルタ（Tokyo/Osaka/All）

### アラート
- [ ] 在庫不足時の赤色表示

### CSV
- [ ] CSV エクスポート

## 📋 デプロイ前チェック

- [ ] 環境変数が正しく設定されている
- [ ] データベース接続が成功する
- [ ] Prisma migration/push 完了
- [ ] 初期ユーザーが作成されている
- [ ] ビルドエラーがない (`npm run build`)
- [ ] 型エラーがない
- [ ] ESLint エラーがない

## 🚀 デプロイ手順

1. [ ] Vercel にプロジェクトをインポート
2. [ ] Vercel Postgres を接続
3. [ ] 環境変数を設定
4. [ ] デプロイ実行
5. [ ] 本番環境で動作確認

## 📝 追加検討事項（オプション）

- [ ] ユニットテスト（Jest + React Testing Library）
- [ ] E2Eテスト（Playwright）
- [ ] 在庫履歴追跡
- [ ] 在庫移動機能
- [ ] ユーザーロール管理
- [ ] ダークモード
- [ ] 多言語対応

## ✨ 完了

すべての要件を満たしています！

次のステップ:
1. データベースをセットアップ
2. `npm install` で依存関係をインストール
3. `npm run seed` でサンプルデータを投入
4. `npm run dev` で開発サーバーを起動
5. http://localhost:3000 にアクセス
