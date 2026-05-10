import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, desc, ilike } from "drizzle-orm";

const serviceInput = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  defaultPrice: z.number().positive("Price must be positive"),
  estimatedTime: z.number().optional(),
  isActive: z.boolean().default(true),
});

export const servicesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      let query = db.select().from(services).orderBy(services.category, services.name);

      if (input.activeOnly) {
        query = query.where(eq(services.isActive, true)) as typeof query;
      }

      if (input.category) {
        query = query.where(eq(services.category, input.category)) as typeof query;
      }

      return query;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, input.id))
        .limit(1);

      if (!service) {
        throw new Error("Service not found");
      }

      return service;
    }),

  create: protectedProcedure.input(serviceInput).mutation(async ({ input }) => {
    const [service] = await db
      .insert(services)
      .values({
        ...input,
        defaultPrice: input.defaultPrice.toFixed(2),
      })
      .returning();
    return service;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(serviceInput.partial()))
    .mutation(async ({ input }) => {
      const { id, defaultPrice, ...data } = input;
      const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
      if (defaultPrice !== undefined) {
        updateData.defaultPrice = defaultPrice.toFixed(2);
      }

      const [service] = await db
        .update(services)
        .set(updateData)
        .where(eq(services.id, id))
        .returning();
      return service;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(services)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(services.id, input.id));
      return { success: true };
    }),

  getCategories: protectedProcedure.query(async () => {
    const categories = await db
      .selectDistinct({ category: services.category })
      .from(services)
      .where(eq(services.isActive, true));

    return categories
      .map((c) => c.category)
      .filter((c): c is string => c !== null);
  }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      if (!input.query || input.query.length < 2) return [];

      return db
        .select()
        .from(services)
        .where(ilike(services.name, `%${input.query}%`))
        .limit(10);
    }),
});
