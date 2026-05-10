"use client";

import { trpc } from "@/lib/trpc/client";
import { KPICard } from "@/components/business/kpi-card";
import { JobStatusBadge } from "@/components/business/job-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Wrench,
  Users,
  FileText,
  Package,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#a4de6c"];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: recentJobs, isLoading: jobsLoading } = trpc.dashboard.getRecentJobs.useQuery();
  const { data: revenueData } = trpc.dashboard.getRevenueChart.useQuery();
  const { data: jobsByStatus } = trpc.dashboard.getJobsByStatus.useQuery();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(stats?.revenue || 0)}
          description="This month"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Active Jobs"
          value={stats?.activeJobs || 0}
          description="Currently in progress"
          icon={Wrench}
        />
        <KPICard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          description="All time"
          icon={Users}
        />
        <KPICard
          title="Pending Invoices"
          value={stats?.pendingInvoices?.count || 0}
          description={`${formatCurrency(stats?.pendingInvoices?.amount || 0)} outstanding`}
          icon={FileText}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Jobs This Month"
          value={stats?.jobsThisMonth || 0}
          icon={Wrench}
        />
        <KPICard
          title="Low Stock Items"
          value={stats?.lowStockItems || 0}
          description={stats?.lowStockItems && stats.lowStockItems > 0 ? "Needs attention" : "All good"}
          icon={stats?.lowStockItems && stats.lowStockItems > 0 ? AlertTriangle : Package}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {jobsByStatus && jobsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {jobsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No job data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : recentJobs && recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.jobNumber}</span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {job.customer?.name || "Unknown Customer"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(parseFloat(job.total))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No jobs yet</p>
              <Button className="mt-4" asChild>
                <Link href="/jobs/new">Create your first job</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
