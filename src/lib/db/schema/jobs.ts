import { pgTable, text, timestamp, varchar, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { vehicles } from "./vehicles";
import { users } from "./users";

export const jobStatuses = [
  "draft",
  "booked",
  "checked_in",
  "in_progress",
  "qc_pending",
  "qc_passed",
  "ready",
  "delivered",
  "cancelled",
] as const;

export type JobStatus = typeof jobStatuses[number];

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobNumber: varchar("job_number", { length: 50 }).notNull().unique(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id),
  assignedTo: text("assigned_to").references(() => users.id),
  bayNumber: integer("bay_number"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),

  // Dates
  bookingDate: timestamp("booking_date"),
  checkInDate: timestamp("check_in_date"),
  estimatedCompletion: timestamp("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  deliveryDate: timestamp("delivery_date"),

  // Pricing
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),

  // Notes
  customerNotes: text("customer_notes"),
  internalNotes: text("internal_notes"),

  // QC
  qcCheckedBy: text("qc_checked_by").references(() => users.id),
  qcCheckedAt: timestamp("qc_checked_at"),
  qcNotes: text("qc_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobServices = pgTable("job_services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  serviceId: text("service_id").references(() => services.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  defaultPrice: numeric("default_price", { precision: 12, scale: 2 }).notNull(),
  estimatedTime: integer("estimated_time"), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobService = typeof jobServices.$inferSelect;
export type Service = typeof services.$inferSelect;
