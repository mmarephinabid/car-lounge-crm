import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { jobs, jobServices, customers, vehicles, services } from "@/lib/db/schema";
import { eq, desc, count, sql, and, inArray } from "drizzle-orm";

const jobInput = z.object({
  customerId: z.string().min(1, "Customer is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  assignedTo: z.string().optional(),
  bayNumber: z.number().optional(),
  bookingDate: z.date().optional(),
  estimatedCompletion: z.date().optional(),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  services: z.array(
    z.object({
      serviceId: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      quantity: z.number().default(1),
      unitPrice: z.number(),
      discount: z.number().default(0),
    })
  ).optional(),
});

export const jobsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const { status, page, limit } = input;
      const offset = (page - 1) * limit;

      const whereClause = status ? eq(jobs.status, status) : undefined;

      const [data, [{ total }]] = await Promise.all([
        db
          .select({
            id: jobs.id,
            jobNumber: jobs.jobNumber,
            status: jobs.status,
            total: jobs.total,
            bayNumber: jobs.bayNumber,
            bookingDate: jobs.bookingDate,
            estimatedCompletion: jobs.estimatedCompletion,
            createdAt: jobs.createdAt,
            customer: {
              id: customers.id,
              name: customers.name,
              phone: customers.phone,
            },
            vehicle: {
              id: vehicles.id,
              make: vehicles.make,
              model: vehicles.model,
              plateNumber: vehicles.plateNumber,
            },
          })
          .from(jobs)
          .leftJoin(customers, eq(jobs.customerId, customers.id))
          .leftJoin(vehicles, eq(jobs.vehicleId, vehicles.id))
          .where(whereClause)
          .orderBy(desc(jobs.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(jobs).where(whereClause),
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
      const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, input.id))
        .limit(1);

      if (!job) {
        throw new Error("Job not found");
      }

      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, job.customerId))
        .limit(1);

      const [vehicle] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, job.vehicleId))
        .limit(1);

      const jobServicesList = await db
        .select()
        .from(jobServices)
        .where(eq(jobServices.jobId, input.id));

      return { ...job, customer, vehicle, services: jobServicesList };
    }),

  create: protectedProcedure.input(jobInput).mutation(async ({ input }) => {
    const { services: servicesList, ...jobData } = input;

    // Generate job number
    const [lastJob] = await db
      .select({ jobNumber: jobs.jobNumber })
      .from(jobs)
      .orderBy(desc(jobs.createdAt))
      .limit(1);

    const lastNumber = lastJob?.jobNumber
      ? parseInt(lastJob.jobNumber.replace("JOB-", ""))
      : 0;
    const jobNumber = `JOB-${String(lastNumber + 1).padStart(6, "0")}`;

    // Calculate totals
    let subtotal = 0;
    if (servicesList) {
      for (const service of servicesList) {
        const lineTotal = service.quantity * service.unitPrice - service.discount;
        subtotal += lineTotal;
      }
    }
    const vatRate = 0.05;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    const [job] = await db
      .insert(jobs)
      .values({
        ...jobData,
        jobNumber,
        subtotal: subtotal.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
      })
      .returning();

    // Insert services
    if (servicesList && servicesList.length > 0) {
      for (const service of servicesList) {
        const lineTotal = service.quantity * service.unitPrice - service.discount;
        await db.insert(jobServices).values({
          jobId: job.id,
          serviceId: service.serviceId || null,
          name: service.name,
          description: service.description,
          quantity: service.quantity,
          unitPrice: service.unitPrice.toFixed(2),
          discount: service.discount.toFixed(2),
          total: lineTotal.toFixed(2),
        });
      }
    }

    return job;
  }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "checked_in") {
        updates.checkInDate = new Date();
      } else if (input.status === "delivered") {
        updates.deliveryDate = new Date();
        updates.actualCompletion = new Date();
      }

      const [job] = await db
        .update(jobs)
        .set(updates)
        .where(eq(jobs.id, input.id))
        .returning();

      return job;
    }),

  getByStatus: protectedProcedure.query(async () => {
    const statusGroups = await db
      .select({
        status: jobs.status,
        count: count(),
      })
      .from(jobs)
      .groupBy(jobs.status);

    return statusGroups;
  }),

  getBayUtilization: protectedProcedure.query(async () => {
    const activeBays = await db
      .select({
        bayNumber: jobs.bayNumber,
        jobId: jobs.id,
        jobNumber: jobs.jobNumber,
        status: jobs.status,
      })
      .from(jobs)
      .where(
        and(
          sql`${jobs.bayNumber} IS NOT NULL`,
          sql`${jobs.status} NOT IN ('delivered', 'cancelled')`
        )
      );

    return activeBays;
  }),
});
