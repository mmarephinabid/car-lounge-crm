import { router } from "./init";
import { dashboardRouter } from "./routers/dashboard";
import { customersRouter } from "./routers/customers";
import { vehiclesRouter } from "./routers/vehicles";
import { jobsRouter } from "./routers/jobs";
import { servicesRouter } from "./routers/services";
import { invoicesRouter } from "./routers/invoices";
import { employeesRouter } from "./routers/employees";
import { inventoryRouter } from "./routers/inventory";

export const appRouter = router({
  dashboard: dashboardRouter,
  customers: customersRouter,
  vehicles: vehiclesRouter,
  jobs: jobsRouter,
  services: servicesRouter,
  invoices: invoicesRouter,
  employees: employeesRouter,
  inventory: inventoryRouter,
});

export type AppRouter = typeof appRouter;
