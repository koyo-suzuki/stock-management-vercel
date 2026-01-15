/**
 * Database Seed Script
 * Run with: npx tsx scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create default user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log('✓ Created user:', user.username);

  // Create sample products
  const products = [
    {
      name: 'Cotton T-Shirt',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      variants: [
        { color: 'Red', stockTokyo: 50, stockOsaka: 30, minStock: 20 },
        { color: 'Blue', stockTokyo: 40, stockOsaka: 25, minStock: 20 },
        { color: 'White', stockTokyo: 60, stockOsaka: 35, minStock: 20 },
      ],
    },
    {
      name: 'Denim Jeans',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      variants: [
        { color: 'Black', stockTokyo: 25, stockOsaka: 15, minStock: 50 }, // Low stock alert
        { color: 'Blue', stockTokyo: 45, stockOsaka: 35, minStock: 30 },
      ],
    },
    {
      name: 'Hoodie',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      variants: [
        { color: 'Gray', stockTokyo: 70, stockOsaka: 50, minStock: 40 },
        { color: 'Navy', stockTokyo: 55, stockOsaka: 45, minStock: 40 },
        { color: 'Black', stockTokyo: 80, stockOsaka: 60, minStock: 40 },
      ],
    },
    {
      name: 'Sneakers',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      variants: [
        { color: 'White', stockTokyo: 100, stockOsaka: 80, minStock: 50 },
        { color: 'Black', stockTokyo: 90, stockOsaka: 70, minStock: 50 },
        { color: 'Red', stockTokyo: 30, stockOsaka: 20, minStock: 60 }, // Low stock alert
      ],
    },
  ];

  for (const productData of products) {
    const { variants, ...productInfo } = productData;

    const product = await prisma.product.create({
      data: {
        ...productInfo,
        variants: {
          create: variants,
        },
      },
      include: {
        variants: true,
      },
    });

    console.log(`✓ Created product: ${product.name} with ${product.variants.length} variants`);
  }

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  Username: admin');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
