import { pgTable, text, timestamp, varchar, numeric, date, boolean } from "drizzle-orm/pg-core";
import { suppliers } from "./suppliers";

export const expenseCategories = pgTable("expense_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => expenseCategories.id),
  supplierId: text("supplier_id").references(() => suppliers.id),
  purchaseOrderId: text("purchase_order_id"),

  description: varchar("description", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

  expenseDate: date("expense_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  reference: varchar("reference", { length: 255 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }),

  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringFrequency: varchar("recurring_frequency", { length: 50 }), // monthly, quarterly, yearly

  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
