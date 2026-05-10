import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { products, stockMovements } from "@/lib/db/schema";
import { eq, desc, sql, ilike, or, lte, and } from "drizzle-orm";

const productInput = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().default("pc"),
  costPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  stockQuantity: z.number().default(0),
  minStockLevel: z.number().default(5),
  maxStockLevel: z.number().optional(),
  reorderPoint: z.number().default(10),
});

export const inventoryRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        lowStockOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(products.isActive, true)];

      if (input.search) {
        conditions.push(
          or(
            ilike(products.name, `%${input.search}%`),
            ilike(products.sku, `%${input.search}%`)
          )!
        );
      }

      if (input.category) {
        conditions.push(eq(products.category, input.category));
      }

      if (input.lowStockOnly) {
        conditions.push(lte(products.stockQuantity, products.minStockLevel));
      }

      return db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(products.name);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      if (!product) {
        throw new Error("Product not found");
      }

      const movements = await db
        .select()
        .from(stockMovements)
        .where(eq(stockMovements.productId, input.id))
        .orderBy(desc(stockMovements.createdAt))
        .limit(20);

      return { ...product, movements };
    }),

  create: protectedProcedure.input(productInput).mutation(async ({ input }) => {
    const [product] = await db
      .insert(products)
      .values({
        ...input,
        costPrice: input.costPrice.toFixed(2),
        sellingPrice: input.sellingPrice.toFixed(2),
      })
      .returning();
    return product;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(productInput.partial()))
    .mutation(async ({ input }) => {
      const { id, costPrice, sellingPrice, ...data } = input;
      const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
      if (costPrice !== undefined) updateData.costPrice = costPrice.toFixed(2);
      if (sellingPrice !== undefined) updateData.sellingPrice = sellingPrice.toFixed(2);

      const [product] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();
      return product;
    }),

  adjustStock: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number(),
        type: z.enum(["in", "out", "adjustment"]),
        reference: z.string().optional(),
        notes: z.string().optional(),
        jobId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product) {
        throw new Error("Product not found");
      }

      // Record the movement
      await db.insert(stockMovements).values({
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        reference: input.reference,
        notes: input.notes,
        jobId: input.jobId,
      });

      // Update stock quantity
      let newQuantity = product.stockQuantity;
      if (input.type === "in") {
        newQuantity += input.quantity;
      } else if (input.type === "out") {
        newQuantity -= input.quantity;
      } else {
        newQuantity = input.quantity;
      }

      const [updatedProduct] = await db
        .update(products)
        .set({
          stockQuantity: Math.max(0, newQuantity),
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId))
        .returning();

      return updatedProduct;
    }),

  getLowStock: protectedProcedure.query(async () => {
    return db
      .select()
      .from(products)
      .where(
        sql`${products.stockQuantity} <= ${products.minStockLevel} AND ${products.isActive} = true`
      )
      .orderBy(products.name);
  }),

  getCategories: protectedProcedure.query(async () => {
    const categories = await db
      .selectDistinct({ category: products.category })
      .from(products)
      .where(eq(products.isActive, true));

    return categories
      .map((c) => c.category)
      .filter((c): c is string => c !== null);
  }),
});
