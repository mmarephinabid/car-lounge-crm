import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { vehicles, customers } from "@/lib/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

const vehicleInput = z.object({
  customerId: z.string().min(1, "Customer is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  plateEmirate: z.string().default("Dubai"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().optional(),
  notes: z.string().optional(),
});

export const vehiclesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        customerId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = db
        .select({
          id: vehicles.id,
          plateNumber: vehicles.plateNumber,
          plateEmirate: vehicles.plateEmirate,
          make: vehicles.make,
          model: vehicles.model,
          year: vehicles.year,
          color: vehicles.color,
          customer: {
            id: customers.id,
            name: customers.name,
          },
        })
        .from(vehicles)
        .leftJoin(customers, eq(vehicles.customerId, customers.id))
        .orderBy(desc(vehicles.createdAt));

      if (input.customerId) {
        query = query.where(eq(vehicles.customerId, input.customerId)) as typeof query;
      }

      if (input.search) {
        query = query.where(
          or(
            ilike(vehicles.plateNumber, `%${input.search}%`),
            ilike(vehicles.make, `%${input.search}%`),
            ilike(vehicles.model, `%${input.search}%`)
          )
        ) as typeof query;
      }

      return query;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, input.id))
        .limit(1);

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, vehicle.customerId))
        .limit(1);

      return { ...vehicle, customer };
    }),

  create: protectedProcedure.input(vehicleInput).mutation(async ({ input }) => {
    const [vehicle] = await db.insert(vehicles).values(input).returning();
    return vehicle;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(vehicleInput.partial()))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [vehicle] = await db
        .update(vehicles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(vehicles.id, id))
        .returning();
      return vehicle;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(vehicles).where(eq(vehicles.id, input.id));
      return { success: true };
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      if (!input.query || input.query.length < 2) return [];

      return db
        .select({
          id: vehicles.id,
          plateNumber: vehicles.plateNumber,
          make: vehicles.make,
          model: vehicles.model,
          customerId: vehicles.customerId,
        })
        .from(vehicles)
        .where(
          or(
            ilike(vehicles.plateNumber, `%${input.query}%`),
            ilike(vehicles.make, `%${input.query}%`),
            ilike(vehicles.model, `%${input.query}%`)
          )
        )
        .limit(10);
    }),
});
