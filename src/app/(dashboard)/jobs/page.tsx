"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { JobStatusBadge } from "@/components/business/job-status-badge";
import {
  Plus,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Car,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusTabs = [
  { value: "", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "checked_in", label: "Checked In" },
  { value: "in_progress", label: "In Progress" },
  { value: "qc_pending", label: "QC Pending" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
];

export default function JobsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.jobs.list.useQuery({
    status: status || undefined,
    page,
    limit: 20,
  });

  const { data: statusCounts } = trpc.jobs.getByStatus.useQuery();

  const getStatusCount = (statusValue: string) => {
    if (!statusValue) return data?.pagination?.total || 0;
    return statusCounts?.find((s) => s.status === statusValue)?.count || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage vehicle service jobs
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Link>
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={status === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
            <Badge
              variant="secondary"
              className="ml-2 bg-background/50"
            >
              {getStatusCount(tab.value)}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {status ? statusTabs.find((t) => t.value === status)?.label : "All"} Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                        <Wrench className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{job.jobNumber}</span>
                          <JobStatusBadge status={job.status} />
                          {job.bayNumber && (
                            <Badge variant="outline">Bay {job.bayNumber}</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">
                          {job.customer?.name || "Unknown Customer"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {job.vehicle && (
                            <span className="flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {job.vehicle.make} {job.vehicle.model} ({job.vehicle.plateNumber})
                            </span>
                          )}
                          {job.bookingDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(job.bookingDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseFloat(job.total))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium">No jobs found</p>
              <p className="text-muted-foreground">
                {status ? "No jobs with this status" : "Create your first job to get started"}
              </p>
              {!status && (
                <Button className="mt-4" asChild>
                  <Link href="/jobs/new">Create Job</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
