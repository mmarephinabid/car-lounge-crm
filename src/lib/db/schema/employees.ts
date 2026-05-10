import { pgTable, text, timestamp, varchar, numeric, date, boolean } from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeNumber: varchar("employee_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }),

  // UAE Documents
  emiratesId: varchar("emirates_id", { length: 50 }),
  emiratesIdExpiry: date("emirates_id_expiry"),
  passportNumber: varchar("passport_number", { length: 50 }),
  passportExpiry: date("passport_expiry"),
  visaNumber: varchar("visa_number", { length: 50 }),
  visaExpiry: date("visa_expiry"),
  labourCardNumber: varchar("labour_card_number", { length: 50 }),
  labourCardExpiry: date("labour_card_expiry"),

  // Employment
  joinDate: date("join_date").notNull(),
  contractEndDate: date("contract_end_date"),
  salary: numeric("salary", { precision: 12, scale: 2 }).notNull(),
  allowances: numeric("allowances", { precision: 12, scale: 2 }).notNull().default("0"),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccount: varchar("bank_account", { length: 50 }),
  iban: varchar("iban", { length: 50 }),

  // Status
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: varchar("status", { length: 50 }).notNull().default("present"), // present, absent, late, half_day, leave
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const salaryPayments = pgTable("salary_payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: text("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }).notNull(),
  allowances: numeric("allowances", { precision: 12, scale: 2 }).notNull().default("0"),
  deductions: numeric("deductions", { precision: 12, scale: 2 }).notNull().default("0"),
  netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at"),
  wpsReference: varchar("wps_reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type SalaryPayment = typeof salaryPayments.$inferSelect;
