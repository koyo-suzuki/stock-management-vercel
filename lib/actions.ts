'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { z } from 'zod';

// Authentication Actions
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function handleSignOut() {
  await signOut();
}

// Product Actions
const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  imageUrl: z.string().optional(),
  variants: z.array(
    z.object({
      color: z.string().min(1, 'Color is required'),
      stockTokyo: z.number().int().min(0),
      stockOsaka: z.number().int().min(0),
      minStock: z.number().int().min(0),
    })
  ).min(1, 'At least one variant is required'),
});

export async function createProduct(data: z.infer<typeof ProductSchema>) {
  try {
    const validated = ProductSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        name: validated.name,
        imageUrl: validated.imageUrl || null,
        variants: {
          create: validated.variants,
        },
      },
      include: {
        variants: true,
      },
    });

    revalidatePath('/dashboard');
    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

// Variant Actions
const UpdateStockSchema = z.object({
  variantId: z.string(),
  field: z.enum(['stockTokyo', 'stockOsaka']),
  value: z.number().int().min(0),
});

export async function updateStock(data: z.infer<typeof UpdateStockSchema>) {
  try {
    const validated = UpdateStockSchema.parse(data);

    const variant = await prisma.productVariant.update({
      where: { id: validated.variantId },
      data: {
        [validated.field]: validated.value,
      },
    });

    revalidatePath('/dashboard');
    return { success: true, variant };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, error: 'Failed to update stock' };
  }
}

// CSV Export Action
export async function exportToCSV() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const rows = [
      ['Product Name', 'Color', 'Tokyo Stock', 'Osaka Stock', 'Total Stock', 'Min Stock'],
    ];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        rows.push([
          product.name,
          variant.color,
          variant.stockTokyo.toString(),
          variant.stockOsaka.toString(),
          (variant.stockTokyo + variant.stockOsaka).toString(),
          variant.minStock.toString(),
        ]);
      });
    });

    const csv = rows.map(row => row.join(',')).join('\n');
    return { success: true, csv };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return { success: false, error: 'Failed to export CSV' };
  }
}

// Get all products with variants
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
