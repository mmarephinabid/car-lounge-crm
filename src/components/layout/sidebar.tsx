"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Users,
  Wrench,
  FileText,
  Package,
  UserCog,
  ShoppingCart,
  DollarSign,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, isMvp: false },
  { name: "Jobs", href: "/jobs", icon: Wrench, isMvp: false },
  { name: "Customers", href: "/customers", icon: Users, isMvp: false },
  { name: "Vehicles", href: "/vehicles", icon: Car, isMvp: true },
  { name: "Invoices", href: "/invoices", icon: FileText, isMvp: false },
  { name: "Services", href: "/services", icon: DollarSign, isMvp: false },
  { name: "Inventory", href: "/inventory", icon: Package, isMvp: false },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart, isMvp: true },
  { name: "Employees", href: "/employees", icon: UserCog, isMvp: false },
  { name: "Calendar", href: "/calendar", icon: Calendar, isMvp: true },
  { name: "Settings", href: "/settings", icon: Settings, isMvp: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="h-5 w-5" />
            </div>
            <span className="font-bold text-sidebar-foreground">
              The Car Lounge
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="flex items-center gap-2">
                  {item.name}
                  {item.isMvp && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      MVP
                    </span>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            The Car Lounge CRM
          </p>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            MVP Demo Version
          </p>
        </div>
      )}
    </aside>
  );
}
