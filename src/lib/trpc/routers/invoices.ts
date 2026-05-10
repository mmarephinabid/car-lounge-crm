import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { invoices, payments, customers, jobs } from "@/lib/db/schema";
import { eq, desc, count, sql, and, or } from "drizzle-orm";

export const invoicesRouter = router({
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

      const whereClause = status ? eq(invoices.status, status) : undefined;

      const [data, [{ total }]] = await Promise.all([
        db
          .select({
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
            status: invoices.status,
            total: invoices.total,
            paidAmount: invoices.paidAmount,
            balanceDue: invoices.balanceDue,
            issueDate: invoices.issueDate,
            dueDate: invoices.dueDate,
            customer: {
              id: customers.id,
              name: customers.name,
            },
          })
          .from(invoices)
          .leftJoin(customers, eq(invoices.customerId, customers.id))
          .where(whereClause)
          .orderBy(desc(invoices.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(invoices).where(whereClause),
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
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.id))
        .limit(1);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, invoice.customerId))
        .limit(1);

      const invoicePayments = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, input.id))
        .orderBy(desc(payments.receivedAt));

      let job = null;
      if (invoice.jobId) {
        [job] = await db
          .select()
          .from(jobs)
          .where(eq(jobs.id, invoice.jobId))
          .limit(1);
      }

      return { ...invoice, customer, job, payments: invoicePayments };
    }),

  createFromJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, input.jobId))
        .limit(1);

      if (!job) {
        throw new Error("Job not found");
      }

      // Generate invoice number
      const [lastInvoice] = await db
        .select({ invoiceNumber: invoices.invoiceNumber })
        .from(invoices)
        .orderBy(desc(invoices.createdAt))
        .limit(1);

      const lastNumber = lastInvoice?.invoiceNumber
        ? parseInt(lastInvoice.invoiceNumber.replace("INV-", ""))
        : 0;
      const invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, "0")}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const [invoice] = await db
        .insert(invoices)
        .values({
          invoiceNumber,
          customerId: job.customerId,
          jobId: job.id,
          subtotal: job.subtotal,
          vatAmount: job.vatAmount,
          total: job.total,
          balanceDue: job.total,
          dueDate,
        })
        .returning();

      return invoice;
    }),

  recordPayment: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        method: z.string(),
        reference: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Create payment record
      await db.insert(payments).values({
        invoiceId: input.invoiceId,
        amount: input.amount.toFixed(2),
        method: input.method,
        reference: input.reference,
        notes: input.notes,
      });

      // Update invoice
      const newPaidAmount = parseFloat(invoice.paidAmount) + input.amount;
      const newBalanceDue = parseFloat(invoice.total) - newPaidAmount;
      const newStatus =
        newBalanceDue <= 0 ? "paid" : newPaidAmount > 0 ? "partial" : invoice.status;

      const [updatedInvoice] = await db
        .update(invoices)
        .set({
          paidAmount: newPaidAmount.toFixed(2),
          balanceDue: Math.max(0, newBalanceDue).toFixed(2),
          status: newStatus,
          paidDate: newStatus === "paid" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      return updatedInvoice;
    }),

  getOverdue: protectedProcedure.query(async () => {
    const overdueInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        total: invoices.total,
        balanceDue: invoices.balanceDue,
        dueDate: invoices.dueDate,
        customer: {
          id: customers.id,
          name: customers.name,
          phone: customers.phone,
        },
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          or(eq(invoices.status, "sent"), eq(invoices.status, "partial")),
          sql`${invoices.dueDate} < NOW()`
        )
      )
      .orderBy(invoices.dueDate);

    return overdueInvoices;
  }),
});
