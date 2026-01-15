-- StockYard Manager データベースセットアップSQL
-- Vercel Postgres の Query タブで実行してください

-- User テーブル作成
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL
);

-- Product テーブル作成
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ProductVariant テーブル作成
CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "stockTokyo" INTEGER NOT NULL DEFAULT 0,
    "stockOsaka" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductVariant_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique制約を追加
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_productId_color_key"
    ON "ProductVariant"("productId", "color");

-- 初期管理ユーザーを作成
-- ユーザー名: admin
-- パスワード: password123
INSERT INTO "User" ("id", "username", "password")
VALUES (
    'cldefault00001',
    'admin',
    '$2b$10$K7L/vJH4Q8ZqX9Z9O.rJ5yPxQXvXvXvXvXvXvXvXvXvXvXvXvXvXu'
)
ON CONFLICT ("username") DO NOTHING;

-- サンプルデータ1: Cotton T-Shirt
INSERT INTO "Product" ("id", "name", "imageUrl", "createdAt", "updatedAt")
VALUES (
    'product001',
    'Cotton T-Shirt',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductVariant" ("id", "productId", "color", "stockTokyo", "stockOsaka", "minStock")
VALUES
    ('variant001', 'product001', 'Red', 50, 30, 20),
    ('variant002', 'product001', 'Blue', 40, 25, 20),
    ('variant003', 'product001', 'White', 60, 35, 20)
ON CONFLICT ("id") DO NOTHING;

-- サンプルデータ2: Denim Jeans
INSERT INTO "Product" ("id", "name", "imageUrl", "createdAt", "updatedAt")
VALUES (
    'product002',
    'Denim Jeans',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductVariant" ("id", "productId", "color", "stockTokyo", "stockOsaka", "minStock")
VALUES
    ('variant004', 'product002', 'Black', 25, 15, 50),  -- Low stock alert
    ('variant005', 'product002', 'Blue', 45, 35, 30)
ON CONFLICT ("id") DO NOTHING;

-- サンプルデータ3: Hoodie
INSERT INTO "Product" ("id", "name", "imageUrl", "createdAt", "updatedAt")
VALUES (
    'product003',
    'Hoodie',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductVariant" ("id", "productId", "color", "stockTokyo", "stockOsaka", "minStock")
VALUES
    ('variant006', 'product003', 'Gray', 70, 50, 40),
    ('variant007', 'product003', 'Navy', 55, 45, 40),
    ('variant008', 'product003', 'Black', 80, 60, 40)
ON CONFLICT ("id") DO NOTHING;

-- 確認用クエリ
SELECT 'Setup completed!' as status;
SELECT * FROM "User";
SELECT p.name, pv.color, pv."stockTokyo", pv."stockOsaka", pv."minStock"
FROM "Product" p
JOIN "ProductVariant" pv ON p.id = pv."productId"
ORDER BY p.name, pv.color;
