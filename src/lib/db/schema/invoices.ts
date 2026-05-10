import { pgTable, text, timestamp, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { jobs } from "./jobs";

export const invoiceStatuses = ["draft", "sent", "paid", "partial", "overdue", "cancelled"] as const;
export type InvoiceStatus = typeof invoiceStatuses[number];

export const paymentMethods = ["cash", "card", "bank_transfer", "online", "cheque"] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  jobId: text("job_id").references(() => jobs.id),
  status: varchar("status", { length: 50 }).notNull().default("draft"),

  // Amounts
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull().default("5"),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  balanceDue: numeric("balance_due", { precision: 12, scale: 2 }).notNull().default("0"),

  // Dates
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),

  notes: text("notes"),
  paymentLink: text("payment_link"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Payment = typeof payments.$inferSelect;
