import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { employees, attendance, salaryPayments } from "@/lib/db/schema";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";

const employeeInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().optional(),
  emiratesId: z.string().optional(),
  emiratesIdExpiry: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  visaNumber: z.string().optional(),
  visaExpiry: z.string().optional(),
  labourCardNumber: z.string().optional(),
  labourCardExpiry: z.string().optional(),
  joinDate: z.string(),
  contractEndDate: z.string().optional(),
  salary: z.number().positive(),
  allowances: z.number().default(0),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  iban: z.string().optional(),
  notes: z.string().optional(),
});

export const employeesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(true),
        department: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let query = db.select().from(employees).orderBy(employees.name);

      if (input.activeOnly) {
        query = query.where(eq(employees.isActive, true)) as typeof query;
      }

      if (input.department) {
        query = query.where(eq(employees.department, input.department)) as typeof query;
      }

      return query;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, input.id))
        .limit(1);

      if (!employee) {
        throw new Error("Employee not found");
      }

      return employee;
    }),

  create: protectedProcedure.input(employeeInput).mutation(async ({ input }) => {
    // Generate employee number
    const [lastEmployee] = await db
      .select({ employeeNumber: employees.employeeNumber })
      .from(employees)
      .orderBy(desc(employees.createdAt))
      .limit(1);

    const lastNumber = lastEmployee?.employeeNumber
      ? parseInt(lastEmployee.employeeNumber.replace("EMP-", ""))
      : 0;
    const employeeNumber = `EMP-${String(lastNumber + 1).padStart(4, "0")}`;

    const [employee] = await db
      .insert(employees)
      .values({
        ...input,
        employeeNumber,
        salary: input.salary.toFixed(2),
        allowances: input.allowances.toFixed(2),
      })
      .returning();
    return employee;
  }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(employeeInput.partial()))
    .mutation(async ({ input }) => {
      const { id, salary, allowances, ...data } = input;
      const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() };
      if (salary !== undefined) updateData.salary = salary.toFixed(2);
      if (allowances !== undefined) updateData.allowances = allowances.toFixed(2);

      const [employee] = await db
        .update(employees)
        .set(updateData)
        .where(eq(employees.id, id))
        .returning();
      return employee;
    }),

  getExpiringDocuments: protectedProcedure
    .input(z.object({ daysAhead: z.number().default(30) }))
    .query(async ({ input }) => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + input.daysAhead);
      const today = new Date().toISOString().split("T")[0];
      const futureDateStr = futureDate.toISOString().split("T")[0];

      const expiringDocs = await db
        .select({
          id: employees.id,
          name: employees.name,
          emiratesIdExpiry: employees.emiratesIdExpiry,
          passportExpiry: employees.passportExpiry,
          visaExpiry: employees.visaExpiry,
          labourCardExpiry: employees.labourCardExpiry,
        })
        .from(employees)
        .where(
          and(
            eq(employees.isActive, true),
            sql`(
              ${employees.emiratesIdExpiry} <= ${futureDateStr} OR
              ${employees.passportExpiry} <= ${futureDateStr} OR
              ${employees.visaExpiry} <= ${futureDateStr} OR
              ${employees.labourCardExpiry} <= ${futureDateStr}
            )`
          )
        );

      return expiringDocs;
    }),

  recordAttendance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        date: z.string(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        status: z.string().default("present"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [record] = await db
        .insert(attendance)
        .values({
          employeeId: input.employeeId,
          date: input.date,
          status: input.status,
          notes: input.notes,
          checkIn: input.checkIn ? new Date(input.checkIn) : null,
          checkOut: input.checkOut ? new Date(input.checkOut) : null,
        })
        .returning();
      return record;
    }),

  getAttendance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [
        gte(attendance.date, input.startDate),
        lte(attendance.date, input.endDate),
      ];

      if (input.employeeId) {
        conditions.push(eq(attendance.employeeId, input.employeeId));
      }

      return db
        .select()
        .from(attendance)
        .where(and(...conditions))
        .orderBy(attendance.date);
    }),

  getDepartments: protectedProcedure.query(async () => {
    const departments = await db
      .selectDistinct({ department: employees.department })
      .from(employees)
      .where(eq(employees.isActive, true));

    return departments
      .map((d) => d.department)
      .filter((d): d is string => d !== null);
  }),
});
