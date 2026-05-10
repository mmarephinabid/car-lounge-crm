import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { customers, vehicles } from "@/lib/db/schema";
import { eq, ilike, or, desc, count, sql } from "drizzle-orm";

const customerInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  emiratesId: z.string().optional(),
  company: z.string().optional(),
  taxNumber: z.string().optional(),
  notes: z.string().optional(),
  isVip: z.boolean().default(false),
});

export const customersRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const { search, page, limit } = input;
      const offset = (page - 1) * limit;

      const whereClause = search
        ? or(
            ilike(customers.name, `%${search}%`),
            ilike(customers.phone, `%${search}%`),
            ilike(customers.email, `%${search}%`)
          )
        : undefined;

      const [data, [{ total }]] = await Promise.all([
        db
          .select()
          .from(customers)
          .where(whereClause)
          .orderBy(desc(customers.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(customers).where(whereClause),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, input.id))
        .limit(1);

      if (!customer) {
        throw new Error("Customer not found");
      }

      const customerVehicles = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.customerId, input.id));

      return { ...customer, vehicles: customerVehicles };
    }),

  create: protectedProcedure.input(customerInput).mutation(async ({ input }) => {
    const [customer] = await db.insert(customers).values(input).returning();
    return customer;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(customerInput.partial()))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [customer] = await db
        .update(customers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(customers.id, id))
        .returning();
      return customer;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(customers).where(eq(customers.id, input.id));
      return { success: true };
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      if (!input.query || input.query.length < 2) return [];

      return db
        .select({
          id: customers.id,
          name: customers.name,
          phone: customers.phone,
          email: customers.email,
        })
        .from(customers)
        .where(
          or(
            ilike(customers.name, `%${input.query}%`),
            ilike(customers.phone, `%${input.query}%`)
          )
        )
        .limit(10);
    }),
});
