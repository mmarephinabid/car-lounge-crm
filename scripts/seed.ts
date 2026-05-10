import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import * as schema from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Create admin user
  console.log("Creating admin user...");
  const hashedPassword = await hash("admin123", 12);
  const [adminUser] = await db
    .insert(schema.users)
    .values({
      email: "admin@thecarlounge.ae",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning();

  console.log(`  ✓ Admin user created: ${adminUser?.email || "already exists"}`);

  // Create demo customers
  console.log("\nCreating demo customers...");
  const customersData = [
    { name: "Ahmed Al Maktoum", phone: "+971501234567", email: "ahmed@example.com", whatsapp: "+971501234567", company: "Emirates Holdings", isVip: true },
    { name: "Sarah Johnson", phone: "+971502345678", email: "sarah.j@example.com", whatsapp: "+971502345678" },
    { name: "Mohammed Al Rashid", phone: "+971503456789", email: "m.rashid@example.com", whatsapp: "+971503456789", company: "Dubai Trading Co.", isVip: true },
    { name: "Emma Williams", phone: "+971504567890", email: "emma.w@example.com", whatsapp: "+971504567890" },
    { name: "Khalid Hassan", phone: "+971505678901", email: "khalid.h@example.com", whatsapp: "+971505678901" },
    { name: "Lisa Chen", phone: "+971506789012", email: "lisa.chen@example.com", whatsapp: "+971506789012", company: "Tech Innovations LLC" },
    { name: "Omar Sayed", phone: "+971507890123", email: "omar.s@example.com", whatsapp: "+971507890123" },
    { name: "Fatima Al Qasimi", phone: "+971508901234", email: "fatima.q@example.com", whatsapp: "+971508901234", isVip: true },
  ];

  const customers = [];
  for (const customer of customersData) {
    const [created] = await db.insert(schema.customers).values(customer).returning();
    customers.push(created);
    console.log(`  ✓ Customer: ${created.name}`);
  }

  // Create demo vehicles
  console.log("\nCreating demo vehicles...");
  const vehiclesData = [
    { customerId: customers[0].id, plateNumber: "A 12345", make: "Mercedes-Benz", model: "S-Class", year: 2024, color: "Black" },
    { customerId: customers[0].id, plateNumber: "B 98765", make: "Porsche", model: "911 Turbo", year: 2023, color: "White" },
    { customerId: customers[1].id, plateNumber: "C 54321", make: "BMW", model: "X5", year: 2023, color: "Blue" },
    { customerId: customers[2].id, plateNumber: "D 11111", make: "Rolls-Royce", model: "Ghost", year: 2024, color: "Silver" },
    { customerId: customers[3].id, plateNumber: "E 22222", make: "Range Rover", model: "Sport", year: 2023, color: "Green" },
    { customerId: customers[4].id, plateNumber: "F 33333", make: "Audi", model: "RS7", year: 2024, color: "Gray" },
    { customerId: customers[5].id, plateNumber: "G 44444", make: "Tesla", model: "Model S", year: 2024, color: "Red" },
    { customerId: customers[6].id, plateNumber: "H 55555", make: "Lamborghini", model: "Urus", year: 2023, color: "Yellow" },
    { customerId: customers[7].id, plateNumber: "I 66666", make: "Ferrari", model: "Roma", year: 2024, color: "Red" },
  ];

  const vehicles = [];
  for (const vehicle of vehiclesData) {
    const [created] = await db.insert(schema.vehicles).values(vehicle).returning();
    vehicles.push(created);
    console.log(`  ✓ Vehicle: ${created.make} ${created.model} (${created.plateNumber})`);
  }

  // Create services
  console.log("\nCreating services...");
  const servicesData = [
    { name: "Full Detail Wash", category: "Detailing", defaultPrice: "500.00", estimatedTime: 180 },
    { name: "Interior Deep Clean", category: "Detailing", defaultPrice: "350.00", estimatedTime: 120 },
    { name: "Exterior Polish", category: "Detailing", defaultPrice: "400.00", estimatedTime: 90 },
    { name: "Ceramic Coating", category: "Protection", defaultPrice: "3500.00", estimatedTime: 480 },
    { name: "Paint Protection Film", category: "Protection", defaultPrice: "5000.00", estimatedTime: 960 },
    { name: "Window Tinting", category: "Accessories", defaultPrice: "800.00", estimatedTime: 180 },
    { name: "Headlight Restoration", category: "Restoration", defaultPrice: "300.00", estimatedTime: 60 },
    { name: "Leather Conditioning", category: "Interior", defaultPrice: "250.00", estimatedTime: 45 },
    { name: "Engine Bay Cleaning", category: "Detailing", defaultPrice: "200.00", estimatedTime: 60 },
    { name: "Odor Removal", category: "Interior", defaultPrice: "150.00", estimatedTime: 90 },
  ];

  const services = [];
  for (const service of servicesData) {
    const [created] = await db.insert(schema.services).values(service).returning();
    services.push(created);
    console.log(`  ✓ Service: ${created.name} (AED ${created.defaultPrice})`);
  }

  // Create demo jobs
  console.log("\nCreating demo jobs...");
  const jobStatuses = ["booked", "checked_in", "in_progress", "qc_pending", "ready", "delivered"];

  for (let i = 0; i < 15; i++) {
    const customer = customers[i % customers.length];
    const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
    const vehicle = customerVehicles[0] || vehicles[i % vehicles.length];
    const status = jobStatuses[i % jobStatuses.length];
    const service = services[i % services.length];

    const subtotal = parseFloat(service.defaultPrice);
    const vatAmount = subtotal * 0.05;
    const total = subtotal + vatAmount;

    const [job] = await db.insert(schema.jobs).values({
      jobNumber: `JOB-${String(i + 1).padStart(6, "0")}`,
      customerId: customer.id,
      vehicleId: vehicle.id,
      status,
      bayNumber: (i % 6) + 1,
      subtotal: subtotal.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: total.toFixed(2),
      bookingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      checkInDate: status !== "booked" ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
    }).returning();

    // Add job service
    await db.insert(schema.jobServices).values({
      jobId: job.id,
      serviceId: service.id,
      name: service.name,
      quantity: 1,
      unitPrice: service.defaultPrice,
      discount: "0.00",
      total: service.defaultPrice,
      isCompleted: status === "ready" || status === "delivered",
    });

    console.log(`  ✓ Job: ${job.jobNumber} - ${service.name} for ${customer.name} (${status})`);

    // Create invoice for delivered jobs
    if (status === "delivered") {
      const [invoice] = await db.insert(schema.invoices).values({
        invoiceNumber: `INV-${String(i + 1).padStart(6, "0")}`,
        customerId: customer.id,
        jobId: job.id,
        status: "paid",
        subtotal: subtotal.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        paidAmount: total.toFixed(2),
        balanceDue: "0.00",
        paidDate: new Date(),
      }).returning();

      await db.insert(schema.payments).values({
        invoiceId: invoice.id,
        amount: total.toFixed(2),
        method: ["cash", "card", "bank_transfer"][i % 3],
      });

      console.log(`    ✓ Invoice: ${invoice.invoiceNumber} (PAID)`);
    }
  }

  // Create demo employees
  console.log("\nCreating demo employees...");
  const employeesData = [
    { employeeNumber: "EMP-0001", name: "Ali Hassan", phone: "+971509876543", position: "Senior Detailer", department: "Operations", salary: "8000.00", joinDate: "2022-01-15" },
    { employeeNumber: "EMP-0002", name: "Raj Kumar", phone: "+971508765432", position: "Detailer", department: "Operations", salary: "5000.00", joinDate: "2023-03-01" },
    { employeeNumber: "EMP-0003", name: "John Smith", phone: "+971507654321", position: "QC Specialist", department: "Quality", salary: "7000.00", joinDate: "2022-06-01" },
    { employeeNumber: "EMP-0004", name: "Maria Garcia", phone: "+971506543210", position: "Receptionist", department: "Front Desk", salary: "4500.00", joinDate: "2023-01-10" },
    { employeeNumber: "EMP-0005", name: "Hassan Al Mahmoud", phone: "+971505432109", position: "Manager", department: "Management", salary: "15000.00", joinDate: "2021-09-01" },
  ];

  for (const emp of employeesData) {
    const [created] = await db.insert(schema.employees).values({
      ...emp,
      allowances: "1000.00",
    }).returning();
    console.log(`  ✓ Employee: ${created.name} (${created.position})`);
  }

  // Create demo products
  console.log("\nCreating demo products...");
  const productsData = [
    { sku: "CHM-001", name: "Premium Car Shampoo", category: "Chemicals", costPrice: "50.00", sellingPrice: "80.00", stockQuantity: 25 },
    { sku: "CHM-002", name: "Ceramic Spray Coating", category: "Chemicals", costPrice: "120.00", sellingPrice: "200.00", stockQuantity: 15 },
    { sku: "CHM-003", name: "Interior Cleaner", category: "Chemicals", costPrice: "35.00", sellingPrice: "60.00", stockQuantity: 30 },
    { sku: "CHM-004", name: "Leather Conditioner", category: "Chemicals", costPrice: "80.00", sellingPrice: "130.00", stockQuantity: 20 },
    { sku: "TOL-001", name: "Microfiber Towels (10-pack)", category: "Tools", costPrice: "40.00", sellingPrice: "70.00", stockQuantity: 50 },
    { sku: "TOL-002", name: "Polishing Pads Set", category: "Tools", costPrice: "100.00", sellingPrice: "160.00", stockQuantity: 10 },
    { sku: "ACC-001", name: "Air Freshener Premium", category: "Accessories", costPrice: "15.00", sellingPrice: "35.00", stockQuantity: 100 },
    { sku: "ACC-002", name: "Car Perfume", category: "Accessories", costPrice: "25.00", sellingPrice: "50.00", stockQuantity: 60 },
  ];

  for (const product of productsData) {
    const [created] = await db.insert(schema.products).values({
      ...product,
      minStockLevel: 5,
      reorderPoint: 10,
    }).returning();
    console.log(`  ✓ Product: ${created.name} (Stock: ${created.stockQuantity})`);
  }

  // Create expense categories
  console.log("\nCreating expense categories...");
  const expenseCategoriesData = [
    { name: "Rent" },
    { name: "Utilities" },
    { name: "Supplies" },
    { name: "Marketing" },
    { name: "Maintenance" },
    { name: "Staff Welfare" },
  ];

  for (const category of expenseCategoriesData) {
    await db.insert(schema.expenseCategories).values(category);
    console.log(`  ✓ Expense Category: ${category.name}`);
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📝 Demo Login Credentials:");
  console.log("   Email: admin@thecarlounge.ae");
  console.log("   Password: admin123\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
