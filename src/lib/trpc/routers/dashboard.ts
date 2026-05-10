import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { jobs, invoices, customers, employees, products } from "@/lib/db/schema";
import { sql, eq, gte, and, count } from "drizzle-orm";

export const dashboardRouter = router({
  getStats: protectedProcedure.query(async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total revenue this month
    const [revenueResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, "paid"),
          gte(invoices.paidDate, startOfMonth)
        )
      );

    // Active jobs count
    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(
        sql`${jobs.status} NOT IN ('delivered', 'cancelled', 'draft')`
      );

    // Total customers
    const [customersResult] = await db
      .select({ count: count() })
      .from(customers);

    // Pending invoices
    const [pendingInvoicesResult] = await db
      .select({
        count: count(),
        total: sql<string>`COALESCE(SUM(${invoices.balanceDue}), 0)`,
      })
      .from(invoices)
      .where(
        sql`${invoices.status} IN ('sent', 'partial', 'overdue')`
      );

    // Jobs this month
    const [jobsThisMonthResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(gte(jobs.createdAt, startOfMonth));

    // Low stock products
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(products)
      .where(
        sql`${products.stockQuantity} <= ${products.minStockLevel}`
      );

    return {
      revenue: parseFloat(revenueResult?.total || "0"),
      activeJobs: activeJobsResult?.count || 0,
      totalCustomers: customersResult?.count || 0,
      pendingInvoices: {
        count: pendingInvoicesResult?.count || 0,
        amount: parseFloat(pendingInvoicesResult?.total || "0"),
      },
      jobsThisMonth: jobsThisMonthResult?.count || 0,
      lowStockItems: lowStockResult?.count || 0,
    };
  }),

  getRecentJobs: protectedProcedure.query(async () => {
    const recentJobs = await db
      .select({
        id: jobs.id,
        jobNumber: jobs.jobNumber,
        status: jobs.status,
        total: jobs.total,
        createdAt: jobs.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
      })
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .orderBy(sql`${jobs.createdAt} DESC`)
      .limit(5);

    return recentJobs;
  }),

  getRevenueChart: protectedProcedure.query(async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(${invoices.paidDate}, 'YYYY-MM')`,
        revenue: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, "paid"),
          gte(invoices.paidDate, sixMonthsAgo)
        )
      )
      .groupBy(sql`TO_CHAR(${invoices.paidDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${invoices.paidDate}, 'YYYY-MM')`);

    return monthlyRevenue.map((row) => ({
      month: row.month,
      revenue: parseFloat(row.revenue),
    }));
  }),

  getJobsByStatus: protectedProcedure.query(async () => {
    const jobsByStatus = await db
      .select({
        status: jobs.status,
        count: count(),
      })
      .from(jobs)
      .groupBy(jobs.status);

    return jobsByStatus;
  }),
});
