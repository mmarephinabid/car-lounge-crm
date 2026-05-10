import { pgTable, text, timestamp, varchar, numeric, boolean, date } from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: text("address"),
  taxNumber: varchar("tax_number", { length: 50 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, sent, partial, received, cancelled

  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),

  orderDate: date("order_date").notNull(),
  expectedDate: date("expected_date"),
  receivedDate: date("received_date"),

  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: text("product_id"),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  receivedQuantity: numeric("received_quantity", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
