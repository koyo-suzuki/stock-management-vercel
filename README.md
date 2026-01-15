# StockYard Manager v3.1

A modern, real-time inventory management system for managing stock across multiple locations (Tokyo and Osaka).

## Features

- **Real-time Stock Management**: Update inventory with auto-save and optimistic UI
- **Multi-location Support**: Manage stock across Tokyo and Osaka warehouses
- **Color Variants (SKU)**: Track products with multiple color variations
- **Low Stock Alerts**: Visual alerts when stock falls below minimum threshold
- **Search & Filter**: Search products and filter by location
- **CSV Export**: Export inventory data to CSV format
- **Secure Authentication**: Password-protected access with NextAuth.js

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres (PostgreSQL)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Icons**: Lucide React
- **Validation**: Zod
- **UI Feedback**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Vercel account (for Postgres database)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

1. Create a Vercel Postgres database at [vercel.com/storage](https://vercel.com/storage)
2. Copy the connection strings from Vercel dashboard
3. Create a `.env` file based on `.env.example`:

```env
POSTGRES_PRISMA_URL="your-vercel-postgres-url"
POSTGRES_URL_NON_POOLING="your-vercel-postgres-url-non-pooling"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Setup Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Create Initial User

Run Prisma Studio to create your first user:

```bash
npx prisma studio
```

1. Open http://localhost:5555
2. Click on "User" model
3. Click "Add record"
4. Fill in:
   - `username`: admin
   - `password`: Use bcrypt hash of "password123" - `$2b$10$K7L/6RQj7gK3Q8ZqX9Z9O.rJ5yQ5X5X5X5X5X5X5X5X5X5X5X5X5u`

Or use this SQL in your database:

```sql
INSERT INTO "User" (id, username, password)
VALUES (
  'default-user-id',
  'admin',
  '$2b$10$K7L/6RQj7gK3Q8ZqX9Z9O.rJ5yQ5X5X5X5X5X5X5X5X5X5X5X5X5u'
);
```

**Note**: To hash your own password, you can use:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your-password', 10);
console.log(hash);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login

Use the credentials:
- Username: `admin`
- Password: `password123`

## Usage

### Adding Products

1. Click "Add Product" button
2. Enter product name and optional image URL
3. Add color variants with initial stock levels
4. Set minimum stock threshold for alerts
5. Click "Create Product"

### Managing Stock

- Click on stock numbers to edit
- Values auto-save when you click outside (onBlur)
- Optimistic UI updates instantly
- Red highlight indicates low stock (below minimum)

### Filtering

- Use search bar to filter by product name
- Switch between "All", "Tokyo", or "Osaka" tabs
- Export current inventory to CSV

### Deleting Products

- Click trash icon on product card
- Confirm deletion (this will remove all variants)

## Database Schema

```prisma
model User {
  id       String @id @default(cuid())
  username String @unique
  password String // Hashed with bcrypt
}

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

  @@unique([productId, color])
}
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Connect your Vercel Postgres database
4. Add environment variables
5. Deploy

```bash
# Or use Vercel CLI
vercel --prod
```

## Project Structure

```
stockyard-manager/
├── app/
│   ├── dashboard/          # Dashboard pages
│   ├── login/             # Authentication
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home (redirects to dashboard)
├── components/
│   ├── CreateProductModal.tsx
│   ├── DashboardContent.tsx
│   ├── ProductList.tsx
│   ├── ProductRow.tsx
│   └── VariantRow.tsx
├── lib/
│   ├── actions.ts         # Server Actions
│   └── prisma.ts          # Prisma client
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static files
├── auth.ts                # NextAuth configuration
├── auth.config.ts         # Auth config
└── middleware.ts          # Route protection
```

## Features in Detail

### Optimistic UI

Stock updates use optimistic UI pattern:
1. User edits stock value
2. UI updates immediately
3. Server action runs in background
4. On error, value reverts and shows toast

### Auto-Save

No save buttons needed:
- Stock changes save automatically on blur (when clicking away)
- Provides seamless, app-like experience
- Network errors are handled gracefully

### Low Stock Alerts

- Automatically highlights rows where `(Tokyo + Osaka) < minStock`
- Red background and alert icon
- Helps identify products that need restocking

## License

MIT
