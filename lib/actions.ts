'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { isAdmin } from './auth';

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
  if (!(await isAdmin())) return { success: false, error: '権限がありません' };

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

const UpdateProductSchema = ProductSchema.extend({
  productId: z.string().min(1, 'Product ID is required'),
  variants: z.array(
    ProductSchema.shape.variants.element.extend({
      id: z.string().min(1).optional(),
    })
  ).min(1, 'At least one variant is required'),
}).superRefine((data, ctx) => {
  const colors = new Set<string>();
  const ids = new Set<string>();
  data.variants.forEach((variant, index) => {
    if (colors.has(variant.color)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['variants', index, 'color'],
        message: '同じ色が重複しています',
      });
    }
    colors.add(variant.color);
    if (variant.id && ids.has(variant.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['variants', index, 'id'],
        message: '同じバリエーションが重複しています',
      });
    }
    if (variant.id) ids.add(variant.id);
  });
});

export async function updateProduct(data: z.infer<typeof UpdateProductSchema>) {
  if (!(await isAdmin())) return { success: false, error: '権限がありません' };

  try {
    const product = await prisma.$transaction(async (tx) => {
      const validated = UpdateProductSchema.parse(data);
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: validated.productId },
      });
      const existingById = new Map(existingVariants.map(variant => [variant.id, variant]));
      const retainedIds = validated.variants.flatMap(variant => variant.id ? [variant.id] : []);

      if (retainedIds.some(id => !existingById.has(id))) {
        throw new Error('指定されたバリエーションはこの商品に属していません');
      }

      await tx.productVariant.deleteMany({
        where: { productId: validated.productId, id: { notIn: retainedIds } },
      });

      // 色の交換も可能にするため、変更対象を未使用の一時色へ移す。
      const reservedColors = new Set([
        ...existingVariants.map(variant => variant.color),
        ...validated.variants.map(variant => variant.color),
      ]);
      for (const variant of validated.variants) {
        if (!variant.id || existingById.get(variant.id)!.color === variant.color) continue;
        let temporaryColor = `__temporary_${variant.id}`;
        while (reservedColors.has(temporaryColor)) temporaryColor += '_';
        reservedColors.add(temporaryColor);
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { color: temporaryColor },
        });
      }

      for (const variant of validated.variants) {
        const { id, ...values } = variant;
        if (id) {
          const previous = existingById.get(id)!;
          await tx.productVariant.update({ where: { id }, data: values });
          for (const field of ['stockTokyo', 'stockOsaka'] as const) {
            if (previous[field] !== values[field]) {
              await tx.stockHistory.create({
                data: { variantId: id, field, oldValue: previous[field], newValue: values[field] },
              });
            }
          }
        } else {
          await tx.productVariant.create({
            data: { productId: validated.productId, ...values },
          });
        }
      }

      return tx.product.update({
        where: { id: validated.productId },
        data: { name: validated.name, imageUrl: validated.imageUrl || null },
        include: { variants: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    revalidatePath('/dashboard');
    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: '同じ色が既に存在します' };
      }
      if (error.code === 'P2034') {
        return { success: false, error: '他のユーザーが先に更新しました。再読み込みしてからやり直してください' };
      }
    }
    if (error instanceof Error && error.message === '指定されたバリエーションはこの商品に属していません') {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(productId: string) {
  if (!(await isAdmin())) return { success: false, error: '権限がありません' };

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
  variantId: z.string().min(1),
  field: z.enum(['stockTokyo', 'stockOsaka']),
  value: z.number().int().min(0),
  expectedValue: z.number().int().min(0),
});

export async function updateStock(data: z.infer<typeof UpdateStockSchema>) {
  if (!(await isAdmin())) return { success: false as const, error: '権限がありません' };

  try {
    const validated = UpdateStockSchema.parse(data);
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.updateMany({
        where: { id: validated.variantId, [validated.field]: validated.expectedValue },
        data: { [validated.field]: validated.value },
      });

      if (updated.count === 0) {
        const currentVariant = await tx.productVariant.findUnique({
          where: { id: validated.variantId },
        });
        if (!currentVariant) {
          return { success: false as const, error: 'Variant not found' };
        }
        return {
          success: false as const,
          conflict: true as const,
          currentValue: currentVariant[validated.field],
          error: '他のユーザーが先に更新しました',
        };
      }

      await tx.stockHistory.create({
        data: {
          variantId: validated.variantId,
          field: validated.field,
          oldValue: validated.expectedValue,
          newValue: validated.value,
        },
      });
      const variant = await tx.productVariant.findUniqueOrThrow({
        where: { id: validated.variantId },
      });
      return { success: true as const, variant };
    });

    if (result.success) revalidatePath('/dashboard');
    return result;
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false as const, error: 'Failed to update stock' };
  }
}

// CSV Export Action
export async function exportToCSV() {
  if (!(await isAdmin())) return { success: false, error: '権限がありません' };

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

// Get stock history
export async function getStockHistory(limit: number = 50) {
  if (!(await isAdmin())) return [];

  try {
    const history = await prisma.stockHistory.findMany({
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return history;
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return [];
  }
}
