import { pgTable, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { customers } from "./customers";

export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  plateNumber: varchar("plate_number", { length: 50 }).notNull(),
  plateEmirate: varchar("plate_emirate", { length: 50 }).notNull().default("Dubai"),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year"),
  color: varchar("color", { length: 50 }),
  vin: varchar("vin", { length: 50 }),
  mileage: integer("mileage"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
