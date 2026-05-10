import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AlertTriangle, Mail } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {/* MVP Notice Banner */}
        <div className="border-b border-amber-500/30 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 px-6 py-3 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-amber-950/30">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              <span className="font-bold">MVP Demo:</span> This is a demo version. To get full access,{" "}
              <a
                href="mailto:contact@thecarlounge.ae?subject=Full%20Access%20Request"
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100"
              >
                <Mail className="h-3 w-3" />
                make a deal with us
              </a>
            </p>
          </div>
        </div>
        <main className="flex-1 overflow-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}
