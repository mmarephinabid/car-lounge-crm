import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  address: text("address"),
  emiratesId: varchar("emirates_id", { length: 50 }),
  company: varchar("company", { length: 255 }),
  taxNumber: varchar("tax_number", { length: 50 }),
  notes: text("notes"),
  isVip: boolean("is_vip").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
